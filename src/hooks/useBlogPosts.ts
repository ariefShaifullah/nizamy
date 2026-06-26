import { useState, useEffect, useCallback } from 'react';
import { fetchPosts, fetchPost, fetchCategories, type BlogPost, type BlogPagination, type BlogCategory } from '../utils/blog';

export function useBlogPosts(params?: {
  page?: number;
  per_page?: number;
  category?: string;
  search?: string;
}) {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [pagination, setPagination] = useState<BlogPagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (isBackground = false) => {
    // Prevent background polling from appending duplicates when using infinite scroll
    if (isBackground && params?.page && params.page > 1) return;

    if (!isBackground) setLoading(true);
    setError(null);
    try {
      const data = await fetchPosts(params);
      
      if (!isBackground && params?.page && params.page > 1) {
        setPosts(prev => {
          const existingIds = new Set(prev.map(p => p.id));
          const newPosts = data.posts.filter(p => !existingIds.has(p.id));
          return [...prev, ...newPosts];
        });
      } else {
        setPosts(data.posts);
      }
      
      setPagination(data.pagination);
    } catch (e) {
      if (!isBackground) setError(e instanceof Error ? e.message : 'Failed to load posts');
    } finally {
      if (!isBackground) setLoading(false);
    }
  }, [params?.page, params?.per_page, params?.category, params?.search]);

  useEffect(() => { 
    load(); 
    
    // Auto-refresh every 30 seconds for background updates
    const intervalId = setInterval(() => {
      load(true);
    }, 30000);
    
    return () => clearInterval(intervalId);
  }, [load]);

  return { posts, pagination, loading, error, reload: () => load(false) };
}

export function useBlogPost(slug: string) {
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    setError(null);
    fetchPost(slug)
      .then(setPost)
      .catch(e => setError(e instanceof Error ? e.message : 'Post not found'))
      .finally(() => setLoading(false));
  }, [slug]);

  return { post, loading, error };
}

export function useCategories() {
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories()
      .then(setCategories)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return { categories, loading };
}
