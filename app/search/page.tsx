import { PLACEHOLDER_REPOS } from '@/lib/placeholder-data';
import { RepositoryCard } from '@/components/repository-card';
import { Search as SearchIcon, Filter } from 'lucide-react';

export default function SearchPage() {
  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8 flex flex-col md:flex-row gap-8">
      {/* Filters Sidebar (Static Placeholder) */}
      <aside className="w-full md:w-64 flex-shrink-0 space-y-6">
        <div>
          <h3 className="font-medium text-sm flex items-center text-foreground mb-4">
            <Filter className="w-4 h-4 mr-2" /> Filters
          </h3>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">Language</label>
              <select className="w-full bg-[#111111] border border-border/50 rounded-md text-sm p-2 text-foreground focus:ring-1 focus:ring-blue-500 outline-none">
                <option>All Languages</option>
                <option>TypeScript</option>
                <option>Go</option>
                <option>Rust</option>
              </select>
            </div>
          </div>
        </div>
      </aside>

      {/* Search Results */}
      <div className="flex-1 space-y-6">
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input 
            type="text" 
            placeholder="Search..." 
            className="w-full pl-9 pr-4 py-2 bg-[#111111] border border-border/50 rounded-md text-sm focus:outline-none focus:border-blue-500/50"
          />
        </div>
        <div className="text-sm text-muted-foreground pb-2 border-b border-border/40">
          Showing 3 results for &quot;placeholder&quot;
        </div>
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          {PLACEHOLDER_REPOS.map((repo) => (
            <RepositoryCard key={repo.id} repo={repo} />
          ))}
        </div>
      </div>
    </div>
  );
}
