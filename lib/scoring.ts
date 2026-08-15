/**
 * RepoRadar Scoring Engine
 * 
 * This engine calculates a deterministic trending score based on measurable activity.
 * It is designed to heavily favor recent velocity (gained stars/forks) over historical bulk,
 * allowing smaller, rapidly growing repositories to outrank stagnant giants.
 */

export interface RepoMetrics {
  totalStars: number;
  totalForks: number;
  starsGained24h: number;
  forksGained24h: number;
  daysSinceLastPush: number;
}

/**
 * Calculates the Trending Score.
 * 
 * Formula Breakdown:
 * 1. Base Velocity: Stars gained * 10 + Forks gained * 20 (Forks indicate deeper engagement).
 * 2. Growth Normalization: (Stars gained / Total stars) * 1000. This gives a massive boost to 
 *    small repos doubling in size, preventing million-star repos from dominating just by 
 *    gaining their average 100 stars a day.
 * 3. Stagnation Penalty: Subtracts points for every day the repo hasn't been pushed to.
 */
export function calculateTrendingScore(metrics: RepoMetrics): number {
  // Prevent division by zero
  const safeTotalStars = metrics.totalStars > 0 ? metrics.totalStars : 1;

  const baseVelocity = (metrics.starsGained24h * 10) + (metrics.forksGained24h * 20);
  
  // Calculate percentage growth (0 to 1 scale) and multiply for weight
  const growthPercentage = metrics.starsGained24h / safeTotalStars;
  const growthBonus = growthPercentage * 1000;

  // Penalty: -2 points per day dormant, capped at -100 to prevent negative infinity
  const dormancyPenalty = Math.min(metrics.daysSinceLastPush * 2, 100);

  const rawScore = baseVelocity + growthBonus - dormancyPenalty;
  
  // Ensure score doesn't drop below 0 for display purposes
  return Math.max(Number(rawScore.toFixed(2)), 0);
}

/**
 * Determines if a repository qualifies as a "Hidden Gem".
 * Criteria: High recent growth but low total historical footprint (< 1500 stars).
 */
export function isHiddenGem(metrics: RepoMetrics): boolean {
  return metrics.totalStars < 1500 && metrics.starsGained24h > 10;
}
