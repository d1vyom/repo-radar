export default function RepoLoading() {
  return (
    <div className="section py-12 space-y-10 animate-pulse">
      {/* Header Skeleton */}
      <div className="border-b border-border/30 pb-10">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="flex items-start gap-5">
            <div className="relative shrink-0">
              <div className="w-20 h-20 rounded-2xl bg-surface-2" />
            </div>
            <div>
              <div className="h-8 bg-surface-2 rounded w-3/4 mb-2"></div>
              <div className="h-6 bg-surface-2 rounded w-1/2 mb-4"></div>
              <div className="flex flex-wrap gap-3">
                <div className="h-6 bg-surface-2 rounded w-24"></div>
                <div className="h-6 bg-surface-2 rounded w-20"></div>
                <div className="h-6 bg-surface-2 rounded w-20"></div>
              </div>
            </div>
          </div>
          <div className="w-32 h-10 bg-surface-2 rounded-lg shrink-0" />
        </div>
      </div>

      {/* Topics Skeleton */}
      <div className="flex flex-wrap gap-2">
        <div className="h-6 bg-surface-2 rounded w-24"></div>
        <div className="h-6 bg-surface-2 rounded w-28"></div>
        <div className="h-6 bg-surface-2 rounded w-20"></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-8">
          <div className="card p-5">
            <div className="h-6 bg-surface-2 rounded w-40 mb-4"></div>
            <div className="h-10 bg-surface-2 rounded w-full"></div>
          </div>
          <div className="card overflow-hidden">
            <div className="border-b border-border/30 bg-surface-2 p-5">
              <div className="h-6 bg-surface-2 rounded w-40"></div>
            </div>
            <div className="p-6 space-y-4">
              <div className="h-4 bg-surface-2 rounded w-full"></div>
              <div className="h-4 bg-surface-2 rounded w-5/6"></div>
              <div className="h-4 bg-surface-2 rounded w-4/6"></div>
              <div className="h-4 bg-surface-2 rounded w-3/6"></div>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          <div className="card p-5">
            <div className="h-6 bg-surface-2 rounded w-32 mb-5"></div>
            <div className="grid grid-cols-2 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="text-center p-3 bg-surface-2 rounded-xl">
                  <div className="h-4 bg-surface-2 rounded w-16 mx-auto mb-1"></div>
                  <div className="h-8 bg-surface-2 rounded w-full"></div>
                </div>
              ))}
            </div>
          </div>
          <div className="card p-5 space-y-4">
            <div className="h-6 bg-surface-2 rounded w-24 mb-4"></div>
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <div className="h-4 bg-surface-2 rounded w-24"></div>
                  <div className="h-4 bg-surface-2 rounded w-32"></div>
                </div>
              ))}
            </div>
          </div>
          <div className="card p-5 space-y-4">
            <div className="h-6 bg-surface-2 rounded w-24 mb-4"></div>
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center gap-3 text-sm p-3 bg-surface-2 rounded-lg">
                  <div className="w-8 h-8 rounded-lg bg-surface-3" />
                  <div className="flex-1">
                    <div className="h-3 bg-surface-2 rounded w-16"></div>
                    <div className="h-4 bg-surface-2 rounded w-full"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="card p-5">
            <div className="h-6 bg-surface-2 rounded w-32 mb-4"></div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="h-8 bg-surface-2 rounded w-40"></div>
              <div className="h-4 bg-surface-2 rounded w-32"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}