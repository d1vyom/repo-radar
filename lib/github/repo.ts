import 'server-only';
import { fetchGitHub, fetchGitHubResponse, GitHubApiError } from './client';
import { GitHubRepository, GitHubRelease } from './types';

function repoPath(owner: string, name: string) {
  return `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(name)}`;
}

export async function getRepository(owner: string, name: string): Promise<GitHubRepository | null> {
  try {
    return await fetchGitHub<GitHubRepository>(repoPath(owner, name), { next: { revalidate: 3600 } });
  } catch (error) {
    if (error instanceof GitHubApiError && error.status === 404) return null;
    throw error;
  }
}

export async function getRepositoryReadme(owner: string, name: string): Promise<string | null> {
  try {
    const response = await fetchGitHubResponse(`${repoPath(owner, name)}/readme`, {
      headers: { Accept: 'application/vnd.github.html+json' }, next: { revalidate: 3600 },
    });
    return await response.text();
  } catch {
    return null;
  }
}

export async function getLatestRelease(owner: string, name: string): Promise<GitHubRelease | null> {
  try {
    return await fetchGitHub<GitHubRelease>(`${repoPath(owner, name)}/releases/latest`, { next: { revalidate: 3600 } });
  } catch {
    return null;
  }
}
