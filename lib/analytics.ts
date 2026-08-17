import 'server-only';
import { supabaseAdmin } from './supabase/server';
import { calculateTrendingScore, isHiddenGem, RepoMetrics } from './scoring';
import { RepositoryWithStats } from '@/types/repository';

/**
 * Helper to calculate days between two dates
 */
function getDaysSince(dateString: string): number {
  const diffTime = Math.abs(new Date().getTime() - new Date(dateString).getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Fetches repositories and their latest snapshots to calculate growth.
 * In a fully scaled production environment, this would be a Materialized View in PostgreSQL.
 * For this implementation, we calculate it dynamically on the server.
 */
export async function getRankedRepositories(): Promise<RepositoryWithStats[]> {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayString = yesterday.toISOString().split('T')[0];

  // Fetch repos and join with yesterday's snapshot
  const { data, error } = await supabaseAdmin
    .from('repositories')
    .select(`
      *,
      repository_snapshots (
        stars_count,
        forks_count,
        snapshot_date
      )
    `)
    .eq('repository_snapshots.snapshot_date', yesterdayString);

  if (error || !data) {
    console.error('Failed to fetch analytics data:', error?.message);
    return [];
  }

  // 1. Define the exact shape we expect back from the database join
  type JoinedRepo = RepositoryWithStats & {
    repository_snapshots: {
      stars_count: number;
      forks_count: number;
      snapshot_date: string;
    }[];
  };

  // 2. Safely cast the data bypassing Supabase's internal relationship errors
  const typedData = data as unknown as JoinedRepo[];

  // 3. Map over the cleanly typed data
  const processedData: RepositoryWithStats[] = typedData.map((repo) => {
    const snapshot = repo.repository_snapshots[0];
    
    const starsGained24h = snapshot ? repo.stars_count - snapshot.stars_count : 0;
    const forksGained24h = snapshot ? repo.forks_count - snapshot.forks_count : 0;
    
    const metrics: RepoMetrics = {
      totalStars: repo.stars_count,
      totalForks: repo.forks_count,
      starsGained24h: Math.max(starsGained24h, 0), // Prevent negative growth anomalies
      forksGained24h: Math.max(forksGained24h, 0),
      daysSinceLastPush: getDaysSince(repo.github_pushed_at),
    };

    return {
      ...repo,
      stars_gained_24h: metrics.starsGained24h,
      trending_score: calculateTrendingScore(metrics),
      is_hidden_gem: isHiddenGem(metrics)
    };
  });

  return processedData;
}

// --- Ranking Extractors ---

export async function getTrendingToday(limit = 10): Promise<RepositoryWithStats[]> {
  const repos = await getRankedRepositories();
  return repos.sort((a, b) => (b.trending_score || 0) - (a.trending_score || 0)).slice(0, limit);
}

export async function getMostStarredToday(limit = 10): Promise<RepositoryWithStats[]> {
  const repos = await getRankedRepositories();
  return repos.sort((a, b) => (b.stars_gained_24h || 0) - (a.stars_gained_24h || 0)).slice(0, limit);
}

export async function getHiddenGems(limit = 10): Promise<RepositoryWithStats[]> {
  const repos = await getRankedRepositories();
  // `is_hidden_gem` is populated in the mapping above (see getRankedRepositories)
  return repos
    .filter((r) => r.is_hidden_gem)
    .sort((a, b) => (b.trending_score || 0) - (a.trending_score || 0))
    .slice(0, limit);
}

export async function getRecentlyUpdated(limit = 10): Promise<RepositoryWithStats[]> {
  const { data } = await supabaseAdmin
    .from('repositories')
    .select('*')
    .order('github_pushed_at', { ascending: false })
    .limit(limit);
    
  return data as unknown as RepositoryWithStats[] || [];
}
export async function getPopularByDomain(domainSlug: string, limit = 10): Promise<RepositoryWithStats[]> {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayString = yesterday.toISOString().split('T')[0];

  // We perform an inner join through the repository_domains table
  const { data, error } = await supabaseAdmin
    .from('repositories')
    .select(`
      *,
      repository_snapshots (
        stars_count,
        forks_count,
        snapshot_date
      ),
      repository_domains!inner (
        domains!inner (
          slug
        )
      )
    `)
    .eq('repository_snapshots.snapshot_date', yesterdayString)
    .eq('repository_domains.domains.slug', domainSlug);

  if (error || !data) {
    console.error(`Failed to fetch repos for domain ${domainSlug}:`, error?.message);
    return [];
  }

  // Reuse our strict type casting logic from before
  type JoinedRepo = RepositoryWithStats & {
    repository_snapshots: { stars_count: number; forks_count: number; snapshot_date: string }[];
  };

  const typedData = data as unknown as JoinedRepo[];

  const processedData: RepositoryWithStats[] = typedData.map((repo) => {
    const snapshot = repo.repository_snapshots[0];
    const starsGained24h = snapshot ? repo.stars_count - snapshot.stars_count : 0;
    const forksGained24h = snapshot ? repo.forks_count - snapshot.forks_count : 0;
    
    const metrics: RepoMetrics = {
      totalStars: repo.stars_count,
      totalForks: repo.forks_count,
      starsGained24h: Math.max(starsGained24h, 0),
      forksGained24h: Math.max(forksGained24h, 0),
      daysSinceLastPush: getDaysSince(repo.github_pushed_at),
    };

    return {
      ...repo,
      stars_gained_24h: metrics.starsGained24h,
      trending_score: calculateTrendingScore(metrics),
      is_hidden_gem: isHiddenGem(metrics)
    };
  });

  return processedData.sort((a, b) => (b.trending_score || 0) - (a.trending_score || 0)).slice(0, limit);
}

