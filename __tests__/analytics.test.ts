import { getRankedRepositories, getTrendingToday, getPopularByDomain, getRecentlyUpdated } from '@/lib/analytics';
import { getSupabaseAdmin } from '@/lib/supabase/server';
import { PLACEHOLDER_REPOS } from '@/lib/placeholder-data';

jest.mock('@/lib/supabase/server', () => ({ getSupabaseAdmin: jest.fn() }));
let response: { data: unknown; error: unknown };
beforeEach(() => {
  response = { data: null, error: { code: '42P01' } };
  const query = { select: jest.fn().mockReturnThis(), eq: jest.fn().mockReturnThis(), order: jest.fn().mockReturnThis(), limit: jest.fn().mockReturnThis(), then: (resolve: (value: unknown) => unknown) => Promise.resolve(response).then(resolve) };
  jest.mocked(getSupabaseAdmin).mockReturnValue({ from: () => query } as never);
});

it('does not mutate shared sample ordering when producing rankings', async () => {
  const order = PLACEHOLDER_REPOS.map(repo => repo.id);
  await getTrendingToday(3);
  expect(PLACEHOLDER_REPOS.map(repo => repo.id)).toEqual(order);
});

it('returns independently owned sample arrays on database errors', async () => {
  const repos = await getRankedRepositories();
  expect(repos).not.toBe(PLACEHOLDER_REPOS);
});

it('only returns domain-matching samples when the database is unavailable', async () => {
  const repos = await getPopularByDomain('blockchain');
  expect(repos.length).toBeGreaterThan(0);
  expect(repos.every(repo => repo.topics.some(topic => ['blockchain', 'ethereum', 'web3', 'solidity', 'crypto'].includes(topic)))).toBe(true);
});

it('sorts recently updated samples by push date', async () => {
  const repos = await getRecentlyUpdated(20);
  expect(repos.map(repo => repo.github_pushed_at)).toEqual(repos.map(repo => repo.github_pushed_at).sort().reverse());
});

it('handles repositories with no joined snapshot', async () => {
  response = { data: [{ ...PLACEHOLDER_REPOS[0], repository_snapshots: null }], error: null };
  const repos = await getRankedRepositories();
  expect(repos).toHaveLength(1);
  expect(repos[0].stars_gained_24h).toBe(0);
});

it('preserves a legitimate empty database result', async () => {
  response = { data: [], error: null };
  expect(await getTrendingToday()).toEqual([]);
});
