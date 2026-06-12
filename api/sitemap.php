<?php
/**
 * NIZAMY — Dynamic XML Sitemap
 * Usage: GET /api/sitemap.php
 * Generates sitemap.xml from published posts + static feature pages.
 */

require_once __DIR__ . '/config.php';

header('Content-Type: application/xml; charset=utf-8');
header('Cache-Control: public, max-age=3600');

$db = getDB();

// Fetch published posts
$posts = $db->query("
    SELECT slug, updated_at
    FROM posts
    WHERE status = 'published'
    ORDER BY published_at DESC
")->fetchAll();

$baseUrl = 'https://nizamy.com';

echo '<?xml version="1.0" encoding="UTF-8"?>' . "\n";
echo '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' . "\n";

// Static feature pages
$staticPages = [
    ['loc' => '/', 'priority' => '1.0', 'changefreq' => 'weekly'],
    ['loc' => '/faraidh', 'priority' => '0.9', 'changefreq' => 'weekly'],
    ['loc' => '/zakat', 'priority' => '0.9', 'changefreq' => 'weekly'],
    ['loc' => '/hafalan', 'priority' => '0.8', 'changefreq' => 'weekly'],
    ['loc' => '/mushaf', 'priority' => '0.8', 'changefreq' => 'weekly'],
    ['loc' => '/sholat', 'priority' => '0.7', 'changefreq' => 'daily'],
    ['loc' => '/hede', 'priority' => '0.7', 'changefreq' => 'weekly'],
    ['loc' => '/amal', 'priority' => '0.6', 'changefreq' => 'weekly'],
    ['loc' => '/scanner', 'priority' => '0.6', 'changefreq' => 'weekly'],
    ['loc' => '/blog', 'priority' => '0.8', 'changefreq' => 'daily'],
];

foreach ($staticPages as $page) {
    echo "  <url>\n";
    echo "    <loc>{$baseUrl}{$page['loc']}</loc>\n";
    echo "    <priority>{$page['priority']}</priority>\n";
    echo "    <changefreq>{$page['changefreq']}</changefreq>\n";
    echo "  </url>\n";
}

// Blog posts
foreach ($posts as $post) {
    $lastmod = date('Y-m-d', strtotime($post['updated_at']));
    echo "  <url>\n";
    echo "    <loc>{$baseUrl}/blog/{$post['slug']}</loc>\n";
    echo "    <lastmod>{$lastmod}</lastmod>\n";
    echo "    <priority>0.6</priority>\n";
    echo "  </url>\n";
}

echo '</urlset>' . "\n";
