import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DIST_DIR = path.resolve(__dirname, '../dist');
const SITEMAP_PATH = path.join(DIST_DIR, 'sitemap.xml');

// Static routes
const staticRoutes = [
  { path: '/', priority: 1.0, changefreq: 'weekly' },
  { path: '/faraidh/', priority: 0.9, changefreq: 'weekly' },
  { path: '/zakat/', priority: 0.9, changefreq: 'weekly' },
  { path: '/hafalan/', priority: 0.8, changefreq: 'weekly' },
  { path: '/mushaf/', priority: 0.8, changefreq: 'weekly' },
  { path: '/sholat/', priority: 0.7, changefreq: 'daily' },
  { path: '/hede/', priority: 0.7, changefreq: 'weekly' },
  { path: '/amal/', priority: 0.6, changefreq: 'weekly' },
  { path: '/scanner/', priority: 0.6, changefreq: 'weekly' },
  { path: '/blog/', priority: 0.8, changefreq: 'daily' },
];

async function generateSitemap() {
  console.log('Generating dynamic sitemap...');
  
  // Format current date as YYYY-MM-DD
  const today = new Date().toISOString().split('T')[0];

  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

  // Add static routes
  for (const route of staticRoutes) {
    xml += `
  <url>
    <loc>https://nizamy.com${route.path}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${route.changefreq}</changefreq>
    <priority>${route.priority}</priority>
  </url>`;
  }

  // Fetch blog posts
  try {
    const res = await fetch('https://nizamy.com/api/posts.php?per_page=100'); // Fetch up to 100 posts for sitemap
    if (res.ok) {
      const data = await res.json();
      if (data && data.posts && Array.isArray(data.posts)) {
        console.log(`Fetched ${data.posts.length} blog posts for sitemap.`);
        
        for (const post of data.posts) {
          // If status isn't explicitly draft or archived, include it (though API should filter this usually)
          if (post.status !== 'draft' && post.status !== 'archived') {
            const lastModDate = post.updated_at ? post.updated_at.split(' ')[0] : (post.published_at ? post.published_at.split(' ')[0] : today);
            
            xml += `
  <url>
    <loc>https://nizamy.com/blog/${post.slug}</loc>
    <lastmod>${lastModDate}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`;
          }
        }
      }
    } else {
      console.warn('Failed to fetch posts from API. Status:', res.status);
    }
  } catch (error) {
    console.error('Error fetching blog posts for sitemap:', error.message);
    console.log('Continuing with static routes only.');
  }

  xml += `
</urlset>
`;

  // Write to dist/sitemap.xml (overwrites the static one copied from public/)
  if (!fs.existsSync(DIST_DIR)) {
    fs.mkdirSync(DIST_DIR, { recursive: true });
  }
  
  fs.writeFileSync(SITEMAP_PATH, xml);
  console.log('✅ Dynamic sitemap generated at dist/sitemap.xml');
}

generateSitemap();
