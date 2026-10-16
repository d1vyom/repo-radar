import 'server-only';
import { getSupabaseAdmin } from './supabase/server';
import { calculateTrendingScore, isHiddenGem } from './scoring';
import { RepositoryWithStats } from '@/types/repository';
import { PLACEHOLDER_REPOS } from '@/lib/placeholder-data';
import { DOMAIN_TOPIC_MAP } from '@/lib/constants';

type JoinedRepo = RepositoryWithStats & {
  repository_snapshots?: { stars_count: number; forks_count: number; snapshot_date: string }[] | null;
};

function rankRepository(repo: JoinedRepo): RepositoryWithStats {
  const snapshot = repo.repository_snapshots?.[0];
  const metrics = {
    totalStars: repo.stars_count,
    totalForks: repo.forks_count,
    starsGained24h: Math.max(snapshot ? repo.stars_count - snapshot.stars_count : 0, 0),
    forksGained24h: Math.max(snapshot ? repo.forks_count - snapshot.forks_count : 0, 0),
    daysSinceLastPush: Math.max(0, Math.floor((Date.now() - Date.parse(repo.github_pushed_at)) / 86400000)) || 0,
  };
  return { ...repo, stars_gained_24h: metrics.starsGained24h, trending_score: calculateTrendingScore(metrics), is_hidden_gem: isHiddenGem(metrics) };
}

function yesterday() {
  return new Date(Date.now() - 86400000).toISOString().split('T')[0];
}

function samples() {
  return PLACEHOLDER_REPOS.map(repo => ({ ...repo, topics: [...repo.topics], is_sample: true }));
}

export async function getRankedRepositories(): Promise<RepositoryWithStats[]> {
  try {
    const { data, error } = await getSupabaseAdmin().from('repositories')
      .select('*, repository_snapshots(stars_count, forks_count, snapshot_date)')
      .eq('repository_snapshots.snapshot_date', yesterday());
    if (error || !data) return samples();
    return (data as unknown as JoinedRepo[]).map(rankRepository);
  } catch {
    return samples();
  }
}

export async function getTrendingToday(limit = 10): Promise<RepositoryWithStats[]> {
  return (await getRankedRepositories()).sort((a, b) => (b.trending_score || 0) - (a.trending_score || 0)).slice(0, limit);
}

export async function getMostStarredToday(limit = 10): Promise<RepositoryWithStats[]> {
  return (await getRankedRepositories()).sort((a, b) => (b.stars_gained_24h || 0) - (a.stars_gained_24h || 0)).slice(0, limit);
}

export async function getHiddenGems(limit = 10): Promise<RepositoryWithStats[]> {
  return (await getRankedRepositories()).filter(repo => repo.is_hidden_gem)
    .sort((a, b) => (b.trending_score || 0) - (a.trending_score || 0)).slice(0, limit);
}

export async function getRecentlyUpdated(limit = 10): Promise<RepositoryWithStats[]> {
  try {
    const { data, error } = await getSupabaseAdmin().from('repositories').select('*')
      .order('github_pushed_at', { ascending: false }).limit(limit);
    if (!error && data) return data;
  } catch { /* The notice on the page identifies sample data. */ }
  return samples().sort((a, b) => b.github_pushed_at.localeCompare(a.github_pushed_at)).slice(0, limit);
}

export async function getPopularByDomain(domainSlug: string, limit = 10): Promise<RepositoryWithStats[]> {
  try {
    const { data, error } = await getSupabaseAdmin().from('repositories')
      .select('*, repository_snapshots(stars_count, forks_count, snapshot_date), repository_domains!inner(domains!inner(slug))')
      .eq('repository_snapshots.snapshot_date', yesterday()).eq('repository_domains.domains.slug', domainSlug);
    if (!error && data) return (data as unknown as JoinedRepo[]).map(rankRepository)
      .sort((a, b) => (b.trending_score || 0) - (a.trending_score || 0)).slice(0, limit);
  } catch { /* Use only samples matching the requested domain. */ }
  const topics = DOMAIN_TOPIC_MAP[domainSlug] ?? [];
  return samples().filter(repo => repo.topics.some(topic => topics.includes(topic)))
    .sort((a, b) => (b.trending_score || 0) - (a.trending_score || 0)).slice(0, limit);
}
