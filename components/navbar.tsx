'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Search, TrendingUp, Layers, Code2, GitBranch } from 'lucide-react';

export function Navbar() {
  const pathname = usePathname();
  
  const navItems = [
    { href: '/search', label: 'Search', icon: Search },
    { href: '/trending', label: 'Trending', icon: TrendingUp },
    { href: '/domains', label: 'Domains', icon: Layers },
    { href: '/languages', label: 'Languages', icon: Code2 },
  ] as const;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
      <div className="section flex h-16 items-center">
        <Link href="/" className="flex items-center space-x-2 mr-8 focus-visible-ring rounded-lg px-2 py-1" aria-label="RepoRadar Home">
          <GitBranch className="h-6 w-6 text-primary" />
          <span className="font-bold tracking-tight text-foreground text-lg">RepoRadar</span>
        </Link>
        <nav className="flex-1 flex items-center space-x-1" aria-label="Main navigation">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'text-primary bg-primary/10'
                    : 'text-muted-foreground hover:text-foreground hover:bg-surface-2'
                }`}
                aria-current={isActive ? 'page' : undefined}
              >
                <item.icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}