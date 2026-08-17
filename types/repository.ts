// types/repository.ts

/**
 * Represents the core repository data stored in our Supabase database.
 * This maps to the `repositories` table.
 */
export interface Repository {
  id: string; // UUID
  github_id: number;
  full_name: string; // e.g., "facebook/react"
  name: string;
  owner_login: string;
  owner_avatar_url: string;
  description: string | null;
  language: string | null;
  topics: string[];
  stars_count: number; // Current snapshot
  forks_count: number; // Current snapshot
  issues_count: number; // Current snapshot
  github_created_at: string; // ISO Date String
  github_updated_at: string; // ISO Date String
  github_pushed_at: string; // ISO Date String
  license_spdx: string | null;
  is_archived: boolean;
  last_synced_at: string; // ISO Date String
}

/**
 * Represents a daily snapshot of a repository's metrics.
 * Maps to the `repository_snapshots` table.
 */
export interface RepositorySnapshot {
  id: string; // UUID
  repository_id: string; // UUID
  snapshot_date: string; // YYYY-MM-DD
  stars_count: number;
  forks_count: number;
}

/**
 * Represents the calculated trending statistics from our Materialized View.
 * Maps to `repository_stats_mv`.
 */
export interface RepositoryStats {
  repository_id: string;
  stars_gained_24h: number;
  stars_gained_7d: number;
  trending_score: number;
}

/**
 * A combined type used for displaying a repository card in the UI,
 * merging base data with its calculated trending stats.
 *
 * `is_hidden_gem` is computed at runtime by the analytics layer (see
 * `lib/analytics.ts`) and is intentionally optional so callers that load
 * from the GitHub API directly (without snapshots) don't have to fabricate
 * a value.
 */
export type RepositoryWithStats = Repository &
  Partial<RepositoryStats> & {
    is_hidden_gem?: boolean;
  };
