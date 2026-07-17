export function Skeleton({ className = "" }) {
  return <div className={`skeleton rounded ${className}`} />;
}

export function SkeletonKpi() {
  return (
    <div className="panel p-4">
      <Skeleton className="h-3 w-24" />
      <Skeleton className="mt-3 h-7 w-32" />
    </div>
  );
}

export function SkeletonBlock({ rows = 4 }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className="h-10 w-full" />
      ))}
    </div>
  );
}
