import { RepositoryCard } from '@/components/repository-card';
import { Search as SearchIcon, Filter, AlertCircle } from 'lucide-react';
import { searchRepositories } from '@/lib/github/search';
import { SortOption } from '@/types/filters';

// Next.js Server Components can read URL searchParams natively
export default async function SearchPage({
  searchParams,
}: {
  searchParams: { q?: string; language?: string; sort?: string };
}) {
  const query = searchParams.q || '';
  const language = searchParams.language || '';
  
  let result = null;
  let errorMsg = null;

  try {
    result = await searchRepositories(
      { query, language },
      (searchParams.sort as SortOption) || 'stars-desc', // Defaulting to highest stars for discovery
      1 
    );
  } catch (err) {
    errorMsg = err instanceof Error ? err.message : 'Failed to fetch repositories.';
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8 flex flex-col md:flex-row gap-8">
      {/* Filters Sidebar */}
      <aside className="w-full md:w-64 flex-shrink-0 space-y-6">
        <div>
          <h3 className="font-medium text-sm flex items-center text-foreground mb-4">
            <Filter className="w-4 h-4 mr-2" /> Filters
          </h3>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">Language</label>
              <select className="w-full bg-[#111111] border border-border/50 rounded-md text-sm p-2 text-foreground focus:ring-1 focus:ring-blue-500 outline-none">
                <option value="">All Languages</option>
                <option value="TypeScript">TypeScript</option>
                <option value="Go">Go</option>
                <option value="Rust">Rust</option>
              </select>
            </div>
          </div>
        </div>
      </aside>

      {/* Search Results */}
      <div className="flex-1 space-y-6">
        <form method="GET" action="/search" className="relative">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input 
            type="text" 
            name="q"
            defaultValue={query}
            placeholder="Search GitHub repositories..." 
            className="w-full pl-9 pr-4 py-2 bg-[#111111] border border-border/50 rounded-md text-sm focus:outline-none focus:border-blue-500/50"
          />
          <button type="submit" className="hidden">Search</button>
        </form>

        {errorMsg ? (
          <div className="p-4 border border-red-500/50 bg-red-500/10 rounded-lg flex items-center text-red-500 text-sm">
            <AlertCircle className="w-4 h-4 mr-2" />
            {errorMsg}
          </div>
        ) : (
          <>
            <div className="text-sm text-muted-foreground pb-2 border-b border-border/40">
              Showing {result?.items.length || 0} of {result?.totalCount.toLocaleString() || 0} results {query ? `for "${query}"` : ''}
            </div>

            {result?.items.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                No repositories found matching your criteria.
              </div>
            ) : (
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                {result?.items.map((repo) => (
                  <RepositoryCard key={repo.id} repo={repo} />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
