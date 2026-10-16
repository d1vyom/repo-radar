import { GET } from '@/app/api/cron/sync/route';
import { searchRepositories, searchGitHubRepositories } from '@/lib/github/search';
import { syncRepositoryToDatabase } from '@/lib/supabase/sync';
import { GitHubRepository } from '@/lib/github/types';

jest.mock('@/lib/github/search', () => ({ searchRepositories: jest.fn(), searchGitHubRepositories: jest.fn() }));
jest.mock('@/lib/supabase/sync', () => ({ syncRepositoryToDatabase: jest.fn() }));
const rawRepo = { id: 123, full_name: 'a/b', name: 'b', owner: { login: 'a', avatar_url: 'https://example.com/a.png' }, stargazers_count: 1000 } as GitHubRepository;
const oldSecret = process.env.CRON_SECRET;
const request = (secret = 'test-secret') => new Request('http://localhost/api/cron/sync', { headers: { authorization: `Bearer ${secret}` } });
beforeEach(() => {
  process.env.CRON_SECRET = 'test-secret';
  jest.mocked(searchRepositories).mockReset().mockResolvedValue({ items: [{ id: 'internal', owner_login: 'a' }] as never[], totalCount: 1, hasMore: false });
  jest.mocked(searchGitHubRepositories).mockReset().mockResolvedValue({ items: [rawRepo], totalCount: 1, hasMore: false });
  jest.mocked(syncRepositoryToDatabase).mockReset().mockResolvedValue('db-id');
});
afterAll(() => { if (oldSecret === undefined) delete process.env.CRON_SECRET; else process.env.CRON_SECRET = oldSecret; });

it('fails closed when the cron secret is missing', async () => {
  delete process.env.CRON_SECRET;
  expect((await GET(request('undefined'))).status).toBe(401);
  expect(syncRepositoryToDatabase).not.toHaveBeenCalled();
});

it('syncs raw GitHub repositories instead of casting internal records', async () => {
  const response = await GET(request());
  expect(response.status).toBe(200);
  expect(syncRepositoryToDatabase).toHaveBeenCalledWith(rawRepo);
});

it('reports failed writes instead of declaring a successful sync', async () => {
  jest.mocked(syncRepositoryToDatabase).mockRejectedValue(new Error('Database unavailable'));
  const response = await GET(request());
  expect(response.status).toBe(500);
  expect(await response.json()).toMatchObject({ success: false, synced: 0, failed: 1, total: 1 });
});

it('includes low-star candidates so hidden gems can actually enter the database', async () => {
  await GET(request());
  const queries = jest.mocked(searchGitHubRepositories).mock.calls.map(([filters]) => filters);
  expect(queries.some(filters => filters.maxStars !== undefined && filters.maxStars < 1500)).toBe(true);
});
