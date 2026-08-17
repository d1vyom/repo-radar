import Link from 'next/link';
import { PLACEHOLDER_REPOS, PLACEHOLDER_DOMAINS } from '@/lib/placeholder-data';
import { RepositoryCard } from '@/components/repository-card';
import { DomainCard } from '@/components/domain-card';
import { HeroSearch } from '@/components/hero-search';
import { getTrendingToday } from '@/lib/analytics';
import { supabaseAdmin } from '@/lib/supabase/server';
import { KNOWN_DOMAINS } from '@/lib/constants';
import { RepositoryWithStats } from '@/types/repository';
import { ArrowRight, TrendingUp, Layers } from 'lucide-react';

export const dynamic = 'force-dynamic';
export const revalidate = 300;

async function getTrending(): Promise<RepositoryWithStats[]> {
  try {
    const repos = await getTrendingToday(8);
    if (repos.length > 0) return repos;
    return PLACEHOLDER_REPOS;
  } catch (error) {
    console.error('Trending fetch failed, using placeholders:', error);
    return PLACEHOLDER_REPOS;
  }
}

async function getDomains() {
  try {
    const { data, error } = await supabaseAdmin
      .from('domains')
      .select('id, slug, name');

    if (error || !data || data.length === 0) {
      return PLACEHOLDER_DOMAINS.map(({ slug, name, count }) => ({ slug, name, count }));
    }

    // Get actual repo counts from repository_domains join table
    const { data: joinData } = await supabaseAdmin
      .from('repository_domains')
      .select('domain_id');

    const counts: Record<string, number> = {};
    if (joinData) {
      for (const row of joinData as unknown as { domain_id: string }[]) {
        counts[row.domain_id] = (counts[row.domain_id] ?? 0) + 1;
      }
    }

    return data
      .map((d) => ({
        slug: d.slug,
        name: d.name,
        count: counts[d.id] ?? 0,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);
  } catch (error) {
    console.error('Domains fetch failed, using fallback:', error);
    return KNOWN_DOMAINS.slice(0, 8).map(({ slug, name }) => ({ slug, name, count: 0 }));
  }
}

export default async function HomePage() {
  const [trendingRepos, domains] = await Promise.all([getTrending(), getDomains()]);

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-12 flex flex-col space-y-20">
      {/* Hero Section */}
      <section className="flex flex-col items-center text-center space-y-8 pt-8 animate-fade-in">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium animate-slide-up">
          <TrendingUp className="h-4 w-4" aria-hidden="true" />
          <span>Live trending data updated daily</span>
        </div>
        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-foreground max-w-4xl animate-slide-up" style={{ animationDelay: '100ms' }}>
          Discover the{' '}
          <span className="text-gradient">
            Open Source
          </span>{' '}
          Ecosystem
        </h1>
        <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl animate-slide-up" style={{ animationDelay: '200ms' }}>
          Track trending repositories, explore specific domains, and find the fastest growing tools in real-time.
        </p>
        <HeroSearch className="w-full max-w-3xl animate-slide-up" style={{ animationDelay: '300ms' }} />
      </section>

      {/* Trending Today */}
      <section className="animate-fade-in" style={{ animationDelay: '400ms' }}>
        <div className="section-header">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <TrendingUp className="h-5 w-5 text-primary" aria-hidden="true" />
            </div>
            <h2 className="section-title">Trending Today</h2>
          </div>
          <Link href="/trending" className="section-link flex items-center gap-1">
            View all
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
        <div className="repo-grid">
          {trendingRepos.map((repo) => (
            <RepositoryCard key={repo.id} repo={repo} />
          ))}
        </div>
      </section>

      {/* Popular Domains */}
      <section className="animate-fade-in" style={{ animationDelay: '500ms' }}>
        <div className="section-header">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-accent/10">
              <Layers className="h-5 w-5 text-accent" aria-hidden="true" />
            </div>
            <h2 className="section-title">Popular Domains</h2>
          </div>
          <Link href="/domains" className="section-link flex items-center gap-1">
            Browse all
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
        <div className="domain-grid">
          {domains.map((domain) => (
            <DomainCard
              key={domain.slug}
              name={domain.name}
              slug={domain.slug}
              count={domain.count}
            />
          ))}
        </div>
      </section>
    </div>
  );
}