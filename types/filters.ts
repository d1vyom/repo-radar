// types/filters.ts

/**
 * Defines all possible search and filter parameters supported by RepoRadar.
 * These map closely to GitHub's REST API qualifiers.
 */
export interface SearchFilters {
  query?: string;
  language?: string;
  minStars?: number;
  maxStars?: number;
  minForks?: number;
  maxForks?: number;
  createdAfter?: string; // YYYY-MM-DD
  updatedAfter?: string; // YYYY-MM-DD
  topics?: string[];
  license?: string;
  isArchived?: boolean;
}

/**
 * Supported sorting configurations.
 */
export type SortOption = 
  | 'best-match'
  | 'stars-desc'
  | 'forks-desc'
  | 'updated-desc'
  | 'trending-score'; // Custom internal sort

/**
 * The standard response shape for any paginated list of repositories.
 */
export interface PaginatedResult<T> {
  items: T[];
  totalCount: number;
  hasMore: boolean;
  nextPageCursor?: string;
}
