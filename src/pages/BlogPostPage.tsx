import { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import DOMPurify from 'dompurify';
import { marked } from 'marked';
import { ArrowLeft } from 'lucide-react';
import ReadingProgress from '../components/blog/ReadingProgress';
import BlogCard from '../components/blog/BlogCard';
import BlogArticleHeader from '../components/blog/BlogArticleHeader';
import BlogArticleContent from '../components/blog/BlogArticleContent';
import { useBlogPost } from '../hooks/useBlogPosts';

// Helper: Convert content to HTML (supports both HTML and Markdown)
function contentToHtml(content: string): string {
  let processed = content || '';
  // ROOT FIX: The AI generator encodes ALL spaces as &nbsp; (non-breaking spaces).
  // This prevents the browser from wrapping text at word boundaries, causing
  // entire paragraphs to overflow the container as one giant unbreakable line.
  // Convert them back to normal spaces so word-wrap works correctly.
  processed = processed.replace(/&nbsp;/g, ' ');
  // Fix stray markdown bold/italic that the AI sometimes leaves inside HTML tags
  processed = processed.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  processed = processed.replace(/\*([^*]+)\*/g, '<em>$1</em>');

  const looksLikeHtml = /<[a-z][\s\S]*>/i.test(processed);
  if (looksLikeHtml) {
    return processed; 
  }
  return marked.parse(processed, { async: false }) as string;
}

export default function BlogPostPage() {
  const { slug } = useParams<{ slug: string }>();
  const { post, loading, error } = useBlogPost(slug || '');

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0F172A]">
        <div className="max-w-3xl mx-auto px-4 pt-24 pb-20 animate-pulse" aria-busy="true">
          <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/4 mb-8" />
          <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded w-3/4 mb-4" />
          <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/3 mb-12" />
          <div className="aspect-[16/9] bg-slate-200 dark:bg-slate-800 rounded-xl mb-12" />
          <div className="space-y-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-4 bg-slate-200 dark:bg-slate-800 rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0F172A] flex items-center justify-center">
        <div className="text-center" role="alert">
          <h1 className="text-2xl font-bold text-[#0F172A] dark:text-white mb-2 font-['Lexend']">Artikel Tidak Ditemukan</h1>
          <p className="text-slate-500 dark:text-slate-400 mb-6 font-['Source_Sans_3']">{error || 'Artikel yang Anda cari tidak tersedia.'}</p>
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#1E3A8A] text-white text-sm font-semibold hover:bg-blue-900 transition-colors font-['Source_Sans_3']"
          >
            <ArrowLeft className="w-4 h-4" aria-hidden="true" /> Kembali ke Blog
          </Link>
        </div>
      </div>
    );
  }

  const rawHtml = contentToHtml(post.content);
  const cleanContent = DOMPurify.sanitize(rawHtml, {
    ALLOWED_TAGS: [
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'p', 'br', 'b', 'i', 'strong', 'em', 'u',
      'a', 'ul', 'ol', 'li', 'blockquote', 'pre', 'code',
      'img', 'figure', 'figcaption',
      'table', 'thead', 'tbody', 'tr', 'th', 'td',
      'div', 'span'
    ],
    ALLOWED_ATTR: ['href', 'src', 'alt', 'title', 'class', 'id', 'target', 'rel']
  });

  return (
    <>
      <Helmet>
        <title>{post.seo_title || `${post.title} | NIZAMY`}</title>
        <meta name="description" content={post.seo_description || post.excerpt} />
        <link rel="canonical" href={`https://nizamy.com/blog/${post.slug}`} />
        <meta property="og:title" content={post.seo_title || post.title} />
        <meta property="og:description" content={post.seo_description || post.excerpt} />
        <meta property="og:url" content={`https://nizamy.com/blog/${post.slug}`} />
        {post.featured_image_url && (
          <meta property="og:image" content={post.featured_image_url} />
        )}
        <meta property="og:type" content="article" />
        <meta property="article:published_time" content={post.published_at} />
        <meta property="article:author" content={post.author} />
        <meta property="article:section" content={post.category} />
        {post.tags.map((tag) => (
          <meta key={tag} property="article:tag" content={tag} />
        ))}
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Article",
          "headline": post.title,
          "description": post.seo_description || post.excerpt,
          "author": { "@type": "Organization", "name": post.author },
          "datePublished": post.published_at,
          "dateModified": post.updated_at,
          "publisher": { "@type": "Organization", "name": "NIZAMY", "url": "https://nizamy.com" },
          "mainEntityOfPage": `https://nizamy.com/blog/${post.slug}`,
          ...(post.featured_image_url ? { "image": post.featured_image_url } : {}),
        })}</script>
      </Helmet>

      <ReadingProgress />

      <article className="min-h-screen bg-[#F8FAFC] dark:bg-[#0F172A]">
        <div className="max-w-3xl mx-auto px-4 pt-24 pb-20">
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 font-['Source_Sans_3'] text-sm font-semibold text-slate-500 dark:text-slate-400 hover:text-[#1E3A8A] dark:hover:text-blue-400 transition-colors mb-8 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#1E3A8A]"
            aria-label="Kembali ke Halaman Blog Utama"
          >
            <ArrowLeft className="w-4 h-4" aria-hidden="true" /> Kembali ke Artikel
          </Link>

          <BlogArticleHeader post={post} />
          
          <BlogArticleContent cleanContent={cleanContent} tags={post.tags} />

          {post.related && post.related.length > 0 && (
            <div className="mt-16 pt-8 border-t border-slate-200 dark:border-slate-800">
              <h2 className="font-['Lexend'] text-xl font-bold text-[#0F172A] dark:text-white mb-6">Artikel Terkait</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {post.related.map((r) => (
                  <BlogCard key={r.id} post={r} />
                ))}
              </div>
            </div>
          )}
        </div>
      </article>
    </>
  );
}