import { classifyRepository } from '../classification/engine';
import 'server-only';
import { getSupabaseAdmin } from './server';
import { GitHubRepository } from '@/lib/github/types';

/**
 * Synchronizes a GitHub repository into the Supabase database.
 * This function is idempotent: it will safely update existing records 
 * or insert new ones without duplicating data.
 */
export async function syncRepositoryToDatabase(repo: GitHubRepository): Promise<string> {
  // 1. Prepare the repository data payload
  const repoData = {
    github_id: repo.id,
    full_name: repo.full_name,
    name: repo.name,
    owner_login: repo.owner.login,
    owner_avatar_url: repo.owner.avatar_url,
    description: repo.description || null,
    language: repo.language || null,
    topics: repo.topics || [],
    stars_count: repo.stargazers_count,
    forks_count: repo.forks_count,
    issues_count: repo.open_issues_count,
    github_created_at: repo.created_at,
    github_updated_at: repo.updated_at,
    github_pushed_at: repo.pushed_at,
    license_spdx: repo.license?.spdx_id || null,
    is_archived: repo.archived,
    last_synced_at: new Date().toISOString(),
  };

  // 2. Upsert the Repository
  // If github_id already exists, we update all metrics and metadata to keep it fresh.
  const { data: upsertedRepo, error: repoError } = await getSupabaseAdmin()
    .from('repositories')
    .upsert([repoData], { 
      onConflict: 'github_id',
      ignoreDuplicates: false // We want to update existing rows
    })
    .select('id')
    .single();

  if (repoError || !upsertedRepo) {
    console.error(`Failed to upsert repository ${repo.full_name}:`, repoError?.message);
    throw new Error(`Database Error: ${repoError?.message}`);
  }

  const internalRepoId = upsertedRepo.id;
  const today = new Date().toISOString().split('T')[0]; // Format: YYYY-MM-DD

  // 3. Upsert the Daily Snapshot
  // The UNIQUE(repository_id, snapshot_date) constraint ensures only one snapshot per day.
  const snapshotData = {
    repository_id: internalRepoId,
    snapshot_date: today,
    stars_count: repo.stargazers_count,
    forks_count: repo.forks_count,
  };

  const { error: snapshotError } = await getSupabaseAdmin()
    .from('repository_snapshots')
    .upsert([snapshotData], {
      onConflict: 'repository_id, snapshot_date',
      ignoreDuplicates: false // Update today's snapshot if it already exists to reflect latest counts
    });

  if (snapshotError) {
    throw new Error(`Snapshot sync failed for ${repo.full_name}`);
  }
  // 4. Run Domain Classification
  const classifications = classifyRepository(repo.description, repo.topics, repo.language);
  
  if (classifications.length > 0) {
    // Fetch internal Domain UUIDs based on slugs
    const slugs = classifications.map((c) => c.domainSlug);
    const { data: domains, error: domainError } = await getSupabaseAdmin()
      .from('domains')
      .select('id, slug')
      .in('slug', slugs);

    if (domainError || !domains || domains.length !== slugs.length) {
      throw new Error(`Domain lookup failed for ${repo.full_name}; check domain seeds.`);
    }

    if (domains && domains.length > 0) {
      // Create join table records
      const domainLinks = domains.map((domain) => ({
        repository_id: internalRepoId,
        domain_id: domain.id
      }));

      // Upsert the relationships
      const { error: linkError } = await getSupabaseAdmin()
        .from('repository_domains')
        .upsert(domainLinks, { onConflict: 'repository_id, domain_id' });

      if (linkError) {
        throw new Error(`Domain sync failed for ${repo.full_name}`);
      }

      const { error: cleanupError } = await getSupabaseAdmin().from('repository_domains')
        .delete().eq('repository_id', internalRepoId).not('domain_id', 'in', `(${domains.map(domain => domain.id).join(',')})`);
      if (cleanupError) throw new Error(`Domain cleanup failed for ${repo.full_name}`);
    }
  } else {
    const { error } = await getSupabaseAdmin().from('repository_domains').delete().eq('repository_id', internalRepoId);
    if (error) throw new Error(`Domain cleanup failed for ${repo.full_name}`);
  }
  return internalRepoId;
}
