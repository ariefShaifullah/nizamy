export interface Post {
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
}

export const CATEGORIES = [
  'Fiqh Waris',
  'Zakat',
  'Hafalan Quran',
  'Ekonomi Syariah',
  'Amal & Ibadah',
  'Klinik Finansial',
];
