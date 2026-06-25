// NIZAMY Blog API utilities
import { API_BASE } from '../lib/config';

export interface BlogPost {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  tags: string[];
  author: string;
  status: 'published' | 'draft' | 'archived';
  featured_image_url: string | null;
  featured_image_alt: string | null;
  photographer_name: string | null;
  photographer_url: string | null;
  unsplash_url: string | null;
  seo_title: string;
  seo_description: string;
  focus_keyphrase: string;
  reading_time: number;
  source: 'manual' | 'auto-generated';
  published_at: string;
  created_at: string;
  updated_at: string;
  related?: BlogPost[];
}

export interface BlogPagination {
  page: number;
  per_page: number;
  total: number;
  total_pages: number;
}

export interface BlogListResponse {
  posts: BlogPost[];
  pagination: BlogPagination;
}

export interface BlogCategory {
  id: number;
  name: string;
  slug: string;
  description: string;
  post_count: number;
}

export async function fetchPosts(params?: {
  page?: number;
  per_page?: number;
  category?: string;
  search?: string;
}): Promise<BlogListResponse> {
  const searchParams = new URLSearchParams();
  if (params?.page) searchParams.set('page', String(params.page));
  if (params?.per_page) searchParams.set('per_page', String(params.per_page));
  if (params?.category) searchParams.set('category', params.category);
  if (params?.search) searchParams.set('search', params.search);

  searchParams.set('_t', String(Date.now()));

  const url = `${API_BASE}/posts.php?${searchParams.toString()}`;
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch posts');
  return res.json();
}

export async function fetchPost(slug: string): Promise<BlogPost> {
  const res = await fetch(`${API_BASE}/posts.php?slug=${encodeURIComponent(slug)}&_t=${Date.now()}`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Post not found');
  return res.json();
}

export async function fetchCategories(): Promise<BlogCategory[]> {
  const res = await fetch(`${API_BASE}/categories.php?_t=${Date.now()}`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch categories');
  return res.json();
}

export function formatDate(dateStr: string): string {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export function estimateReadingTime(html: string): number {
  const text = html.replace(/<[^>]*>/g, '');
  const words = text.split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 200));
}

/** Replace non-breaking spaces with regular spaces for natural line wrapping. */
export function sanitizeContent(html: string): string {
  return html.replace(/&nbsp;/g, ' ');
}
