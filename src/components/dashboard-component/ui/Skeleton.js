"use client";

// Shared loading skeletons — a page-level spinner and a table-row skeleton,
// used in place of ad-hoc "Loading..." text across the dashboard.
export function PageSpinner({ label = "Loading..." }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-3">
      <div className="w-9 h-9 border-[3px] border-blue-900/15 border-t-blue-900 rounded-full animate-spin" />
      <p className="text-sm text-gray-500">{label}</p>
    </div>
  );
}

export function TableSkeleton({ rows = 5, cols = 4 }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="flex items-center gap-4 px-5 py-4 border-b border-gray-50 last:border-0">
          {Array.from({ length: cols }).map((__, c) => (
            <div
              key={c}
              className="h-3.5 bg-gray-100 rounded animate-pulse"
              style={{ width: c === 0 ? "20%" : `${60 / cols}%` }}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
