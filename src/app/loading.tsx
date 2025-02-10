export default function Loading() {
  return (
    <div className="space-y-8">
      <div className="space-y-6">
        {/* カテゴリーフィルター */}
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-9 w-24 animate-pulse rounded-lg bg-muted" />
          ))}
        </div>

        {/* ソートフィルター */}
        <div className="flex flex-wrap gap-4">
          <div className="h-9 w-32 animate-pulse rounded-lg bg-muted" />
        </div>

        {/* タグフィルター */}
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="h-8 w-20 animate-pulse rounded-full bg-muted" />
          ))}
        </div>

        {/* 記事カード */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="flex flex-col overflow-hidden rounded-lg border bg-card"
            >
              <div className="aspect-video w-full animate-pulse bg-muted" />
              <div className="space-y-4 p-4">
                <div className="flex items-center gap-2">
                  <div className="h-4 w-16 animate-pulse rounded-full bg-muted" />
                  <div className="h-4 w-24 animate-pulse rounded-md bg-muted" />
                </div>
                <div className="space-y-2">
                  <div className="h-4 w-full animate-pulse rounded-md bg-muted" />
                  <div className="h-4 w-2/3 animate-pulse rounded-md bg-muted" />
                </div>
                <div className="space-y-2">
                  <div className="h-4 w-full animate-pulse rounded-md bg-muted" />
                  <div className="h-4 w-full animate-pulse rounded-md bg-muted" />
                  <div className="h-4 w-1/2 animate-pulse rounded-md bg-muted" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
} 