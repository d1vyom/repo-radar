import Link from 'next/link';
import { Layers } from 'lucide-react';

interface DomainCardProps {
  name: string;
  slug: string;
  count: number;
}

export function DomainCard({ name, slug, count }: DomainCardProps) {
  return (
    <Link href={`/search?domain=${slug}`}>
      <div className="flex items-center justify-between rounded-lg border border-border/50 bg-[#111111] p-4 hover:bg-white/[0.02] hover:border-foreground/20 transition-all duration-200">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-md bg-white/5">
            <Layers className="h-5 w-5 text-foreground/80" />
          </div>
          <span className="font-medium text-sm text-foreground">{name}</span>
        </div>
        <span className="text-xs text-muted-foreground bg-white/5 px-2 py-1 rounded-full">
          {count.toLocaleString()} repos
        </span>
      </div>
    </Link>
  );
}
