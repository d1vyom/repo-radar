import 'server-only';
import { supabaseAdmin } from './supabase/server';
import { calculateTrendingScore, isHiddenGem, RepoMetrics } from './scoring';
import { RepositoryWithStats } from '@/types/repository';
import { PLACEHOLDER_REPOS } from '@/lib/placeholder-data';

/**
 * Helper to calculate days between two dates
 */
function getDaysSince(dateString: string): number {
  const diffTime = Math.abs(new Date().getTime() - new Date(dateString).getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Fetches repositories and their latest snapshots to calculate growth.
 * Falls back to placeholder data if Supabase is unreachable or table missing.
 */
export async function getRankedRepositories(): Promise<RepositoryWithStats[]> {
  try {
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
      if (error?.code !== '42P01') {
        console.error('Failed to fetch analytics data, using placeholders:', error?.message);
      }
      return PLACEHOLDER_REPOS;
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
  } catch (err) {
    console.error('getRankedRepositories critical error, using placeholders:', err);
    return PLACEHOLDER_REPOS;
  }
}

// --- Ranking Extractors ---

export async function getTrendingToday(limit = 10): Promise<RepositoryWithStats[]> {
  try {
    const repos = await getRankedRepositories();
    return repos.sort((a, b) => (b.trending_score || 0) - (a.trending_score || 0)).slice(0, limit);
  } catch (err) {
    console.error('getTrendingToday error, using placeholders:', err);
    return PLACEHOLDER_REPOS.slice(0, limit);
  }
}

export async function getMostStarredToday(limit = 10): Promise<RepositoryWithStats[]> {
  try {
    const repos = await getRankedRepositories();
    return repos.sort((a, b) => (b.stars_gained_24h || 0) - (a.stars_gained_24h || 0)).slice(0, limit);
  } catch (err) {
    console.error('getMostStarredToday error, using placeholders:', err);
    return PLACEHOLDER_REPOS.slice(0, limit);
  }
}

export async function getHiddenGems(limit = 10): Promise<RepositoryWithStats[]> {
  try {
    const repos = await getRankedRepositories();
    // `is_hidden_gem` is populated in the mapping above (see getRankedRepositories)
    return repos
      .filter((r) => r.is_hidden_gem)
      .sort((a, b) => (b.trending_score || 0) - (a.trending_score || 0))
      .slice(0, limit);
  } catch (err) {
    console.error('getHiddenGems error, using placeholders:', err);
    return [];
  }
}

export async function getRecentlyUpdated(limit = 10): Promise<RepositoryWithStats[]> {
  try {
    const { data, error } = await supabaseAdmin
      .from('repositories')
      .select('*')
      .order('github_pushed_at', { ascending: false })
      .limit(limit);
    
    if (error || !data) {
      if (error?.code !== '42P01') {
        console.error('getRecentlyUpdated error, using placeholders:', error?.message);
      }
      return PLACEHOLDER_REPOS.slice(0, limit);
    }
    
    return data as unknown as RepositoryWithStats[] || [];
  } catch (err) {
    console.error('getRecentlyUpdated critical error, using placeholders:', err);
    return PLACEHOLDER_REPOS.slice(0, limit);
  }
}

export async function getPopularByDomain(domainSlug: string, limit = 10): Promise<RepositoryWithStats[]> {
  try {
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
      if (error?.code !== '42P01') {
        console.error(`Failed to fetch repos for domain ${domainSlug}, using placeholders:`, error?.message);
      }
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
  } catch (err) {
    console.error('getPopularByDomain critical error, using placeholders:', err);
    return [];
  }
}