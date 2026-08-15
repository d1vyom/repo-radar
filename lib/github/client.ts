import 'server-only';

const GITHUB_API_BASE = 'https://api.github.com';

export class GitHubApiError extends Error {
  constructor(public status: number, message: string, public rateLimitRemaining?: number) {
    super(message);
    this.name = 'GitHubApiError';
  }
}

/**
 * Core fetch wrapper for GitHub API ensuring headers, auth, and error handling.
 */
export async function fetchGitHub<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const token = process.env.GITHUB_TOKEN;
  
  if (!token) {
    throw new Error('GITHUB_TOKEN environment variable is not set.');
  }

  const url = endpoint.startsWith('http') ? endpoint : `${GITHUB_API_BASE}${endpoint}`;
  
  const headers = new Headers(options?.headers);
  headers.set('Accept', 'application/vnd.github.v3+json');
  headers.set('Authorization', `Bearer ${token}`);
  headers.set('X-GitHub-Api-Version', '2022-11-28');

  const response = await fetch(url, {
    ...options,
    headers,
    // Add Next.js specific caching if needed, default to time-based revalidation for search
    next: { revalidate: 60, ...options?.next }, 
  });

  const rateLimitRemaining = parseInt(response.headers.get('x-ratelimit-remaining') || '0', 10);

  if (!response.ok) {
    let errorMessage = `GitHub API error: ${response.statusText}`;
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorMessage;
    } catch {
      // Ignore JSON parse error on non-JSON response
    }

    if (response.status === 403 && rateLimitRemaining === 0) {
      throw new GitHubApiError(response.status, 'GitHub API rate limit exceeded.', rateLimitRemaining);
    }

    throw new GitHubApiError(response.status, errorMessage, rateLimitRemaining);
  }

  return response.json();
}
