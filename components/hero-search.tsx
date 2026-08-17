'use client';

import Link from 'next/link';
import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Filter } from 'lucide-react';

interface HeroSearchProps {
  initialQuery?: string;
  className?: string;
  style?: React.CSSProperties;
}

export function HeroSearch({ initialQuery = '', className, style }: HeroSearchProps) {
  const router = useRouter();
  const [value, setValue] = useState(initialQuery);
  const [isFocused, setIsFocused] = useState(false);

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const trimmed = value.trim();
    const target = trimmed ? `/search?q=${encodeURIComponent(trimmed)}` : '/search';
    router.push(target);
  }

  return (
    <form onSubmit={handleSubmit} className={`w-full max-w-3xl relative ${className ?? ''}`} role="search" style={style}>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
          <Search className={`h-5 w-5 transition-colors ${
            isFocused ? 'text-primary' : 'text-muted-foreground'
          }`} aria-hidden="true" />
        </div>
        <input
          type="text"
          aria-label="Search repositories"
          className={`input-search ${
            isFocused ? 'border-primary/50 ring-2 ring-primary/20' : ''
          }`}
          placeholder="Search repositories, languages, or topics..."
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          autoComplete="off"
        />
        <button
          type="submit"
          className="absolute right-2 top-1/2 -translate-y-1/2 px-5 py-2.5 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-primary/40 focus:ring-offset-2 focus:ring-offset-background transition-all duration-200 disabled:opacity-50"
          disabled={!value.trim()}
          aria-label="Search"
        >
          Search
        </button>
      </div>
      <div className="flex items-center justify-between mt-4 text-sm text-muted-foreground">
        <span>{'Try: "react hooks", "machine learning", "rust cli"'}</span>
        <Link 
          href="/search" 
          className="btn-ghost px-3 py-1.5 text-xs"
        >
          <Filter className="h-3.5 w-3.5" aria-hidden="true" />
          Advanced Filters
        </Link>
      </div>
    </form>
  );
}