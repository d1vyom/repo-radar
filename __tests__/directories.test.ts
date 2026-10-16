import { getDomains, getTopLanguages } from '@/lib/directories';
import { getSupabaseAdmin } from '@/lib/supabase/server';
jest.mock('@/lib/supabase/server', () => ({ getSupabaseAdmin: jest.fn() }));

const links = Array.from({ length: 1100 }, () => ({ domain_id: 'domain-id' }));
const repositories = Array.from({ length: 1100 }, () => ({ language: 'Jupyter Notebook' }));
beforeEach(() => {
  jest.mocked(getSupabaseAdmin).mockReturnValue({ from: (table: string) => {
    const all = table === 'domains' ? [{ id: 'domain-id', slug: 'ai', name: 'AI' }] : table === 'repository_domains' ? links : repositories;
    const query = {
      select: () => query, not: () => query, order: () => query,
      range: async (start: number, end: number) => ({ data: all.slice(start, end + 1), error: null }),
      then: (resolve: (value: unknown) => unknown) => Promise.resolve({ data: all.slice(0, 1000), error: null }).then(resolve),
    };
    return query;
  } } as never);
});

it('counts domain assignments beyond the database response cap', async () => {
  expect(await getDomains()).toEqual([expect.objectContaining({ slug: 'ai', count: 1100, is_sample: false })]);
});

it('counts languages beyond the database response cap', async () => {
  expect(await getTopLanguages()).toEqual([{ language: 'Jupyter Notebook', count: 1100, is_sample: false }]);
});
