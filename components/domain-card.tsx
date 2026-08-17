import Link from 'next/link';
import { Layers, ChevronRight } from 'lucide-react';

interface DomainCardProps {
  name: string;
  slug: string;
  count: number;
}

export function DomainCard({ name, slug, count }: DomainCardProps) {
  return (
    <Link 
      href={`/domains/${slug}`}
      className="card card-interactive group p-5"
      aria-label={`Browse ${name} repositories`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors">
            <Layers className="h-5 w-5 text-primary" aria-hidden="true" />
          </div>
          <span className="font-medium text-sm text-foreground">{name}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-muted-foreground bg-surface-2 px-2.5 py-1 rounded-full tabular-nums">
            {count.toLocaleString()}
          </span>
          <ChevronRight className="h-4 w-4 text-muted-foreground/50 group-hover:text-primary transition-colors" aria-hidden="true" />
        </div>
      </div>
    </Link>
  );
}