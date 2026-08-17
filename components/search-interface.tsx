'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useDebounce } from '@/hooks/use-debounce';
import { RepositoryCard } from '@/components/repository-card';
import { SearchSkeleton } from '@/components/search-skeleton';
import { RepositoryWithStats } from '@/types/repository';
import { SUPPORTED_LANGUAGES } from '@/lib/constants';
import { X, Filter, SlidersHorizontal, Star } from 'lucide-react';

interface SearchResponse {
  items: RepositoryWithStats[];
  total_count: number;
  hasMore?: boolean;
  error?: string;
}

function canonicalLanguage(value: string): string {
  if (!value) return '';
  const match = SUPPORTED_LANGUAGES.find((l) => l.toLowerCase() === value.toLowerCase());
  return match ?? value;
}

export default function SearchInterface() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const initialQuery = searchParams.get('q') || '';
  const initialLanguage = searchParams.get('language') || '';
  const initialStars = searchParams.get('stars') || '';
  const initialSort = searchParams.get('sort') || 'stars';
  const initialDomain = searchParams.get('domain') || '';

  const [searchTerm, setSearchTerm] = useState(initialQuery);
  const [language, setLanguage] = useState(initialLanguage);
  const [stars, setStars] = useState(initialStars);
  const [sort, setSort] = useState(initialSort);
  const [domain] = useState(initialDomain);
  const [page, setPage] = useState(parseInt(searchParams.get('page') || '1', 10));

  const [results, setResults] = useState<RepositoryWithStats[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const createQueryString = useCallback(
    (params: Record<string, string | number | null>) => {
      const newSearchParams = new URLSearchParams(searchParams.toString());
      Object.entries(params).forEach(([key, value]) => {
        if (value === null || value === '') {
          newSearchParams.delete(key);
        } else {
          newSearchParams.set(key, String(value));
        }
      });
      return newSearchParams.toString();
    },
    [searchParams]
  );

  useEffect(() => {
    const queryString = createQueryString({
      q: debouncedSearchTerm,
      language,
      stars,
      sort,
      domain: domain || null,
      page: page > 1 ? page : null,
    });
    router.push(`${pathname}?${queryString}`, { scroll: false });
  }, [debouncedSearchTerm, language, stars, sort, domain, page, pathname, router, createQueryString]);

  useEffect(() => {
    const fetchResults = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const query = searchParams.toString();
        const res = await fetch(`/api/search?${query}`);
        const data: SearchResponse = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to fetch results');
        setResults(data.items || []);
        setTotalCount(data.total_count || 0);
        setHasMore(Boolean(data.hasMore));
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
        setResults([]);
        setTotalCount(0);
        setHasMore(false);
      } finally {
        setIsLoading(false);
      }
    };
    fetchResults();
  }, [searchParams]);

  const resetFilters = () => {
    setSearchTerm('');
    setLanguage('');
    setStars('');
    setSort('stars');
    setPage(1);
  };

  const hasActiveFilters = searchTerm || language || stars || sort !== 'stars' || domain;

  return (
    <div className="flex flex-col md:flex-row gap-8">
      <aside className="w-full md:w-72 lg:w-80 flex-shrink-0 space-y-6 animate-fade-in">
        {/* Search Input */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Search</label>
          <div className="relative">
            <input
              type="text"
              aria-label="Search repositories"
              placeholder="Repository name..."
              className="input-base pl-10 pr-10"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
            />
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60" aria-hidden="true" />
            {searchTerm && (
              <button
                type="button"
                onClick={() => { setSearchTerm(''); setPage(1); }}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-surface-2 transition-colors text-muted-foreground/60 hover:text-foreground"
                aria-label="Clear search"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            )}
          </div>
        </div>

        {/* Language Filter */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Language</label>
          <select
            aria-label="Language"
            className="input-base appearance-none bg-input-bg"
            value={language.toLowerCase()}
            onChange={(e) => {
              setLanguage(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All Languages</option>
            {SUPPORTED_LANGUAGES.map((lang) => (
              <option key={lang} value={lang.toLowerCase()}>
                {lang}
              </option>
            ))}
          </select>
        </div>

        {/* Minimum Stars Filter */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Minimum Stars</label>
          <select
            aria-label="Minimum Stars"
            className="input-base appearance-none bg-input-bg"
            value={stars}
            onChange={(e) => {
              setStars(e.target.value);
              setPage(1);
            }}
          >
            <option value="">Any</option>
            <option value="100">{'>'} 100</option>
            <option value="1000">{'>'} 1,000</option>
            <option value="10000">{'>'} 10,000</option>
          </select>
        </div>

        {/* Sort By Filter */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Sort By</label>
          <select
            aria-label="Sort By"
            className="input-base appearance-none bg-input-bg"
            value={sort}
            onChange={(e) => {
              setSort(e.target.value);
              setPage(1);
            }}
          >
            <option value="stars">Most Stars</option>
            <option value="forks">Most Forks</option>
            <option value="updated">Recently Updated</option>
          </select>
        </div>

        {/* Domain indicator (read-only from URL) */}
        {domain && (
          <div className="pt-2 border-t border-border/30">
            <label className="block text-sm font-medium text-foreground mb-2">Domain</label>
            <div className="badge badge-primary">
              <SlidersHorizontal className="h-3 w-3" aria-hidden="true" />
              {domain}
            </div>
          </div>
        )}

        {/* Reset Filters */}
        {hasActiveFilters && (
          <button
            onClick={resetFilters}
            className="btn-secondary w-full justify-center gap-2"
          >
            <X className="h-4 w-4" aria-hidden="true" />
            Reset Filters
          </button>
        )}
      </aside>

      <main className="flex-1 min-w-0 animate-fade-in" style={{ animationDelay: '100ms' }}>
        {/* Active Filters Bar */}
        <div className="flex flex-wrap items-center gap-2 mb-6">
          {domain && (
            <span className="badge badge-primary gap-1.5">
              <SlidersHorizontal className="h-3 w-3" aria-hidden="true" />
              Domain: {domain}
              <button
                type="button"
                onClick={() => router.push(pathname + searchParams.toString().replace(/[?&]domain=[^&]*/, '').replace('?&', '?'))}
                className="ml-1 hover:text-foreground"
                aria-label="Remove domain filter"
              >
                <X className="h-3 w-3" aria-hidden="true" />
              </button>
            </span>
          )}
          {debouncedSearchTerm && (
            <span className="badge badge-primary gap-1.5">
              <Filter className="h-3 w-3" aria-hidden="true" />
              Query: {debouncedSearchTerm}
              <button
                type="button"
                onClick={() => { setSearchTerm(''); setPage(1); }}
                className="ml-1 hover:text-foreground"
                aria-label="Remove query filter"
              >
                <X className="h-3 w-3" aria-hidden="true" />
              </button>
            </span>
          )}
          {language && (
            <span className="badge gap-1.5 bg-purple-500/10 text-purple-400 border-purple-500/20">
              <span className="h-2 w-2 rounded-full bg-purple-500" aria-hidden="true" />
              Lang: {canonicalLanguage(language)}
              <button
                type="button"
                onClick={() => { setLanguage(''); setPage(1); }}
                className="ml-1 hover:text-foreground"
                aria-label="Remove language filter"
              >
                <X className="h-3 w-3" aria-hidden="true" />
              </button>
            </span>
          )}
          {stars && (
            <span className="badge badge-warning gap-1.5">
              <Star className="h-3 w-3" aria-hidden="true" />
              Stars: {'>'}{Number(stars).toLocaleString()}
              <button
                type="button"
                onClick={() => { setStars(''); setPage(1); }}
                className="ml-1 hover:text-foreground"
                aria-label="Remove stars filter"
              >
                <X className="h-3 w-3" aria-hidden="true" />
              </button>
            </span>
          )}
          <span className="badge badge-muted">
            {totalCount.toLocaleString()} Result{totalCount !== 1 ? 's' : ''}
          </span>
        </div>

        {/* Results */}
        {error ? (
          <div className="card p-8 text-center border-danger/30 bg-danger/5">
            <div className="w-12 h-12 rounded-full bg-danger/20 flex items-center justify-center mx-auto mb-4">
              <svg className="h-6 w-6 text-danger" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>
            </div>
            <h3 className="text-lg font-semibold text-danger mb-2">Search Failed</h3>
            <p className="text-sm text-muted-foreground">{error}</p>
            <button onClick={() => window.location.reload()} className="mt-4 btn-primary">Try Again</button>
          </div>
        ) : isLoading ? (
          <SearchSkeleton />
        ) : results.length === 0 ? (
          <div className="empty-state animate-fade-in">
            <svg className="empty-state-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <p className="empty-state-text text-lg font-medium text-foreground mb-2">No repositories found</p>
            <p className="empty-state-text">Try adjusting your filters or search terms</p>
            {hasActiveFilters && (
              <button onClick={resetFilters} className="mt-4 btn-primary">
                <X className="h-4 w-4" aria-hidden="true" />
                Clear all filters
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="repo-grid-compact">
              {results.map((repo) => (
                <RepositoryCard key={repo.id || repo.github_id} repo={repo} />
              ))}
            </div>

            {/* Pagination */}
            {(hasMore || page > 1) && (
              <div className="flex justify-center items-center gap-3 mt-8 pt-6 border-t border-border/30 animate-fade-in">
                <button
                  disabled={page === 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="btn-secondary"
                  aria-label="Previous page"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                  Previous
                </button>
                <span className="px-4 text-sm text-muted-foreground font-mono tabular-nums">
                  Page {page}
                </span>
                <button
                  disabled={!hasMore}
                  onClick={() => setPage((p) => p + 1)}
                  className="btn-secondary"
                  aria-label="Next page"
                >
                  Next
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}