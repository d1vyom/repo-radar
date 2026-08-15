'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useDebounce } from '@/hooks/use-debounce';
import { RepositoryCard } from '@/components/repository-card';
import { SearchSkeleton } from '@/components/search-skeleton';
import { RepositoryWithStats } from '@/types/repository';

interface SearchResponse {
  items: RepositoryWithStats[];
  total_count: number;
  error?: string;
}

export default function SearchInterface() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Initialize state directly from URL parameters
  const initialQuery = searchParams.get('q') || '';
  const initialLanguage = searchParams.get('language') || '';
  const initialStars = searchParams.get('stars') || '';
  const initialSort = searchParams.get('sort') || 'stars';
  
  // Local state for immediate UI feedback
  const [searchTerm, setSearchTerm] = useState(initialQuery);
  const [language, setLanguage] = useState(initialLanguage);
  const [stars, setStars] = useState(initialStars);
  const [sort, setSort] = useState(initialSort);
  const [page, setPage] = useState(parseInt(searchParams.get('page') || '1', 10));

  // Data fetching state
  const [results, setResults] = useState<RepositoryWithStats[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Debounce the text input to prevent spamming the URL/API
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  // Sync state to URL seamlessly
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

  // Update URL when filters change
  useEffect(() => {
    const queryString = createQueryString({
      q: debouncedSearchTerm,
      language,
      stars,
      sort,
      page: page > 1 ? page : null,
    });
    
    router.push(`${pathname}?${queryString}`, { scroll: false });
  }, [debouncedSearchTerm, language, stars, sort, page, pathname, router, createQueryString]);

  // Fetch data whenever the URL changes
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
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchResults();
  }, [searchParams]); // Strictly dependent on the URL to ensure shareability

  const resetFilters = () => {
    setSearchTerm('');
    setLanguage('');
    setStars('');
    setSort('stars');
    setPage(1);
  };

  return (
    <div className="flex flex-col md:flex-row gap-8">
      {/* Sidebar Filters */}
      <aside className="w-full md:w-64 space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2">Search</label>
          <input
            type="text"
            aria-label="Search repositories"
            placeholder="Repository name..."
            className="w-full bg-[#111111] border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1); // Reset page on new search
            }}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Language</label>
          <select
            aria-label="Language"
            className="w-full bg-[#111111] border border-border rounded-md px-3 py-2 text-sm focus:outline-none"
            value={language}
            onChange={(e) => {
              setLanguage(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All Languages</option>
            <option value="typescript">TypeScript</option>
            <option value="javascript">JavaScript</option>
            <option value="python">Python</option>
            <option value="go">Go</option>
            <option value="rust">Rust</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Minimum Stars</label>
          <select
            aria-label="Minimum Stars"
            className="w-full bg-[#111111] border border-border rounded-md px-3 py-2 text-sm focus:outline-none"
            value={stars}
            onChange={(e) => {
              setStars(e.target.value);
              setPage(1);
            }}
          >
            <option value="">Any</option>
            <option value="100">&gt; 100</option>
            <option value="1000">&gt; 1,000</option>
            <option value="10000">&gt; 10,000</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Sort By</label>
          <select
            aria-label="Sort By"
            className="w-full bg-[#111111] border border-border rounded-md px-3 py-2 text-sm focus:outline-none"
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

        <button
          onClick={resetFilters}
          className="w-full py-2 text-sm border border-border/50 hover:bg-border/20 rounded-md transition-colors"
        >
          Reset Filters
        </button>
      </aside>

      {/* Main Results Area */}
      <main className="flex-1">
        {/* Active Filter Chips */}
        <div className="flex flex-wrap gap-2 mb-6">
          {debouncedSearchTerm && (
            <span className="px-3 py-1 bg-blue-500/10 text-blue-400 text-xs rounded-full border border-blue-500/20">
              Query: {debouncedSearchTerm}
            </span>
          )}
          {language && (
            <span className="px-3 py-1 bg-purple-500/10 text-purple-400 text-xs rounded-full border border-purple-500/20">
              Lang: {language}
            </span>
          )}
          {stars && (
            <span className="px-3 py-1 bg-yellow-500/10 text-yellow-400 text-xs rounded-full border border-yellow-500/20">
              Stars: &gt;{stars}
            </span>
          )}
          <span className="px-3 py-1 bg-border/20 text-muted-foreground text-xs rounded-full border border-border/50">
            {totalCount.toLocaleString()} Results
          </span>
        </div>

        {/* State Management Views */}
        {error ? (
          <div className="p-6 bg-red-500/10 border border-red-500/20 rounded-lg text-center">
            <h3 className="text-red-400 font-semibold mb-2">Search Failed</h3>
            <p className="text-sm text-red-400/80">{error}</p>
          </div>
        ) : isLoading ? (
          <SearchSkeleton />
        ) : results.length === 0 ? (
          <div className="text-center py-12 border border-border/50 rounded-lg bg-[#111111]">
            <p className="text-muted-foreground">No repositories found matching your criteria.</p>
            <button onClick={resetFilters} className="mt-4 text-blue-400 text-sm hover:underline">
              Clear filters and try again
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
              {results.map((repo) => (
                <RepositoryCard key={repo.id || repo.github_id} repo={repo} />
              ))}
            </div>

            {/* Pagination */}
            <div className="flex justify-center items-center gap-4 mt-8 pt-8 border-t border-border/20">
              <button
                disabled={page === 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="px-4 py-2 border border-border rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-border/20"
              >
                Previous
              </button>
              <span className="text-sm text-muted-foreground">Page {page}</span>
              <button
                disabled={results.length < 20}
                onClick={() => setPage((p) => p + 1)}
                className="px-4 py-2 border border-border rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-border/20"
              >
                Next
              </button>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
