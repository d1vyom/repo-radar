import { Search } from 'lucide-react';
import { PLACEHOLDER_REPOS, PLACEHOLDER_DOMAINS } from '@/lib/placeholder-data';
import { RepositoryCard } from '@/components/repository-card';
import { DomainCard } from '@/components/domain-card';

export default function HomePage() {
  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-12 flex flex-col space-y-16">
      {/* Hero Section */}
      <section className="flex flex-col items-center text-center space-y-6 pt-12">
        <h1 className="text-5xl font-extrabold tracking-tight text-white sm:text-6xl">
          Discover the <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-600">Open Source</span> Ecosystem
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl">
          Track trending repositories, explore specific domains, and find the fastest growing tools in real-time.
        </p>
        <div className="w-full max-w-2xl relative mt-4">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-muted-foreground" />
          </div>
          <input
            type="text"
            className="w-full pl-12 pr-4 py-4 bg-[#111111] border border-border/50 rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
            placeholder="Search repositories, languages, or topics..."
          />
        </div>
      </section>

      {/* Trending Today */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold tracking-tight">Trending Today</h2>
          <span className="text-sm text-blue-400 cursor-pointer hover:underline">View all</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {PLACEHOLDER_REPOS.map((repo) => (
            <RepositoryCard key={repo.id} repo={repo} />
          ))}
        </div>
      </section>

      {/* Popular Domains */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold tracking-tight">Popular Domains</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {PLACEHOLDER_DOMAINS.map((domain) => (
            <DomainCard key={domain.id} name={domain.name} slug={domain.slug} count={domain.count} />
          ))}
        </div>
      </section>
    </div>
  );
}
