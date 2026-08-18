import 'server-only';
import { GitHubRepository, GitHubRelease } from './types';

const GITHUB_API_BASE = 'https://api.github.com';

async function fetchWithAuth(endpoint: string, acceptHeader?: string) {
  const token = process.env.GITHUB_TOKEN;
  
  if (!token) {
    throw new Error('GITHUB_TOKEN environment variable is not set.');
  }

  const url = endpoint.startsWith('http') ? endpoint : `${GITHUB_API_BASE}${endpoint}`;
  
  const headers = new Headers();
  headers.set('Accept', acceptHeader || 'application/vnd.github.v3+json');
  // FIX: Use `token` prefix for classic PATs (ghp_...), not `Bearer`
  headers.set('Authorization', `token ${token}`);
  headers.set('X-GitHub-Api-Version', '2022-11-28');

  const response = await fetch(url, {
    headers,
    next: { revalidate: 3600 },
    signal: AbortSignal.timeout(15000),
  });

  const rateLimitRemaining = parseInt(response.headers.get('x-ratelimit-remaining') || '0', 10);

  if (!response.ok) {
    let errorMessage = `GitHub API error: ${response.statusText}`;
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorMessage;
    } catch {
      // Ignore JSON parse error
    }

    if (response.status === 403 && rateLimitRemaining === 0) {
      throw new Error('RATE_LIMIT');
    }
    if (response.status === 404) {
      throw new Error('NOT_FOUND');
    }
    throw new Error(errorMessage);
  }

  return response;
}

export async function getRepository(owner: string, name: string): Promise<GitHubRepository | null> {
  try {
    const response = await fetchWithAuth(`/repos/${owner}/${name}`);
    return response.json();
  } catch (error: unknown) {
    const err = error as Error;
    if (err.message === 'NOT_FOUND') return null;
    if (err.message === 'RATE_LIMIT') throw new Error('RATE_LIMIT');
    console.error('getRepository error:', err);
    throw new Error('API_ERROR');
  }
}

export async function getRepositoryReadme(owner: string, name: string): Promise<string | null> {
  try {
    const response = await fetchWithAuth(
      `/repos/${owner}/${name}/readme`,
      'application/vnd.github.v3.html'
    );
    return response.text();
  } catch {
    return null;
  }
}

export async function getLatestRelease(owner: string, name: string): Promise<GitHubRelease | null> {
  try {
    const response = await fetchWithAuth(`/repos/${owner}/${name}/releases/latest`);
    return response.json();
  } catch {
    return null;
  }
}