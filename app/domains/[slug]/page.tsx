import { getPopularByDomain } from '@/lib/analytics';
import { RepositoryCard } from '@/components/repository-card';
import { supabaseAdmin } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';

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
    <div className="w-full max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">{domain.name} Repositories</h1>
        <p className="text-muted-foreground mt-2">
          Trending and rapidly growing {domain.name.toLowerCase()} projects, classified by RepoRadar.
        </p>
      </div>

      {repositories.length === 0 ? (
        <div className="text-center py-12 border border-border/50 rounded-lg bg-[#111111]">
          <p className="text-muted-foreground">No repositories classified in this domain yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          {repositories.map((repo) => (
            <RepositoryCard key={repo.id} repo={repo} />
          ))}
        </div>
      )}
    </div>
  );
}
