import React from 'react';
import BlogCard from './BlogCard';

interface BlogGridProps {
  posts: any[];
  featuredPost: any;
  loading: boolean;
  error: string | null;
  searchQuery: string;
}

export default function BlogGrid({ posts, featuredPost, loading, error, searchQuery }: BlogGridProps) {
  const gridPosts = featuredPost ? posts.slice(1) : posts;

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl px-4 mt-10 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="animate-pulse overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950/60"
            aria-busy="true"
          >
            <div className="aspect-[16/10] bg-slate-200/80 dark:bg-slate-800" />
            <div className="space-y-4 p-6">
              <div className="h-3 w-24 rounded-full bg-slate-200/80 dark:bg-slate-800" />
              <div className="space-y-2">
                <div className="h-5 w-5/6 rounded-lg bg-slate-200/80 dark:bg-slate-800" />
                <div className="h-5 w-2/3 rounded-lg bg-slate-200/80 dark:bg-slate-800" />
              </div>
              <div className="h-3 w-full rounded-full bg-slate-200/80 dark:bg-slate-800" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-6xl px-4 mt-10 rounded-[1.75rem] border border-dashed border-red-200 bg-red-50 px-6 py-16 text-center dark:border-red-900/50 dark:bg-red-950/20" role="alert">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-xl font-bold text-red-600 dark:bg-red-900/30 dark:text-red-300">
          !
        </div>
        <p className="mb-1 font-['Lexend'] text-lg font-bold text-[#020617] dark:text-slate-100">Gagal Memuat Artikel</p>
        <p className="mx-auto max-w-md font-['Source_Sans_3'] text-sm text-slate-500 dark:text-slate-400">{error}</p>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="mx-auto max-w-6xl px-4 mt-10 rounded-[1.75rem] border border-dashed border-slate-200 bg-white px-6 py-16 text-center shadow-sm dark:border-slate-800 dark:bg-[#0F172A]/60">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-2xl dark:bg-slate-900">
          🔍
        </div>
        <p className="font-['Lexend'] text-lg font-bold text-[#020617] dark:text-slate-100">Artikel Tidak Ditemukan</p>
        <p className="mt-2 font-['Source_Sans_3'] text-sm text-slate-500 dark:text-slate-400">
          Silakan coba kata kunci lain atau pilih kategori yang berbeda.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 mt-10 space-y-10">
      {featuredPost && (
        <div className="rounded-[2rem] border border-slate-200/80 bg-gradient-to-br from-slate-50 to-white p-4 shadow-sm dark:border-slate-800/80 dark:from-[#0F172A] dark:to-[#0F172A]/60 md:p-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <div className="font-['Lexend'] text-xs font-semibold uppercase tracking-[0.22em] text-[#CA8A04] dark:text-yellow-500">
                Artikel Unggulan
              </div>
              <div className="mt-1 font-['Source_Sans_3'] text-sm text-slate-500 dark:text-slate-400">
                Rekomendasi bacaan hari ini
              </div>
            </div>
          </div>
          <BlogCard post={featuredPost} featured />
        </div>
      )}

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
        {gridPosts.map((post) => (
          <BlogCard key={post.id} post={post} />
        ))}
      </div>
    </div>
  );
}
