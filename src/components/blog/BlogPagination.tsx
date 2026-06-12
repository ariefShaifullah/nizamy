import React from 'react';

interface BlogPaginationProps {
  pagination: any;
  page: number;
  onPageChange: (newPage: number) => void;
}

export default function BlogPagination({ pagination, page, onPageChange }: BlogPaginationProps) {
  if (!pagination || pagination.total_pages <= 1) {
    return null;
  }

  return (
    <nav 
      aria-label="Pagination Navigation"
      className="mx-auto max-w-6xl px-4 mt-16 flex flex-wrap items-center justify-center gap-3 border-t border-slate-200/70 pt-8 dark:border-slate-800/70"
    >
      <button
        onClick={() => onPageChange(Math.max(1, page - 1))}
        disabled={page === 1}
        className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2.5 font-['Source_Sans_3'] text-sm font-semibold text-slate-700 shadow-sm transition-all hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1E3A8A] dark:border-slate-800 dark:bg-[#0F172A]/60 dark:text-slate-300 dark:hover:bg-slate-900 cursor-pointer"
        aria-label="Halaman Sebelumnya"
      >
        ← Sebelumnya
      </button>

      <span 
        className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 font-['Lexend'] text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:border-slate-800 dark:bg-[#0F172A]/60 dark:text-slate-400"
        aria-current="page"
      >
        Halaman <span className="text-[#020617] dark:text-slate-100">{pagination.page}</span> dari{' '}
        <span className="text-[#020617] dark:text-slate-100">{pagination.total_pages}</span>
      </span>

      <button
        onClick={() => onPageChange(Math.min(pagination.total_pages, page + 1))}
        disabled={page === pagination.total_pages}
        className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2.5 font-['Source_Sans_3'] text-sm font-semibold text-slate-700 shadow-sm transition-all hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1E3A8A] dark:border-slate-800 dark:bg-[#0F172A]/60 dark:text-slate-300 dark:hover:bg-slate-900 cursor-pointer"
        aria-label="Halaman Berikutnya"
      >
        Berikutnya →
      </button>
    </nav>
  );
}
