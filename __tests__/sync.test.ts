import { syncRepositoryToDatabase } from '@/lib/supabase/sync';
import { getSupabaseAdmin } from '@/lib/supabase/server';
import { GitHubRepository } from '@/lib/github/types';
jest.mock('@/lib/supabase/server', () => ({ getSupabaseAdmin: jest.fn() }));

const repo = {
  id: 123, full_name: 'a/b', name: 'b', owner: { login: 'a', avatar_url: 'https://example.com/a.png' },
  description: 'Web application', topics: ['react'], language: 'TypeScript',
  stargazers_count: 120, forks_count: 10, open_issues_count: 2, created_at: '2026-01-01',
  updated_at: '2026-10-01', pushed_at: '2026-10-01', archived: false, license: null,
} as GitHubRepository;
let failedTable: string | undefined;
let written: Record<string, unknown>;
beforeEach(() => {
  failedTable = undefined;
  written = {};
  jest.mocked(getSupabaseAdmin).mockReturnValue({ from: (table: string) => {
    const result = () => ({ data: table === 'repositories' ? { id: 'db-id' } : table === 'domains' ? [{ id: 'domain-id', slug: 'web-development' }] : null, error: failedTable === table ? { message: 'Write failed' } : null });
    return {
      upsert: (data: unknown) => { written[table] = data; return { select: () => ({ single: async () => result() }), then: (resolve: (r: unknown) => unknown) => Promise.resolve(result()).then(resolve) }; },
      select: () => ({ in: async () => result() }),
      delete: () => ({ eq: () => ({ not: async () => result(), then: (resolve: (r: unknown) => unknown) => Promise.resolve(result()).then(resolve) }) }),
    };
  } } as never);
});

it('persists correctly mapped repository and daily snapshot data', async () => {
  expect(await syncRepositoryToDatabase(repo)).toBe('db-id');
  expect(written.repositories).toEqual([expect.objectContaining({ github_id: 123, stars_count: 120, owner_login: 'a' })]);
  expect(written.repository_snapshots).toEqual([expect.objectContaining({ repository_id: 'db-id', stars_count: 120 })]);
});

it.each(['repository_snapshots', 'domains', 'repository_domains'])('fails the repository sync when %s cannot be saved or read', async table => {
  failedTable = table;
  await expect(syncRepositoryToDatabase(repo)).rejects.toThrow();
});
