import { useMemo, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useBlogPosts, useCategories } from '../hooks/useBlogPosts';
import { useDebounce } from '../hooks/useDebounce';
import BlogHero from '../components/blog/BlogHero';
import BlogCategoryFilter from '../components/blog/BlogCategoryFilter';
import BlogGrid from '../components/blog/BlogGrid';
import BlogPagination from '../components/blog/BlogPagination';

export default function BlogPage() {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 300);

  const { posts, pagination, loading, error } = useBlogPosts({
    page,
    per_page: 7,
    category: activeCategory || undefined,
    search: debouncedSearch || undefined,
  });

  const { categories } = useCategories();

  const featuredPost = useMemo(
    () => (page === 1 && !activeCategory && !searchQuery ? posts[0] : null),
    [page, activeCategory, searchQuery, posts]
  );

  const resetFilters = () => {
    setActiveCategory(null);
    setSearchQuery('');
    setPage(1);
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setPage(1);
  };

  const handleCategoryChange = (category: string | null) => {
    setActiveCategory(category);
    setPage(1);
  };

  return (
    <>
      <Helmet>
        <title>NIZAMY | Artikel Keislaman — Waris, Zakat, Ekonomi Syariah</title>
        <meta
          name="description"
          content="Kumpulan artikel Islami mengenai faraidh (waris), zakat, hafalan Al-Qur’an, ekonomi syariah, dan konsultasi keuangan. Panduan lengkap berdasarkan dalil syar'i."
        />
        <link rel="canonical" href="https://nizamy.com/blog" />
        <meta property="og:title" content="NIZAMY | Artikel Keislaman — Waris, Zakat, Ekonomi Syariah" />
        <meta
          property="og:description"
          content="Kumpulan artikel Islami mengenai waris, zakat, hafalan Al-Qur’an, dan ekonomi syariah."
        />
        <meta property="og:url" content="https://nizamy.com/blog" />
      </Helmet>

      <div className="min-h-screen bg-[#F8FAFC] text-[#020617] dark:bg-[#0F172A] dark:text-white">
        <BlogHero />

        <div className="pb-24">
          <BlogCategoryFilter 
            categories={categories}
            activeCategory={activeCategory}
            searchQuery={searchQuery}
            pagination={pagination}
            onSearchChange={handleSearchChange}
            onCategoryChange={handleCategoryChange}
            onReset={resetFilters}
          />

          <BlogGrid 
            posts={posts}
            featuredPost={featuredPost}
            loading={loading}
            error={error}
            searchQuery={searchQuery}
          />

          <BlogPagination 
            pagination={pagination}
            page={page}
            onPageChange={setPage}
            loading={loading}
          />
        </div>
      </div>
    </>
  );
}