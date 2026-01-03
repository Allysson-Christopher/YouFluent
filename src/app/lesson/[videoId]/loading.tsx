export default function LessonLoading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main content skeleton */}
        <div className="lg:col-span-2 space-y-6">
          {/* Video player skeleton */}
          <div className="aspect-video bg-muted animate-pulse rounded-lg" />

          {/* Lesson card skeleton */}
          <div className="p-6 border rounded-lg">
            <div className="h-6 bg-muted rounded w-1/2 mb-4" />
            <div className="h-4 bg-muted rounded w-3/4" />
          </div>

          {/* Exercise panel skeleton */}
          <div className="p-6 border rounded-lg">
            <div className="h-6 bg-muted rounded w-1/3 mb-4" />
            <div className="space-y-3">
              <div className="h-12 bg-muted rounded" />
              <div className="h-12 bg-muted rounded" />
              <div className="h-12 bg-muted rounded" />
            </div>
          </div>
        </div>

        {/* Sidebar skeleton */}
        <div className="space-y-6">
          {/* Chunks skeleton */}
          <div className="p-4 border rounded-lg">
            <div className="h-5 bg-muted rounded w-1/2 mb-4" />
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-16 bg-muted rounded" />
              ))}
            </div>
          </div>

          {/* Vocabulary skeleton */}
          <div className="p-4 border rounded-lg">
            <div className="h-5 bg-muted rounded w-1/2 mb-4" />
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-12 bg-muted rounded" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
