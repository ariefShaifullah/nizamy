import React from 'react';
import { Search } from 'lucide-react';

interface Category {
  id: string | number;
  name: string;
  post_count: number;
}

interface BlogCategoryFilterProps {
  categories: Category[];
  activeCategory: string | null;
  searchQuery: string;
  pagination: any;
  onSearchChange: (value: string) => void;
  onCategoryChange: (category: string | null) => void;
  onReset: () => void;
}

export default function BlogCategoryFilter({
  categories,
  activeCategory,
  searchQuery,
  pagination,
  onSearchChange,
  onCategoryChange,
  onReset
}: BlogCategoryFilterProps) {
  const hasFilters = Boolean(activeCategory || searchQuery);

  return (
    <div className="mx-auto max-w-6xl px-4 pb-8">
      <div className="-mt-8 rounded-[2rem] border border-slate-200/80 bg-white/90 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur-xl dark:border-slate-800/80 dark:bg-[#0F172A]/90 md:p-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full lg:max-w-2xl">
            <div className="pointer-events-none absolute inset-y-0 left-4 flex items-center">
              <Search className="h-4 w-4 text-slate-400 transition-colors group-focus-within:text-[#1E3A8A]" />
            </div>
            <input
              type="text"
              placeholder="Cari topik, dalil, atau kajian fikih..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 font-['Source_Sans_3'] text-sm text-[#020617] outline-none transition-all placeholder:text-slate-400 focus:border-[#1E3A8A] focus:bg-white focus:ring-4 focus:ring-[#1E3A8A]/10 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-blue-400 dark:focus:bg-slate-950"
              aria-label="Cari artikel"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {hasFilters && (
              <button
                onClick={onReset}
                className="rounded-xl border border-slate-200 bg-white px-4 py-3 font-['Source_Sans_3'] text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1E3A8A] dark:border-slate-800 dark:bg-slate-950/60 dark:text-slate-300 dark:hover:bg-slate-900 cursor-pointer"
                aria-label="Atur Ulang Pencarian"
              >
                Atur Ulang
              </button>
            )}
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 font-['Source_Sans_3'] text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-900/50 dark:text-slate-400">
              {pagination ? `${pagination.total_pages} halaman` : 'Memuat...'}
            </div>
          </div>
        </div>

        {categories.length > 0 && (
          <div className="mt-6 border-t border-slate-200/70 pt-5 dark:border-slate-800/70">
            <div className="mb-3 font-['Lexend'] text-xs font-semibold uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">
              Filter Kategori
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => onCategoryChange(null)}
                className={`rounded-xl px-4 py-2.5 font-['Source_Sans_3'] text-sm font-semibold transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1E3A8A] cursor-pointer ${
                  !activeCategory
                    ? 'bg-[#1E3A8A] text-white shadow-sm dark:bg-white dark:text-[#0F172A]'
                    : 'border border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50 dark:border-slate-800 dark:bg-[#0F172A] dark:text-slate-400 dark:hover:bg-slate-900'
                }`}
                aria-pressed={!activeCategory}
              >
                Semua Kategori
              </button>

              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => onCategoryChange(cat.name)}
                  className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 font-['Source_Sans_3'] text-sm font-semibold transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1E3A8A] cursor-pointer ${
                    activeCategory === cat.name
                      ? 'bg-[#1E3A8A] text-white shadow-md shadow-blue-900/20 dark:bg-blue-600'
                      : 'border border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50 dark:border-slate-800 dark:bg-[#0F172A] dark:text-slate-400 dark:hover:bg-slate-900'
                  }`}
                  aria-pressed={activeCategory === cat.name}
                >
                  <span>{cat.name}</span>
                  {cat.post_count > 0 && (
                    <span
                      className={`rounded-md px-2 py-0.5 text-[10px] font-bold ${
                        activeCategory === cat.name
                          ? 'bg-white/15 text-white'
                          : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                      }`}
                    >
                      {cat.post_count}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
