import React from 'react';

interface BlogArticleContentProps {
  cleanContent: string;
  tags: string[];
}

export default function BlogArticleContent({ cleanContent, tags }: BlogArticleContentProps) {
  return (
    <>
      <div
        className="prose prose-slate dark:prose-invert max-w-none w-full font-['Source_Sans_3']
          prose-headings:font-['Lexend'] prose-headings:text-[#0F172A] dark:prose-headings:text-white
          prose-h2:text-2xl prose-h3:text-xl
          prose-h2:font-semibold prose-h3:font-semibold
          prose-p:text-slate-700 dark:prose-p:text-slate-300 prose-p:leading-relaxed prose-p:text-justify
          prose-a:text-[#1E3A8A] dark:prose-a:text-blue-400 prose-a:font-semibold hover:prose-a:text-[#0F172A] dark:hover:prose-a:text-blue-300
          prose-strong:text-[#0F172A] dark:prose-strong:text-white
          prose-li:text-slate-700 dark:prose-li:text-slate-300 prose-li:text-justify
          prose-img:max-w-full prose-img:mx-auto prose-img:rounded-xl
          prose-pre:max-w-full prose-pre:overflow-x-auto
          prose-table:block prose-table:overflow-x-auto"
        dangerouslySetInnerHTML={{ __html: cleanContent }}
      />

      {tags.length > 0 && (
        <div className="mt-10 pt-8 border-t border-slate-200 dark:border-slate-800" aria-label="Tags Artikel">
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <span key={tag} className="px-3 py-1 font-['Source_Sans_3'] text-xs font-medium rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                #{tag}
              </span>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
