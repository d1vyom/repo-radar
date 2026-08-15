import Link from 'next/link';
import { Star, GitFork, TrendingUp } from 'lucide-react';
import { RepositoryWithStats } from '@/types/repository';

export function RepositoryCard({ repo }: { repo: RepositoryWithStats }) {
  return (
    <Link href={`/repo/${repo.owner_login}/${repo.name}`}>
      <div className="group relative flex h-full flex-col rounded-lg border border-border/50 bg-[#111111] p-5 hover:border-foreground/20 transition-all duration-200 hover:-translate-y-0.5">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-semibold text-foreground truncate">
              <span className="text-muted-foreground font-normal">{repo.owner_login}/</span>
              {repo.name}
            </h3>
          </div>
        </div>
        <p className="mt-2 text-sm text-muted-foreground line-clamp-2 flex-1">
          {repo.description || 'No description provided.'}
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
          {repo.language && (
            <div className="flex items-center">
              <span className="mr-1.5 h-2.5 w-2.5 rounded-full bg-blue-500"></span>
              {repo.language}
            </div>
          )}
          <div className="flex items-center group-hover:text-yellow-500/80 transition-colors">
            <Star className="mr-1 h-3.5 w-3.5" />
            {repo.stars_count.toLocaleString()}
          </div>
          <div className="flex items-center">
            <GitFork className="mr-1 h-3.5 w-3.5" />
            {repo.forks_count.toLocaleString()}
          </div>
          {repo.stars_gained_24h && (
            <div className="flex items-center text-emerald-500">
              <TrendingUp className="mr-1 h-3.5 w-3.5" />
              +{repo.stars_gained_24h} today
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
