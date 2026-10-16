import Link from 'next/link';
import { DataNotice } from '@/components/data-notice';
import { RepositoryCard } from '@/components/repository-card';
import { DomainCard } from '@/components/domain-card';
import { HeroSearch } from '@/components/hero-search';
import { getTrendingToday } from '@/lib/analytics';
import { getDomains } from '@/lib/directories';
import { ArrowRight, TrendingUp, Layers } from 'lucide-react';

export const dynamic = 'force-dynamic';
export const revalidate = 300;

export default async function HomePage() {
  const [trendingRepos, domains] = await Promise.all([getTrendingToday(8), getDomains()]);

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-12 flex flex-col space-y-20">
      {/* Hero Section */}
      <section className="flex flex-col items-center text-center space-y-8 pt-8 animate-fade-in">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium animate-slide-up">
          <TrendingUp className="h-4 w-4" aria-hidden="true" />
          <span>Explore open-source repositories</span>
        </div>
        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-foreground max-w-4xl animate-slide-up" style={{ animationDelay: '100ms' }}>
          Discover the{' '}
          <span className="text-gradient">
            Open Source
          </span>{' '}
          Ecosystem
        </h1>
        <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl animate-slide-up" style={{ animationDelay: '200ms' }}>
          Track repository growth, explore specific domains, and discover tools across the open-source ecosystem.
        </p>
        <HeroSearch className="w-full max-w-3xl animate-slide-up" style={{ animationDelay: '300ms' }} />
      </section>

      {(trendingRepos.some(repo => repo.is_sample) || domains.some(domain => domain.is_sample)) && <DataNotice />}
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
          {domains.slice(0, 8).map((domain) => (
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
