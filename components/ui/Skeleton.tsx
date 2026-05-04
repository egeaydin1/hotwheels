export function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`animate-pulse bg-hw-border rounded ${className}`} />
  )
}

export function CarCardSkeleton() {
  return (
    <div className="bg-hw-card border border-hw-border rounded-xl overflow-hidden">
      <Skeleton className="aspect-square" />
      <div className="p-3 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
        <Skeleton className="h-7 w-full mt-2" />
      </div>
    </div>
  )
}

export function PortfolioCardSkeleton() {
  return (
    <div className="bg-hw-card border border-hw-border rounded-xl p-4 space-y-3">
      <Skeleton className="h-5 w-2/3" />
      <Skeleton className="h-4 w-1/3" />
      <Skeleton className="h-8 w-full mt-4" />
    </div>
  )
}
