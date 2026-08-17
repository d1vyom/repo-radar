import Link from 'next/link';
import { RepositoryCard } from '@/components/repository-card';
import { PLACEHOLDER_REPOS } from '@/lib/placeholder-data';
import { getTrendingToday, getMostStarredToday, getHiddenGems, getRecentlyUpdated } from '@/lib/analytics';
import { RepositoryWithStats } from '@/types/repository';
import { TrendingUp, Star, Gem, Clock, Search, Filter } from 'lucide-react';

export const dynamic = 'force-dynamic';
export const revalidate = 300;

const PLACEHOLDER = PLACEHOLDER_REPOS;

async function safe<T>(promise: Promise<T>, fallback: T): Promise<T> {
  try {
    const data = await promise;
    return data && (data as unknown[]).length ? data : fallback;
  } catch (error) {
    console.error('Trending page fetch failed, using placeholders:', error);
    return fallback;
  }
}

interface SectionProps {
  id: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  repos: RepositoryWithStats[];
  empty?: string;
  badge?: string;
  badgeColor?: 'primary' | 'accent' | 'warning';
}

function Section({ id, icon, title, description, repos, empty, badge, badgeColor = 'primary' }: SectionProps) {
  const badgeClasses = {
    primary: 'badge-primary',
    accent: 'badge-accent',
    warning: 'badge-warning',
  }[badgeColor];

  return (
    <section id={id} className="space-y-6 scroll-mt-20 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${badgeColor === 'primary' ? 'bg-primary/10' : badgeColor === 'accent' ? 'bg-accent/10' : 'bg-warning/10'}`}>
            {icon}
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
              {badge && <span className={`badge ${badgeClasses}`}>{badge}</span>}
            </div>
            <p className="text-sm text-muted-foreground mt-1">{description}</p>
          </div>
        </div>
        <Link href="/search" className="btn-ghost shrink-0">
          <Filter className="h-4 w-4" aria-hidden="true" />
          Advanced Search
        </Link>
      </div>
      {repos.length === 0 ? (
        <div className="empty-state">
          {badgeColor === 'primary' && <TrendingUp className="empty-state-icon" />}
          {badgeColor === 'accent' && <Gem className="empty-state-icon" />}
          {badgeColor === 'warning' && <Star className="empty-state-icon" />}
          {badgeColor === 'primary' && <Clock className="empty-state-icon" />}
          <p className="empty-state-text text-lg font-medium text-foreground mb-2">No repositories found</p>
          <p className="empty-state-text">{empty ?? 'No repositories match the current criteria.'}</p>
        </div>
      ) : (
        <div className="repo-grid">
          {repos.map((repo) => (
            <RepositoryCard key={repo.id} repo={repo} />
          ))}
        </div>
      )}
    </section>
  );
}

export default async function TrendingPage() {
  const [trending, mostStarred, hiddenGems, recentlyUpdated] = await Promise.all([
    safe(getTrendingToday(12), PLACEHOLDER as RepositoryWithStats[]),
    safe(getMostStarredToday(12), PLACEHOLDER as RepositoryWithStats[]),
    safe(getHiddenGems(12), [] as RepositoryWithStats[]),
    safe(getRecentlyUpdated(12), PLACEHOLDER as RepositoryWithStats[]),
  ]);

  return (
    <div className="section py-12 space-y-16">
      <div className="space-y-3 animate-fade-in">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-primary/10">
            <TrendingUp className="h-6 w-6 text-primary" aria-hidden="true" />
          </div>
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">Trending Repositories</h1>
            <p className="text-muted-foreground mt-1 max-w-2xl">
              Live rankings refreshed from our daily snapshots. Filter by what matters most — sustained growth, fresh
              momentum, or hidden gems waiting to be discovered.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/search" className="btn-secondary">
            <Search className="h-4 w-4" aria-hidden="true" />
            Advanced Search
          </Link>
        </div>
      </div>

      <nav className="flex flex-wrap gap-2 animate-fade-in" style={{ animationDelay: '100ms' }} aria-label="Trending sections">
        <a href="#trending" className="badge badge-primary">Trending Now</a>
        <a href="#most-starred" className="badge badge-warning">Top Stars Today</a>
        <a href="#hidden-gems" className="badge badge-accent">Hidden Gems</a>
        <a href="#recently-updated" className="badge badge-muted">Recently Updated</a>
      </nav>

      <Section
        id="trending"
        icon={<TrendingUp className="h-5 w-5 text-primary" aria-hidden="true" />}
        title="Trending Now"
        description="Repositories with the highest composite trending score (velocity + relative growth)."
        repos={trending}
        badge="Composite Score"
        badgeColor="primary"
      />
      <Section
        id="most-starred"
        icon={<Star className="h-5 w-5 text-warning" aria-hidden="true" />}
        title="Top Stars Today"
        description="Repositories that gained the most stars in the last 24 hours."
        repos={mostStarred}
        badge="24h Growth"
        badgeColor="warning"
      />
      <Section
        id="hidden-gems"
        icon={<Gem className="h-5 w-5 text-accent" aria-hidden="true" />}
        title="Hidden Gems"
        description="Rapidly growing repositories with fewer than 1,500 stars — your chance to discover them early."
        repos={hiddenGems}
        badge="< 1.5k Stars"
        badgeColor="accent"
        empty="No hidden gems detected today. Check back after the next sync."
      />
      <Section
        id="recently-updated"
        icon={<Clock className="h-5 w-5 text-muted-foreground" aria-hidden="true" />}
        title="Recently Updated"
        description="Repositories with the most recent commits pushed to their default branch."
        repos={recentlyUpdated}
        badge="Latest Push"
        badgeColor="primary"
      />
    </div>
  );
}