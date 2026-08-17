'use client';

import { useEffect } from 'react';
import { AlertCircle, RefreshCw, Home, Code2 } from 'lucide-react';
import Link from 'next/link';

export default function LanguagesError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Languages page error:', error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center max-w-md animate-fade-in">
        <div className="w-16 h-16 rounded-full bg-danger/10 flex items-center justify-center mx-auto mb-6">
          <AlertCircle className="w-8 h-8 text-danger" />
        </div>
        <h1 className="text-2xl font-bold text-foreground mb-3">Languages unavailable</h1>
        <p className="text-muted-foreground mb-6">
          Could not load languages directory. Please try again.
        </p>
        {error.digest && (
          <p className="text-xs text-muted-foreground/60 font-mono mb-6">
            Error ID: {error.digest}
          </p>
        )}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button onClick={reset} className="btn-primary">
            <RefreshCw className="w-4 h-4" aria-hidden="true" />
            Retry
          </button>
          <Link href="/search" className="btn-secondary">
            <Home className="w-4 h-4" aria-hidden="true" />
            Search Repos
          </Link>
        </div>
      </div>
    </div>
  );
}