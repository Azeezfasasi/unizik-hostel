"use client";
import { ChevronLeft, ChevronRight } from "lucide-react";

/**
 * Shared pagination control for dashboard list/table pages.
 * Pass 1-indexed currentPage/totalPages; onPageChange receives the new page number.
 */
export default function Pagination({ currentPage, totalPages, onPageChange, totalItems, pageSize }) {
  if (!totalPages || totalPages <= 1) return null;

  const start = totalItems && pageSize ? (currentPage - 1) * pageSize + 1 : null;
  const end = totalItems && pageSize ? Math.min(currentPage * pageSize, totalItems) : null;

  const pageNumbers = () => {
    const pages = [];
    const window = 1;
    for (let p = 1; p <= totalPages; p++) {
      if (p === 1 || p === totalPages || (p >= currentPage - window && p <= currentPage + window)) {
        pages.push(p);
      } else if (pages[pages.length - 1] !== "...") {
        pages.push("...");
      }
    }
    return pages;
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-1 py-3">
      {totalItems != null && (
        <p className="text-sm text-gray-500 order-2 sm:order-1">
          Showing <span className="font-medium text-gray-700">{start}</span>–
          <span className="font-medium text-gray-700">{end}</span> of{" "}
          <span className="font-medium text-gray-700">{totalItems}</span>
        </p>
      )}

      <div className="flex items-center gap-1 order-1 sm:order-2">
        <button
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          aria-label="Previous page"
          className="inline-flex items-center justify-center w-9 h-9 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition disabled:opacity-40 disabled:hover:bg-white"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {pageNumbers().map((p, idx) =>
          p === "..." ? (
            <span key={`ellipsis-${idx}`} className="px-2 text-gray-400 text-sm select-none">
              …
            </span>
          ) : (
            <button
              key={p}
              onClick={() => onPageChange(p)}
              aria-current={p === currentPage ? "page" : undefined}
              className={`inline-flex items-center justify-center min-w-9 h-9 px-2 rounded-lg text-sm font-medium transition ${
                p === currentPage
                  ? "bg-blue-900 text-white shadow-sm"
                  : "text-gray-600 hover:bg-gray-50 border border-transparent hover:border-gray-200"
              }`}
            >
              {p}
            </button>
          )
        )}

        <button
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          aria-label="Next page"
          className="inline-flex items-center justify-center w-9 h-9 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition disabled:opacity-40 disabled:hover:bg-white"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
