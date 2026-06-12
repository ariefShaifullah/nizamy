import React from 'react';
import { Calendar, Clock } from 'lucide-react';
import { formatDate } from '../../utils/blog';
import UnsplashCredit from './UnsplashCredit';

interface BlogArticleHeaderProps {
  post: any;
}

export default function BlogArticleHeader({ post }: BlogArticleHeaderProps) {
  return (
    <>
      <div className="mb-4">
        <span className="inline-block px-2.5 py-0.5 font-['Lexend'] text-[10px] uppercase tracking-wider font-semibold rounded-full bg-[#1E3A8A]/10 dark:bg-blue-900/30 text-[#1E3A8A] dark:text-blue-300 border border-[#1E3A8A]/20 dark:border-blue-800">
          {post.category}
        </span>
      </div>

      <h1 className="font-['Lexend'] text-2xl md:text-3xl lg:text-4xl font-bold text-[#0F172A] dark:text-white leading-tight mb-4">
        {post.title}
      </h1>

      <div className="flex flex-wrap items-center gap-4 font-['Source_Sans_3'] text-sm text-slate-600 dark:text-slate-400 mb-8" aria-label="Informasi Artikel">
        <span className="flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5" aria-hidden="true" /> {formatDate(post.published_at)}
        </span>
        <span className="flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5" aria-hidden="true" /> {post.reading_time} menit baca
        </span>
        <span>{post.author}</span>
      </div>

      {post.featured_image_url && (
        <div className="mb-10">
          <div className="rounded-xl overflow-hidden shadow-sm">
            <img
              src={post.featured_image_url}
              alt={post.featured_image_alt || post.title}
              className="w-full h-auto object-cover"
            />
          </div>
          {post.photographer_name && (
            <UnsplashCredit
              photographer={post.photographer_name}
              photographerUrl={post.photographer_url || ''}
            />
          )}
        </div>
      )}
    </>
  );
}
