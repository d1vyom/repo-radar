import { GET } from '@/app/api/search/route';
import { searchRepositories } from '@/lib/github/search';
jest.mock('@/lib/github/search', () => ({ searchRepositories: jest.fn() }));
const searchMock = jest.mocked(searchRepositories);
beforeEach(() => searchMock.mockReset().mockResolvedValue({ items: [], totalCount: 0, hasMore: false }));
const request = (query: string) => new Request(`http://localhost/api/search?${query}`);

it('applies topic links from repository pages', async () => {
  await GET(request('topic=react'));
  expect(searchMock.mock.calls[0][0].topics).toContain('react');
});

it('does not hide low-star repositories behind a contradictory default', async () => {
  await GET(request('stars=100'));
  expect(searchMock.mock.calls[0][0]).toMatchObject({ minStars: 100 });
  expect(searchMock.mock.calls[0][0].query || '').not.toContain('stars:>500');
});

it('accepts structured language qualifiers including C++', async () => {
  await GET(request('language=C%2B%2B'));
  expect(searchMock.mock.calls[0][0].language).toBe('C++');
});

it.each(['page=51', 'page=NaN', 'page=-2', 'page=1.5', 'stars=-2', 'stars=1e9', 'domain=unknown', 'topic=react%20stars:0', 'language=python%20stars:0'])('rejects invalid filters: %s', async (query) => {
  const response = await GET(request(query));
  expect(response.status).toBe(400);
  expect(searchMock).not.toHaveBeenCalled();
});

it('does not build an unscoped multi-topic OR query for domains', async () => {
  await GET(request('q=agent&domain=ai&language=python'));
  expect(searchMock.mock.calls[0][0]).toMatchObject({ query: 'agent', language: 'python', topics: ['ai'] });
});

it('returns a validation error for GitHub query validation failures', async () => {
  searchMock.mockRejectedValue({ status: 422 });
  expect((await GET(request('q=invalid'))).status).toBe(400);
});
