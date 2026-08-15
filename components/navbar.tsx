import Link from 'next/link';
import { Search, TrendingUp, Layers, Code2, GitBranch } from 'lucide-react';

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-14 max-w-7xl items-center px-4">
        <Link href="/" className="flex items-center space-x-2 mr-6">
          <GitBranch className="h-6 w-6 text-foreground" />
          <span className="font-bold tracking-tight text-foreground">RepoRadar</span>
        </Link>
        <nav className="flex items-center space-x-6 text-sm font-medium text-muted-foreground flex-1">
          <Link href="/search" className="flex items-center hover:text-foreground transition-colors">
            <Search className="mr-2 h-4 w-4" /> Search
          </Link>
          <Link href="/trending" className="flex items-center hover:text-foreground transition-colors">
            <TrendingUp className="mr-2 h-4 w-4" /> Trending
          </Link>
          <Link href="/domains" className="flex items-center hover:text-foreground transition-colors">
            <Layers className="mr-2 h-4 w-4" /> Domains
          </Link>
          <Link href="/languages" className="flex items-center hover:text-foreground transition-colors">
            <Code2 className="mr-2 h-4 w-4" /> Languages
          </Link>
        </nav>
      </div>
    </header>
  );
}
