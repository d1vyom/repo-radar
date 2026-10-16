export function SearchSkeleton() {
  return (
    <div className="flex flex-col md:flex-row gap-8 animate-pulse">
      <aside className="w-full md:w-72 lg:w-80 flex-shrink-0 space-y-6">
        <div className="h-10 bg-surface-2 rounded-lg border border-border/50"></div>
        <div className="h-10 bg-surface-2 rounded-lg border border-border/50"></div>
        <div className="h-10 bg-surface-2 rounded-lg border border-border/50"></div>
        <div className="h-10 bg-surface-2 rounded-lg border border-border/50"></div>
        <div className="h-10 bg-surface-2 rounded-lg border border-border/50"></div>
        <div className="h-10 bg-surface-2 rounded-lg border border-border/50"></div>
      </aside>
      <main className="flex-1 min-w-0">
        <div className="h-10 bg-surface-2 rounded-lg border border-border/50 mb-6"></div>
        <div className="repo-grid-compact">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="card p-5 border-border/50 bg-surface-1">
              <div className="h-6 bg-border/30 rounded w-3/4 mb-3"></div>
              <div className="h-4 bg-border/20 rounded w-full mb-2"></div>
              <div className="h-4 bg-border/20 rounded w-5/6 mb-4"></div>
              <div className="flex gap-4 mt-4 border-t border-border/20 pt-4">
                <div className="h-4 bg-border/30 rounded w-16"></div>
                <div className="h-4 bg-border/30 rounded w-16"></div>
                <div className="h-4 bg-border/30 rounded w-24"></div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}