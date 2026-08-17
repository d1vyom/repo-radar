import Link from 'next/link';
import { getPopularByDomain } from '@/lib/analytics';
import { RepositoryCard } from '@/components/repository-card';
import { supabaseAdmin } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { Layers, ArrowRight } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function DomainPage({ params }: { params: { slug: string } }) {
  // 1. Validate the domain exists
  const { data: domain } = await supabaseAdmin
    .from('domains')
    .select('name')
    .eq('slug', params.slug)
    .single();

  if (!domain) {
    notFound();
  }

  // 2. Fetch classified repositories
  const repositories = await getPopularByDomain(params.slug, 20);

  return (
    <div className="section py-12 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 animate-fade-in">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-primary/10">
            <Layers className="h-6 w-6 text-primary" aria-hidden="true" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{domain.name} Repositories</h1>
            <p className="text-muted-foreground mt-1">
              Trending and rapidly growing {domain.name.toLowerCase()} projects, classified by RepoRadar.
            </p>
          </div>
        </div>
        <Link href="/domains" className="btn-ghost shrink-0">
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
          Back to all domains
        </Link>
      </div>

      {repositories.length === 0 ? (
        <div className="empty-state animate-fade-in">
          <Layers className="empty-state-icon" />
          <p className="empty-state-text text-lg font-medium text-foreground mb-2">No repositories in this domain yet</p>
          <p className="empty-state-text">Repositories are classified during the daily sync. Check back after the next run.</p>
        </div>
      ) : (
        <div className="repo-grid-compact animate-fade-in" style={{ animationDelay: '100ms' }}>
          {repositories.map((repo) => (
            <RepositoryCard key={repo.id} repo={repo} />
          ))}
        </div>
      )}
    </div>
  );
}