import 'server-only';
import { GitHubRepository } from './types';

// Helper to make authenticated requests with caching
async function fetchWithAuth(url: string, acceptHeader?: string) {
  const headers: HeadersInit = {};
  
  if (process.env.GITHUB_TOKEN) {
    headers['Authorization'] = `token ${process.env.GITHUB_TOKEN}`;
  }
  if (acceptHeader) {
    headers['Accept'] = acceptHeader;
  }

  return fetch(url, {
    headers,
    // Cache for 1 hour to keep the page fast and avoid rate limits
    next: { revalidate: 3600 }, 
  });
}

export async function getRepository(owner: string, name: string): Promise<GitHubRepository | null> {
  const res = await fetchWithAuth(`https://api.github.com/repos/${owner}/${name}`);
  
  if (res.status === 404) return null; // Not found, deleted, or private
  if (res.status === 403 || res.status === 429) throw new Error('RATE_LIMIT');
  if (!res.ok) throw new Error('API_ERROR');
  
  return res.json();
}

export async function getRepositoryReadme(owner: string, name: string): Promise<string | null> {
  // 'application/vnd.github.v3.html' tells GitHub to return raw HTML instead of Markdown
  const res = await fetchWithAuth(
    `https://api.github.com/repos/${owner}/${name}/readme`,
    'application/vnd.github.v3.html'
  );

  if (!res.ok) return null;
  return res.text();
}

export async function getLatestRelease(owner: string, name: string) {
  const res = await fetchWithAuth(`https://api.github.com/repos/${owner}/${name}/releases/latest`);
  if (!res.ok) return null;
  return res.json();
}
