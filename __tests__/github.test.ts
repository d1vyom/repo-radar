import { fetchGitHub, GitHubApiError } from '@/lib/github/client';
import { searchRepositories } from '@/lib/github/search';
import { getRepository, getRepositoryReadme } from '@/lib/github/repo';

const originalToken = process.env.GITHUB_TOKEN;
let fetchMock: jest.SpiedFunction<typeof fetch>;
beforeEach(() => {
  delete process.env.GITHUB_TOKEN;
  fetchMock = jest.spyOn(global, 'fetch').mockResolvedValue(Response.json({ items: [], total_count: 0 }));
});
afterEach(() => {
  fetchMock.mockRestore();
  if (originalToken === undefined) delete process.env.GITHUB_TOKEN;
  else process.env.GITHUB_TOKEN = originalToken;
});

it('reads public GitHub resources without requiring a token', async () => {
  await expect(fetchGitHub('/repos/vercel/next.js')).resolves.toBeDefined();
  const options = fetchMock.mock.calls[0][1]!;
  expect(new Headers(options.headers).has('Authorization')).toBe(false);
  expect(options.signal).toBeDefined();
});

it('rejects endpoints outside GitHub before attaching credentials', async () => {
  process.env.GITHUB_TOKEN = 'test-token';
  await expect(fetchGitHub('https://example.com/repos')).rejects.toThrow();
  expect(fetchMock).not.toHaveBeenCalled();
});

it('retries a rejected token once as a public read', async () => {
  process.env.GITHUB_TOKEN = 'expired-token';
  fetchMock.mockResolvedValueOnce(Response.json({ message: 'Bad credentials' }, { status: 401 }));
  await expect(fetchGitHub('/repos/vercel/next.js')).resolves.toBeDefined();
  expect(fetchMock).toHaveBeenCalledTimes(2);
  expect(new Headers(fetchMock.mock.calls[1][1]!.headers).has('Authorization')).toBe(false);
});

it('preserves custom Accept headers for rendered README responses', async () => {
  process.env.GITHUB_TOKEN = 'test-token';
  await fetchGitHub('/repos/a/b/readme', { headers: { Accept: 'application/vnd.github.html+json' } });
  expect(new Headers(fetchMock.mock.calls[0][1]!.headers).get('Accept')).toBe('application/vnd.github.html+json');
});

it('distinguishes forbidden access from an exhausted rate limit', async () => {
  process.env.GITHUB_TOKEN = 'test-token';
  fetchMock.mockResolvedValue(Response.json({ message: 'Forbidden' }, { status: 403 }));
  await expect(fetchGitHub('/repos/a/b')).rejects.toMatchObject({ status: 403, message: 'Forbidden' });
});

it('classifies 429 responses as rate limits', async () => {
  process.env.GITHUB_TOKEN = 'test-token';
  fetchMock.mockResolvedValue(Response.json({ message: 'Too many requests' }, { status: 429 }));
  await expect(fetchGitHub('/repos/a/b')).rejects.toBeInstanceOf(GitHubApiError);
});

it('builds zero upper bounds and date qualifiers without contradictory defaults', async () => {
  process.env.GITHUB_TOKEN = 'test-token';
  await searchRepositories({ maxStars: 0, maxForks: 0, createdAfter: '2026-01-01', updatedAfter: '2026-10-01' });
  const query = new URL(String(fetchMock.mock.calls[0][0])).searchParams.get('q')!;
  expect(query).toContain('stars:0..0');
  expect(query).toContain('forks:0..0');
  expect(query).toContain('created:>=2026-01-01');
  expect(query).toContain('pushed:>=2026-10-01');
  expect(query).not.toContain('stars:>0');
});

it('returns a missing public repository as null', async () => {
  fetchMock.mockResolvedValue(Response.json({ message: 'Not Found' }, { status: 404 }));
  await expect(getRepository('missing', 'repo')).resolves.toBeNull();
});

it('reads public rendered README HTML', async () => {
  fetchMock.mockResolvedValue(new Response('<h1>Readme</h1>'));
  await expect(getRepositoryReadme('a', 'b')).resolves.toBe('<h1>Readme</h1>');
});

it('quotes multiword language names from the language directory', async () => {
  await searchRepositories({ language: 'Jupyter Notebook' });
  const query = new URL(String(fetchMock.mock.calls[0][0])).searchParams.get('q');
  expect(query).toContain('language:"Jupyter Notebook"');
});
