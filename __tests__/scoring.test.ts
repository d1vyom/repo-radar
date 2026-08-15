import { calculateTrendingScore, isHiddenGem, RepoMetrics } from '../lib/scoring';

describe('RepoRadar Scoring Engine', () => {
  it('should rank a fast-growing small repo higher than a slow-growing giant repo', () => {
    const giantRepo: RepoMetrics = {
      totalStars: 100000,
      totalForks: 20000,
      starsGained24h: 50, // Gained 50 stars today
      forksGained24h: 5,
      daysSinceLastPush: 1,
    };

    const smallTrendingRepo: RepoMetrics = {
      totalStars: 500,
      totalForks: 50,
      starsGained24h: 100, // Gained 100 stars today (massive growth for its size)
      forksGained24h: 20,
      daysSinceLastPush: 0,
    };

    const giantScore = calculateTrendingScore(giantRepo);
    const smallScore = calculateTrendingScore(smallTrendingRepo);

    expect(smallScore).toBeGreaterThan(giantScore);
  });

  it('should apply a penalty for dormant repositories', () => {
    const activeRepo: RepoMetrics = {
      totalStars: 1000,
      totalForks: 100,
      starsGained24h: 10,
      forksGained24h: 1,
      daysSinceLastPush: 0, // Pushed today
    };

    const dormantRepo: RepoMetrics = {
      ...activeRepo,
      daysSinceLastPush: 30, // Pushed a month ago
    };

    expect(calculateTrendingScore(activeRepo)).toBeGreaterThan(calculateTrendingScore(dormantRepo));
  });

  it('should correctly identify hidden gems', () => {
    const gem: RepoMetrics = {
      totalStars: 800,
      totalForks: 50,
      starsGained24h: 25,
      forksGained24h: 5,
      daysSinceLastPush: 1,
    };

    const mainstream: RepoMetrics = {
      totalStars: 50000,
      totalForks: 5000,
      starsGained24h: 200,
      forksGained24h: 50,
      daysSinceLastPush: 1,
    };

    expect(isHiddenGem(gem)).toBe(true);
    expect(isHiddenGem(mainstream)).toBe(false);
  });
});
