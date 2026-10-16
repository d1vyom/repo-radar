import Link from 'next/link';
import { Layers, ChevronRight, Search } from 'lucide-react';
import { getDomains } from '@/lib/directories';
import { DataNotice } from '@/components/data-notice';

export const dynamic = 'force-dynamic';
export const revalidate = 600;

export default async function DomainsPage() {
  const domains = await getDomains();
  const totalRepos = domains.reduce((sum, d) => sum + d.count, 0);

  return (
    <div className="section py-12 space-y-10">
      <div className="space-y-3 animate-fade-in">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-primary/10">
            <Layers className="h-6 w-6 text-primary" aria-hidden="true" />
          </div>
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">Domains Directory</h1>
            <p className="text-muted-foreground mt-1">
              Browse repositories grouped by their primary domain. Each card opens a curated, constantly updated list
              for that area.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span className="badge badge-muted">{domains.length} Domains</span>
          <span className="badge badge-primary">{totalRepos.toLocaleString()} Domain Assignments</span>
        </div>
      </div>

      {domains.some(domain => domain.is_sample) && <DataNotice />}
      {domains.length === 0 ? (
        <div className="empty-state animate-fade-in">
          <Search className="empty-state-icon" />
          <p className="empty-state-text text-lg font-medium text-foreground mb-2">No domains available yet</p>
          <p className="empty-state-text">Run the sync cron to populate domains and classify repositories</p>
        </div>
      ) : (
        <div className="domain-grid">
          {domains.map((domain) => (
            <Link
              key={domain.slug}
              href={`/domains/${domain.slug}`}
              className="card card-interactive group p-5"
              aria-label={`Browse ${domain.name} repositories (${domain.count.toLocaleString()})`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="p-3 rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors shrink-0">
                    <Layers className="h-5 w-5 text-primary" aria-hidden="true" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-medium text-sm text-foreground truncate group-hover:text-primary transition-colors">
                      {domain.name}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {domain.count.toLocaleString()} repository{domain.count !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground/50 group-hover:text-primary transition-colors shrink-0" aria-hidden="true" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}