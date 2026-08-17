import Link from 'next/link';
import { Suspense } from 'react';
import SearchInterface from '@/components/search-interface';
import { Filter, Search } from 'lucide-react';

export const metadata = {
  title: 'Search Repositories | RepoRadar',
  description: 'Search and filter open-source GitHub repositories.',
};

function SearchSkeleton() {
  return (
    <div className="flex flex-col md:flex-row gap-8 animate-pulse">
      <aside className="w-full md:w-72 lg:w-80 flex-shrink-0 space-y-6">
        <div className="h-10 bg-surface-2 rounded-lg border border-border/50"></div>
        <div className="h-10 bg-surface-2 rounded-lg border border-border/50"></div>
        <div className="h-10 bg-surface-2 rounded-lg border border-border/50"></div>
        <div className="h-10 bg-surface-2 rounded-lg border border-border/50"></div>
        <div className="h-10 bg-surface-2 rounded-lg border border-border/50"></div>
        <div className="h-10 bg-surface-2 rounded-lg border border-border/50"></div>
      </aside>
      <main className="flex-1 min-w-0">
        <div className="h-10 bg-surface-2 rounded-lg border border-border/50 mb-6"></div>
        <div className="repo-grid-compact">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="card p-5 border-border/50 bg-surface-1">
              <div className="h-6 bg-border/30 rounded w-3/4 mb-3"></div>
              <div className="h-4 bg-border/20 rounded w-full mb-2"></div>
              <div className="h-4 bg-border/20 rounded w-5/6 mb-4"></div>
              <div className="flex gap-4 mt-4 border-t border-border/20 pt-4">
                <div className="h-4 bg-border/30 rounded w-16"></div>
                <div className="h-4 bg-border/30 rounded w-16"></div>
                <div className="h-4 bg-border/30 rounded w-24"></div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

export default function SearchPage() {
  return (
    <div className="section py-12">
      <div className="space-y-3 animate-fade-in mb-8">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-primary/10">
            <Search className="h-6 w-6 text-primary" aria-hidden="true" />
          </div>
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">Search Repositories</h1>
            <p className="text-muted-foreground mt-1">
              Discover the perfect repository using advanced filters and sorting.
            </p>
          </div>
        </div>
        <Link href="/trending" className="btn-ghost inline-flex">
          <Filter className="h-4 w-4" aria-hidden="true" />
          View Trending Instead
        </Link>
      </div>

      <Suspense fallback={<SearchSkeleton />}>
        <SearchInterface />
      </Suspense>
    </div>
  );
}