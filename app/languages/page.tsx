import Link from 'next/link';
import { supabaseAdmin } from '@/lib/supabase/server';
import { SUPPORTED_LANGUAGES } from '@/lib/constants';
import { Code2, ChevronRight, Search } from 'lucide-react';

export const dynamic = 'force-dynamic';
export const revalidate = 600;

interface LanguageRow {
  language: string;
  count: number;
}

async function getTopLanguages(limit = 24): Promise<LanguageRow[]> {
  try {
    const { data, error } = await supabaseAdmin
      .from('repositories')
      .select('language')
      .not('language', 'is', null);

    if (error || !data) {
      return SUPPORTED_LANGUAGES.slice(0, limit).map((language) => ({ language, count: 0 }));
    }

    const counts = new Map<string, number>();
    for (const row of data as unknown as { language: string | null }[]) {
      if (!row.language) continue;
      counts.set(row.language, (counts.get(row.language) ?? 0) + 1);
    }

    const sorted = [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([language, count]) => ({ language, count }));

    if (sorted.length === 0) {
      return SUPPORTED_LANGUAGES.slice(0, limit).map((language) => ({ language, count: 0 }));
    }

    return sorted;
  } catch (error) {
    console.error('Languages page fetch failed, using fallback:', error);
    return SUPPORTED_LANGUAGES.slice(0, limit).map((language) => ({ language, count: 0 }));
  }
}

export default async function LanguagesPage() {
  const languages = await getTopLanguages();
  const totalRepos = languages.reduce((sum, l) => sum + l.count, 0);

  return (
    <div className="section py-12 space-y-10">
      <div className="space-y-3 animate-fade-in">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-primary/10">
            <Code2 className="h-6 w-6 text-primary" aria-hidden="true" />
          </div>
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">Languages Directory</h1>
            <p className="text-muted-foreground mt-1">
              Browse repositories grouped by their primary programming language. Click any language to run an instant
              filtered search.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span className="badge badge-muted">{languages.length} Languages</span>
          <span className="badge badge-primary">{totalRepos.toLocaleString()} Total Repositories</span>
        </div>
      </div>

      {languages.length === 0 ? (
        <div className="empty-state animate-fade-in">
          <Search className="empty-state-icon" />
          <p className="empty-state-text text-lg font-medium text-foreground mb-2">No languages available yet</p>
          <p className="empty-state-text">Run the sync cron to populate repositories and their languages</p>
        </div>
      ) : (
        <div className="language-grid">
          {languages.map(({ language, count }) => (
            <Link
              key={language}
              href={`/search?language=${encodeURIComponent(language.toLowerCase())}`}
              className="card card-interactive group p-4"
              aria-label={`Search ${language} repositories (${count.toLocaleString()})`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                    <Code2 className="h-4 w-4 text-primary" aria-hidden="true" />
                  </div>
                  <span className="font-medium text-sm text-foreground truncate group-hover:text-primary transition-colors">
                    {language}
                  </span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs font-medium text-muted-foreground bg-surface-2 px-2.5 py-1 rounded-full tabular-nums">
                    {count.toLocaleString()}
                  </span>
                  <ChevronRight className="h-4 w-4 text-muted-foreground/50 group-hover:text-primary transition-colors" aria-hidden="true" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}