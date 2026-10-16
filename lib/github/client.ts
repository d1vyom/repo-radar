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
export async function fetchGitHubResponse(endpoint: string, options?: RequestInit): Promise<Response> {
  const token = process.env.GITHUB_TOKEN;
  const url = new URL(endpoint, GITHUB_API_BASE);
  if (url.origin !== GITHUB_API_BASE) throw new Error('Invalid GitHub API endpoint.');
  
  const headers = new Headers(options?.headers);
  if (!headers.has('Accept')) headers.set('Accept', 'application/vnd.github+json');
  if (token) headers.set('Authorization', `Bearer ${token}`);
  headers.set('X-GitHub-Api-Version', '2022-11-28');

  const requestOptions = {
    ...options,
    headers,
    signal: options?.signal ?? AbortSignal.timeout(10000),
    next: { revalidate: 60, ...options?.next },
  };
  let response = await fetch(url.toString(), requestOptions);
  // Public discovery remains usable when a configured PAT has expired.
  if (response.status === 401 && token) {
    const publicHeaders = new Headers(headers);
    publicHeaders.delete('Authorization');
    response = await fetch(url.toString(), { ...requestOptions, headers: publicHeaders });
  }

  const remaining = response.headers.get('x-ratelimit-remaining');
  const rateLimitRemaining = remaining === null ? undefined : Number(remaining);

  if (!response.ok) {
    let errorMessage = `GitHub API error: ${response.statusText}`;
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorMessage;
    } catch {
      // Ignore JSON parse error on non-JSON response
    }

    if (response.status === 429 || (response.status === 403 && (rateLimitRemaining === 0 || /rate limit/i.test(errorMessage)))) {
      throw new GitHubApiError(429, 'GitHub API rate limit exceeded.', rateLimitRemaining);
    }

    throw new GitHubApiError(response.status, errorMessage, rateLimitRemaining);
  }

  return response;
}

export async function fetchGitHub<T>(endpoint: string, options?: RequestInit): Promise<T> {
  return (await fetchGitHubResponse(endpoint, options)).json();
}
