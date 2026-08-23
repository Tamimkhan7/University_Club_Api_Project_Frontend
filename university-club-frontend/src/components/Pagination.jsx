import { ChevronDown } from "lucide-react";

export default function Pagination({
  page,
  totalPages,
  onPageChange,
  maxVisible = 5,
  className = "",
}) {
  if (!totalPages || totalPages <= 1) return null;

  const pageNumbers = [...Array(Math.min(totalPages, maxVisible))]
    .map((_, i) => {
      let pageNum = i + 1;
      if (totalPages > maxVisible && page > 3) {
        pageNum = page - 2 + i;
      }
      return pageNum;
    })
    .filter((n) => n >= 1 && n <= totalPages);

  return (
    <div className={`flex flex-wrap justify-center items-center gap-3 mt-10 ${className}`}>
      <button
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
        className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 disabled:opacity-40 disabled:cursor-not-allowed hover:border-red-300 dark:hover:border-red-500/30 transition-all duration-200 text-sm font-medium"
      >
        <ChevronDown className="w-4 h-4 rotate-90" />
        Previous
      </button>

      <div className="flex items-center gap-2">
        {pageNumbers.map((pageNum) => (
          <button
            key={pageNum}
            onClick={() => onPageChange(pageNum)}
            className={`w-10 h-10 rounded-xl text-sm font-medium transition-all duration-200 ${
              page === pageNum
                ? "btn-primary w-10 h-10 flex items-center justify-center"
                : "bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 hover:border-red-300 dark:hover:border-red-500/30"
            }`}
          >
            {pageNum}
          </button>
        ))}
      </div>

      <button
        disabled={page >= totalPages}
        onClick={() => onPageChange(page + 1)}
        className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 disabled:opacity-40 disabled:cursor-not-allowed hover:border-red-300 dark:hover:border-red-500/30 transition-all duration-200 text-sm font-medium"
      >
        Next
        <ChevronDown className="w-4 h-4 -rotate-90" />
      </button>
    </div>
  );
}
