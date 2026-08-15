import 'server-only';
import { fetchGitHub } from './client';
import { GitHubSearchResponse, GitHubRepository } from './types';
import { SearchFilters, SortOption, PaginatedResult } from '@/types/filters';
import { RepositoryWithStats } from '@/types/repository';

/**
 * Translates our local SortOption into GitHub's expected sort and order parameters.
 */
function getSortParams(sort?: SortOption): { sort?: string; order?: 'asc' | 'desc' } {
  switch (sort) {
    case 'stars-desc': return { sort: 'stars', order: 'desc' };
    case 'forks-desc': return { sort: 'forks', order: 'desc' };
    case 'updated-desc': return { sort: 'updated', order: 'desc' };
    case 'best-match':
    default:
      return {}; // GitHub defaults to best match when no sort is provided
  }
}

/**
 * Builds the 'q' query string required by GitHub's search API.
 */
function buildQueryString(filters: SearchFilters): string {
  const qualifiers: string[] = [];

  // 1. Base Query
  if (filters.query) {
    qualifiers.push(filters.query);
  } else {
    // GitHub requires a query. If none is provided, default to finding public repos with at least 1 star.
    qualifiers.push('stars:>0');
  }

  // 2. Exact Match Qualifiers
  if (filters.language && filters.language !== 'All Languages') qualifiers.push(`language:${filters.language}`);
  if (filters.license) qualifiers.push(`license:${filters.license}`);
  if (filters.isArchived !== undefined) qualifiers.push(`archived:${filters.isArchived}`);

  // 3. Range Qualifiers
  if (filters.minStars || filters.maxStars) {
    const min = filters.minStars || 0;
    const max = filters.maxStars ? filters.maxStars : '*';
    qualifiers.push(`stars:${min}..${max}`);
  }

  if (filters.minForks || filters.maxForks) {
    const min = filters.minForks || 0;
    const max = filters.maxForks ? filters.maxForks : '*';
    qualifiers.push(`forks:${min}..${max}`);
  }

  // 4. Topic Qualifiers
  if (filters.topics && filters.topics.length > 0) {
    filters.topics.forEach(topic => qualifiers.push(`topic:${topic}`));
  }

  return qualifiers.join(' ');
}

/**
 * Maps raw GitHub data to our internal Repository interface.
 */
function mapGitHubRepoToInternal(repo: GitHubRepository): RepositoryWithStats {
  return {
    id: repo.id.toString(),
    github_id: repo.id,
    full_name: repo.full_name,
    name: repo.name,
    owner_login: repo.owner.login,
    owner_avatar_url: repo.owner.avatar_url,
    description: repo.description,
    language: repo.language,
    topics: repo.topics,
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
}

/**
 * Executes a repository search against the GitHub API.
 */
export async function searchRepositories(
  filters: SearchFilters,
  sort: SortOption = 'best-match',
  page: number = 1,
  perPage: number = 30
): Promise<PaginatedResult<RepositoryWithStats>> {
  const q = buildQueryString(filters);
  const { sort: githubSort, order } = getSortParams(sort);
  
  const params = new URLSearchParams({
    q,
    page: page.toString(),
    per_page: perPage.toString(),
  });

  if (githubSort) params.append('sort', githubSort);
  if (order) params.append('order', order);

  const endpoint = `/search/repositories?${params.toString()}`;

  const data = await fetchGitHub<GitHubSearchResponse<GitHubRepository>>(endpoint);

  return {
    items: data.items.map(mapGitHubRepoToInternal),
    totalCount: data.total_count,
    // GitHub limits search pagination to the first 1000 results
    hasMore: data.items.length === perPage && (page * perPage) < Math.min(data.total_count, 1000),
  };
}
