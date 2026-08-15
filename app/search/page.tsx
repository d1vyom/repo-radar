import { Suspense } from 'react';
import SearchInterface from '@/components/search-interface';

export const metadata = {
  title: 'Search Repositories | RepoRadar',
  description: 'Search and filter open-source GitHub repositories.',
};

export default function SearchPage() {
  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Search Repositories</h1>
        <p className="text-muted-foreground mt-2">
          Discover the perfect repository using advanced filters and sorting.
        </p>
      </div>

      <Suspense 
        fallback={
          <div className="animate-pulse flex gap-8">
            <div className="w-64 h-96 bg-[#111111] rounded-lg border border-border/50 hidden md:block" />
            <div className="flex-1 space-y-4">
              <div className="h-8 bg-[#111111] w-1/3 rounded-lg border border-border/50" />
              <div className="h-64 bg-[#111111] rounded-lg border border-border/50" />
            </div>
          </div>
        }
      >
        <SearchInterface />
      </Suspense>
    </div>
  );
}
