import { renderToStaticMarkup } from 'react-dom/server';
import HomePage from '@/app/page';
import TrendingPage from '@/app/trending/page';
import { getTrendingToday, getMostStarredToday, getHiddenGems, getRecentlyUpdated } from '@/lib/analytics';
import { getDomains } from '@/lib/directories';
import { PLACEHOLDER_REPOS } from '@/lib/placeholder-data';
jest.mock('@/lib/analytics', () => ({ getTrendingToday: jest.fn(), getMostStarredToday: jest.fn(), getHiddenGems: jest.fn(), getRecentlyUpdated: jest.fn() }));
jest.mock('@/lib/directories', () => ({ getDomains: jest.fn() }));
jest.mock('@/components/hero-search', () => ({ HeroSearch: () => null }));
beforeEach(() => {
  for (const getter of [getTrendingToday, getMostStarredToday, getHiddenGems, getRecentlyUpdated]) jest.mocked(getter).mockResolvedValue([]);
  jest.mocked(getDomains).mockResolvedValue([]);
});

it('discloses sample domain counts when live repositories are available', async () => {
  jest.mocked(getDomains).mockResolvedValue([{ slug: 'ai', name: 'AI', count: 0, is_sample: true }]);
  expect(renderToStaticMarkup(await HomePage())).toContain('Sample data');
});

it('discloses sampled recent repositories when trending data succeeds', async () => {
  jest.mocked(getRecentlyUpdated).mockResolvedValue([{ ...PLACEHOLDER_REPOS[0], is_sample: true }]);
  expect(renderToStaticMarkup(await TrendingPage())).toContain('Sample data');
});
