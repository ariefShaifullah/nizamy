import { Link } from 'react-router-dom';
import { formatDate, type BlogPost } from '../../utils/blog';
import UnsplashCredit from './UnsplashCredit';

interface BlogCardProps {
  key?: string | number;
  post: BlogPost;
  featured?: boolean;
}

export default function BlogCard({ key, post, featured = false }: BlogCardProps) {
  return (
    <Link
      key={key}
      to={`/blog/${post.slug}`}
      className={`group block cursor-pointer rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-indigo-300 dark:hover:border-indigo-500 hover:shadow-lg dark:hover:shadow-indigo-500/10 transition-all duration-300 hover:translate-y-[-2px] ${featured ? 'md:col-span-2 md:grid md:grid-cols-2' : ''
        }`}
    >
      {post.featured_image_url && (
        <div className={`relative overflow-hidden ${featured ? 'aspect-[16/10] md:aspect-auto' : 'aspect-[16/10]'}`}>
          <img
            src={post.featured_image_url}
            alt={post.featured_image_alt || post.title}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-charcoal)]/60 via-transparent to-transparent" />



          {post.photographer_name && (
            <div className="absolute bottom-2 right-2">
              <UnsplashCredit
                photographer={post.photographer_name}
                photographerUrl={post.photographer_url || ''}
                compact
              />
            </div>
          )}
        </div>
      )}

      <div className={`p-5 ${featured ? 'flex flex-col justify-center' : ''}`}>
        <div className="mb-3">
          <span className="inline-block px-2.5 py-0.5 font-['Lexend'] text-[10px] uppercase tracking-wider font-semibold rounded-full bg-[#1E3A8A]/10 dark:bg-blue-900/30 text-[#1E3A8A] dark:text-blue-300 border border-[#1E3A8A]/20 dark:border-blue-800">
            {post.category}
          </span>
        </div>

        <h3 className={`font-['Lexend'] font-semibold text-[#0F172A] dark:text-white group-hover:text-[#1E3A8A] dark:group-hover:text-blue-400 transition-colors duration-300 mb-2 leading-snug ${featured ? 'text-xl md:text-2xl' : 'text-base md:text-lg'
          }`}>
          {post.title}
        </h3>

        <p className="font-['Source_Sans_3'] text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-3 line-clamp-2">
          {post.excerpt}
        </p>

        <div className="flex items-center gap-2 font-['Source_Sans_3'] text-xs text-slate-400 dark:text-slate-500">
          <span>{formatDate(post.published_at)}</span>
          <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600" />
          <span>{post.reading_time} min baca</span>
        </div>
      </div>
    </Link>
  );
}
