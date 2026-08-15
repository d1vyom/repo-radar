export function SearchSkeleton() {
  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="border border-border/50 rounded-lg p-4 bg-[#111111] animate-pulse">
          <div className="h-6 bg-border/40 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-border/20 rounded w-full mb-1"></div>
          <div className="h-4 bg-border/20 rounded w-5/6 mb-4"></div>
          
          <div className="flex gap-4 mt-4 border-t border-border/20 pt-4">
            <div className="h-4 bg-border/40 rounded w-16"></div>
            <div className="h-4 bg-border/40 rounded w-16"></div>
            <div className="h-4 bg-border/40 rounded w-24"></div>
          </div>
        </div>
      ))}
    </div>
  );
}
