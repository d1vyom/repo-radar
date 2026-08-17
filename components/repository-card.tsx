import Link from 'next/link';
import { Star, GitFork, TrendingUp, Code2 } from 'lucide-react';
import { RepositoryWithStats } from '@/types/repository';

interface RepositoryCardProps {
  repo: RepositoryWithStats;
}

export function RepositoryCard({ repo }: RepositoryCardProps) {
  const starsGained = repo.stars_gained_24h ?? 0;
  const isTrending = starsGained > 0;

  return (
    <Link 
      href={`/repo/${repo.owner_login}/${repo.name}`}
      className="card card-hover group h-full flex flex-col"
      aria-label={`View ${repo.full_name} details`}
    >
      <div className="flex flex-col h-full p-5">
        {/* Header with owner/name */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-semibold text-foreground truncate group-hover:text-primary transition-colors">
              <span className="text-muted-foreground font-normal">{repo.owner_login}/</span>
              {repo.name}
            </h3>
            {repo.is_archived && (
              <span className="mt-1 inline-flex items-center gap-1 text-xs text-muted-foreground">
                <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20"><path d="M3.051 5.103A4.501 4.501 0 016.45 2.5c.066 0 .13.005.194.014a3.5 3.5 0 014.71 0 3.5 3.5 0 00-4.71 0 4.501 4.501 0 00-1.693 2.602A4.5 4.5 0 005.5 10.5a4.5 4.5 0 00-.66 3.522 3.5 3.5 0 01-7.005 0A4.5 4.5 0 002 10.5 4.5 4.5 0 013.051 5.103zm1.692-2.31c-.398 0-.78.167-1.052.45a5.435 5.435 0 00-.22 1.341A4.501 4.501 0 006.5 5.5c.057 0 .113-.003.169-.008a3.5 3.5 0 013.156-.992 3.5 3.5 0 00-3.356 0 3.5 3.5 0 013.156.992 3.01 3.01 0 00.17.008 4.501 4.501 0 001.88-3.531A4.5 4.5 0 004.743 2.793zM10 4.5a1.5 1.5 0 110 3 1.5 1.5 0 010-3zm4 2a3.981 3.981 0 00-.16.049 3.5 3.5 0 01-4.68 0A3.98 3.98 0 006 6.5a3.98 3.98 0 00.16.049 3.5 3.5 0 015.641 2.79 3.98 3.98 0 00.199-.049 3.5 3.5 0 01-1.84-2.79z" /></svg>
                Archived
              </span>
            )}
          </div>
        </div>

        {/* Description */}
        <p className="mt-2 text-sm text-muted-foreground line-clamp-3 flex-1">
          {repo.description || 'No description provided.'}
        </p>

        {/* Metadata row */}
        <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
          {repo.language && (
            <div className="flex items-center gap-1.5 group-hover:text-foreground transition-colors" title={repo.language}>
              <Code2 className="h-3.5 w-3.5" aria-hidden="true" />
              <span className="font-medium">{repo.language}</span>
            </div>
          )}
          
          <div className="flex items-center gap-1.5 group-hover:text-warning/80 transition-colors">
            <Star className="h-3.5 w-3.5" aria-hidden="true" />
            <span className="font-mono tabular-nums">{repo.stars_count.toLocaleString()}</span>
          </div>
          
          <div className="flex items-center gap-1.5">
            <GitFork className="h-3.5 w-3.5" aria-hidden="true" />
            <span className="font-mono tabular-nums">{repo.forks_count.toLocaleString()}</span>
          </div>

          {isTrending && (
            <div className="flex items-center gap-1.5 text-accent ml-auto">
              <TrendingUp className="h-3.5 w-3.5" aria-hidden="true" />
              <span className="font-medium text-xs">+{starsGained.toLocaleString()} today</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-4 pt-4 border-t border-border/30 flex items-center justify-between">
          <p className="text-xs text-muted-foreground/70">
            Updated {new Date(repo.github_pushed_at).toLocaleDateString()}
          </p>
          <span className="text-xs text-muted-foreground/50 font-mono">
            #{repo.github_id.toLocaleString()}
          </span>
        </div>
      </div>
    </Link>
  );
}