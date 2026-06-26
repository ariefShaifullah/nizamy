import React from 'react';

interface BlogPaginationProps {
  pagination: any;
  page: number;
  onPageChange: (newPage: number) => void;
  loading?: boolean;
}

export default function BlogPagination({ pagination, page, onPageChange, loading }: BlogPaginationProps) {
  if (!pagination || pagination.page >= pagination.total_pages) {
    return null;
  }

  return (
    <div className="mx-auto max-w-6xl px-4 mt-16 flex justify-center border-t border-slate-200/70 pt-10 dark:border-slate-800/70">
      <button
        onClick={() => onPageChange(page + 1)}
        disabled={loading}
        className="inline-flex items-center justify-center rounded-2xl bg-teal-600 px-8 py-3.5 font-['Lexend'] text-sm font-bold tracking-wide text-white shadow-lg shadow-teal-600/20 transition-all hover:bg-teal-700 hover:shadow-teal-600/40 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-teal-500 dark:hover:bg-teal-400 cursor-pointer"
        aria-label="Muat Lebih Banyak Artikel"
      >
        {loading ? 'Memuat...' : 'Tampilkan Lebih Banyak ↓'}
      </button>
    </div>
  );
}
