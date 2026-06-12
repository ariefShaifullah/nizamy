<?php
/**
 * NIZAMY — Auto Blog Generator
 * Generates SEO-optimized Islamic finance/inheritance articles using Gemini AI + Unsplash photos
 * 
 * Cron: 0 8 * * 2,5 /usr/local/bin/php /home/darilote/nizamy.com/scripts/auto-blog-nizamy.php >> /home/darilote/logs/blog-gen.log 2>&1
 * 
 * Setup:
 * 1. Add GEMINI_API_KEY and UNSPLASH_KEY to /api/.env
 * 2. Run schema additions in phpMyAdmin (see bottom of this file)
 * 3. Add cron job in cPanel → Cron Jobs
 */

// // Force error display for CLI debugging
// ini_set('display_errors', 1);
// ini_set('display_startup_errors', 1);
// error_reporting(E_ALL);

// // Prevent web access — this script is CLI only
// if (php_sapi_name() !== 'cli' && !defined('STDIN')) {
// 	http_response_code(403);
// 	echo "Forbidden";
// 	exit(1);
// }

require_once __DIR__ . '/../api/config.php';

// API Keys (loaded from api/.env via config.php)
define('GEMINI_API_KEY', $_ENV['GEMINI_API_KEY'] ?? '');
define('UNSPLASH_KEY', $_ENV['UNSPLASH_KEY'] ?? '');

if (empty(GEMINI_API_KEY)) {
	echo "❌ GEMINI_API_KEY not set in api/.env\n";
	exit(1);
}

// Internal links for SEO — expanded for deeper cross-linking
$internalLinks = [
	// Faraidh / Waris
	'kalkulator waris' => 'https://nizamy.com/faraidh',
	'waris islam' => 'https://nizamy.com/faraidh',
	'faraidh' => 'https://nizamy.com/faraidh',
	'pembagian harta' => 'https://nizamy.com/faraidh',
	'hukum waris' => 'https://nizamy.com/faraidh',
	'fiqh waris' => 'https://nizamy.com/faraidh',
	'ahli waris' => 'https://nizamy.com/faraidh',
	'harta warisan' => 'https://nizamy.com/faraidh',
	'bagian waris' => 'https://nizamy.com/faraidh',
	// Zakat
	'kalkulator zakat' => 'https://nizamy.com/zakat',
	'zakat maal' => 'https://nizamy.com/zakat',
	'zakat fitrah' => 'https://nizamy.com/zakat',
	'zakat penghasilan' => 'https://nizamy.com/zakat',
	'zakat emas' => 'https://nizamy.com/zakat',
	'zakat' => 'https://nizamy.com/zakat',
	// Hafalan
	'hafalan quran' => 'https://nizamy.com/hafalan',
	'menghafal al-quran' => 'https://nizamy.com/hafalan',
	'muroja\'ah' => 'https://nizamy.com/hafalan',
	// Other features
	'ekonomi syariah' => 'https://nizamy.com/hede',
	'audit halal' => 'https://nizamy.com/hede',
	'cek riba' => 'https://nizamy.com/hede',
	// Blog cross-link (links to the blog index for topical authority)
	'blog NIZAMY' => 'https://nizamy.com/blog',
	'NIZAMY' => 'https://nizamy.com',
];

// Topic pool — rotating across all NIZAMY categories
$topics = [
	// Fiqh Waris
	['title' => 'Panduan Lengkap Pembagian Waris dalam Islam Menurut KHI', 'category' => 'Fiqh Waris', 'image_query' => 'Islamic inheritance law book'],
	['title' => 'Menghitung Harta Warisan: Langkah demi Langkah Sesuai Syariah', 'category' => 'Fiqh Waris', 'image_query' => 'Islamic family counsel'],
	['title' => 'Hak Waris Anak Angkat Menurut Hukum Islam dan KHI', 'category' => 'Fiqh Waris', 'image_query' => 'Muslim family home'],
	['title' => 'Perbedaan Faraidh antara Laki-laki dan Perempuan dalam Islam', 'category' => 'Fiqh Waris', 'image_query' => 'Islamic justice scale'],
	['title' => 'Solusi Sengketa Waris Kelarga: Mediasi Syariah dan Pengadilan Agama', 'category' => 'Fiqh Waris', 'image_query' => 'Islamic court mediation'],
	['title' => 'Wasiat Wajibah: Hak Ahli Waris yang Tidak Termasuk Golongan Faraidh', 'category' => 'Fiqh Waris', 'image_query' => 'Islamic will document'],
	['title' => 'Membagi Waris untuk Ibu dan Ayah: Panduan Lengkap', 'category' => 'Fiqh Waris', 'image_query' => 'elderly Muslim parents'],
	['title' => 'Kalkulator Waris Online: Cara Mudah Menghitung Pembagian Harta', 'category' => 'Fiqh Waris', 'image_query' => 'Islamic finance calculator'],

	// Zakat
	['title' => 'Panduan Menghitung Zakat Maal: Simpanan, Emas, dan Investasi', 'category' => 'Zakat', 'image_query' => 'Islamic charity gold'],
	['title' => 'Zakat Fitrah 2026: Nisab, Harga, dan Cara Menghitungnya', 'category' => 'Zakat', 'image_query' => 'Ramadan zakat food'],
	['title' => 'Zakat Penghasilan: Berapa yang Harus Dikeluarkan dari Gaji Anda?', 'category' => 'Zakat', 'image_query' => 'Muslim salary income'],
	['title' => 'Zakat Profesi: Panduan Lengkap untuk Profesional Muslim', 'category' => 'Zakat', 'image_query' => 'Muslim professional work'],
	['title' => 'Zakat Emas dan Perak: Nisab Terbaru dan Cara Perhitungannya', 'category' => 'Zakat', 'image_query' => 'gold bars Islamic'],
	['title' => 'Bedanya Zakat, Infaq, dan Sedekah: Penjelasan Lengkap', 'category' => 'Zakat', 'image_query' => 'Islamic giving charity'],

	// Hafalan Quran
	['title' => 'Metode Menghafal Quran Paling Efektif untuk Sibuk Bekerja', 'category' => 'Hafalan Quran', 'image_query' => 'Muslim reading Quran'],
	['title' => 'Tips Muroja\'ah agar Hafalan Tidak Cepat Lupa', 'category' => 'Hafalan Quran', 'image_query' => 'Quran memorization study'],
	['title' => 'Jadwal Hafalan Quran Harian untuk Para Profesional', 'category' => 'Hafalan Quran', 'image_query' => 'daily Quran schedule'],
	['title' => 'Kesalahan Umum dalam Menghafal Al-Quran dan Cara Mengatasinya', 'category' => 'Hafalan Quran', 'image_query' => 'Quran learning mistakes'],
	['title' => 'Manfaat Menghafal Quran untuk Kesehatan Mental dan Spiritual', 'category' => 'Hafalan Quran', 'image_query' => 'peaceful Quran reflection'],

	// Ekonomi Syariah
	['title' => 'Prinsip Ekonomi Syariah yang Wajib Dipahami Setiap Muslim', 'category' => 'Ekonomi Syariah', 'image_query' => 'Islamic banking finance'],
	['title' => 'Bedanya Bank Syariah dan Bank Konvensional: Panduan Lengkap', 'category' => 'Ekonomi Syariah', 'image_query' => 'Islamic bank building'],
	['title' => 'Investasi Syariah: Saham, Reksadana, dan Sukuk untuk Muslim', 'category' => 'Ekonomi Syariah', 'image_query' => 'Islamic investment growth'],
	['title' => 'Riba dalam Transaksi Sehari-hari: Waspadai yang Sering Terabaikan', 'category' => 'Ekonomi Syariah', 'image_query' => 'Islamic finance avoid riba'],
	['title' => 'Wakaf Produktif: Cara Berinvestasi untuk Akhirat', 'category' => 'Ekonomi Syariah', 'image_query' => 'Islamic endowment waqf'],
	['title' => 'Asuransi Syariah vs Konvensional: Mana yang Lebih Menguntungkan?', 'category' => 'Ekonomi Syariah', 'image_query' => 'Islamic insurance protection'],

	// Amal & Ibadah
	['title' => 'Amal Yaumi: 20 Ibadah Harian yang Mudah Dilakukan', 'category' => 'Amal & Ibadah', 'image_query' => 'Muslim daily prayer'],
	['title' => 'Keutamaan Shalat Dhuha dan Cara Mengamalkannya Setiap Hari', 'category' => 'Amal & Ibadah', 'image_query' => 'morning prayer dhikr'],
	['title' => 'Sedekah Paling Utama: Bukan Hanya Uang, Tapi Juga Waktu dan Ilmu', 'category' => 'Amal & Ibadah', 'image_query' => 'Islamic charity giving'],
	['title' => 'Puasa Sunnah Sepanjang Tahun: Panduan Lengkap', 'category' => 'Amal & Ibadah', 'image_query' => 'Islamic fasting sunnah'],
	['title' => 'Doa dan Dzikir Setelah Shalat Fardhu yang Shahih', 'category' => 'Amal & Ibadah', 'image_query' => 'Muslim prayer dhikr beads'],

	// Klinik Finansial
	['title' => 'Cek Riba dalam Keuangan Anda: Panduan Audit Halal Pribadi', 'category' => 'Klinik Finansial', 'image_query' => 'Islamic financial audit'],
	['title' => 'Cara Keluar dari Utang Riba: Langkah Praktis Syariah', 'category' => 'Klinik Finansial', 'image_query' => 'debt free Islamic'],
	['title' => 'Nabung Syariah: Tips Mengelola Keuangan Tanpa Riba', 'category' => 'Klinik Finansial', 'image_query' => 'Islamic savings halal'],
	['title' => 'KPR Syariah vs Konvensional: Mana yang Lebih Aman?', 'category' => 'Klinik Finansial', 'image_query' => 'Islamic mortgage home'],
	['title' => 'Pinjaman Online Haram: Kenali Ciri-ciri dan Bahayanya', 'category' => 'Klinik Finansial', 'image_query' => 'online loan danger'],
	['title' => 'Konsultasi Keuangan Syariah: Kapan Anda Perlu Minta Bantuan?', 'category' => 'Klinik Finansial', 'image_query' => 'Islamic financial consultation'],
];

// ============================================================
// FUNCTIONS
// ============================================================

function callGeminiAPI($prompt)
{
	$model = 'gemini-2.5-flash';
	$maxRetries = 3;
	$retryDelay = 30;
	$attempt = 0;

	while ($attempt < $maxRetries) {
		$ch = curl_init("https://generativelanguage.googleapis.com/v1beta/models/{$model}:generateContent?key=" . GEMINI_API_KEY);
		curl_setopt_array($ch, [
			CURLOPT_RETURNTRANSFER => true,
			CURLOPT_POST => true,
			CURLOPT_POSTFIELDS => json_encode([
				'contents' => [['parts' => [['text' => $prompt]]]],
				'generationConfig' => ['response_mime_type' => 'application/json']
			]),
			CURLOPT_HTTPHEADER => ['Content-Type: application/json'],
			CURLOPT_SSL_VERIFYPEER => false,
			CURLOPT_TIMEOUT => 90
		]);

		$response = curl_exec($ch);
		$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
		curl_close($ch);

		if ($httpCode === 200) {
			$result = json_decode($response, true);
			$text = $result['candidates'][0]['content']['parts'][0]['text'] ?? null;
			return $text ? json_decode($text, true) : null;
		}

		if ($httpCode === 429) {
			$attempt++;
			echo "⚠️ Rate limit (429). Menunggu {$retryDelay} detik (Attempt $attempt/$maxRetries)...\n";
			sleep($retryDelay);
			continue;
		}

		echo "❌ Gemini API Error ($httpCode)\n";
		if ($response)
			echo "📝 Response: $response\n";
		return null;
	}

	return null;
}

function getUnsplashImage($query, $db)
{
	$usedIds = $db->query("SELECT photo_id FROM unsplash_history ORDER BY used_at DESC LIMIT 50")->fetchAll(PDO::FETCH_COLUMN);

	$ch = curl_init('https://api.unsplash.com/search/photos?query=' . urlencode($query) . '&per_page=10&orientation=landscape');
	curl_setopt_array($ch, [
		CURLOPT_RETURNTRANSFER => true,
		CURLOPT_HTTPHEADER => ['Authorization: Client-ID ' . UNSPLASH_KEY],
		CURLOPT_USERAGENT => 'NIZAMY-Blog/1.0',
		CURLOPT_SSL_VERIFYPEER => false,
		CURLOPT_TIMEOUT => 30
	]);

	$response = curl_exec($ch);
	$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
	curl_close($ch);

	if ($httpCode !== 200) {
		echo "❌ Unsplash API Error ($httpCode)\n";
		return null;
	}

	$data = json_decode($response, true);
	if (empty($data['results'])) {
		echo "⚠️ No images found for: $query\n";
		return null;
	}

	$available = array_filter($data['results'], fn($p) => !in_array($p['id'], $usedIds));
	if (empty($available))
		$available = $data['results'];

	$photo = $available[array_rand($available)];

	$db->prepare("INSERT INTO unsplash_history (photo_id) VALUES (?)")->execute([$photo['id']]);

	// Trigger download tracking (REQUIRED by Unsplash API Guidelines)
	if (!empty($photo['links']['download_location'])) {
		$ch = curl_init($photo['links']['download_location']);
		curl_setopt_array($ch, [
			CURLOPT_RETURNTRANSFER => true,
			CURLOPT_HTTPHEADER => ['Authorization: Client-ID ' . UNSPLASH_KEY],
			CURLOPT_SSL_VERIFYPEER => false
		]);
		curl_exec($ch);
		curl_close($ch);
	}

	return [
		'url' => $photo['urls']['regular'],
		'alt' => $photo['alt_description'] ?? $query,
		'photographer' => $photo['user']['name'] ?? 'Unknown',
		'photographer_url' => $photo['user']['links']['html'] ?? '',
		'unsplash_url' => $photo['links']['html'] ?? ''
	];
}

function addInternalLinks($content, $links)
{
	$linked = [];
	$maxLinks = 8; // Cap internal links per article for SEO best practice
	$count = 0;
	foreach ($links as $keyword => $url) {
		if ($count >= $maxLinks) break;
		if (in_array($keyword, $linked))
			continue;
		// Match keyword not already inside an HTML tag or anchor
		$pattern = '/\b(' . preg_quote($keyword, '/') . ')\b(?![^<]*>)(?![^<]*<\/a>)/iu';
		if (preg_match($pattern, $content)) {
			$content = preg_replace($pattern, '<a href="' . $url . '" rel="noopener">${1}</a>', $content, 1);
			$linked[] = $keyword;
			$count++;
		}
	}
	return $content;
}

/**
 * Sanitize AI-generated HTML content.
 * Fixes common Gemini quirks: &nbsp; flooding, stray markdown, etc.
 */
function sanitizeContent($content)
{
	// Fix Gemini's habit of encoding all spaces as &nbsp;
	$content = str_replace('&nbsp;', ' ', $content);
	// Fix stray markdown bold/italic inside HTML
	$content = preg_replace('/\*\*([^*]+)\*\*/', '<strong>$1</strong>', $content);
	$content = preg_replace('/\*([^*]+)\*/', '<em>$1</em>', $content);
	// Remove empty paragraphs
	$content = preg_replace('/<p>\s*<\/p>/', '', $content);
	// Trim excessive whitespace between tags
	$content = preg_replace('/>(\s{2,})</', '> <', $content);
	return trim($content);
}

// ============================================================
// MAIN EXECUTION
// ============================================================

echo "🚀 NIZAMY Blog Generator — " . date('Y-m-d H:i:s') . "\n\n";

$db = getDB();

// Topic deduplication
$usedTopics = $db->query("SELECT topic_title FROM topic_history ORDER BY used_at DESC LIMIT 30")->fetchAll(PDO::FETCH_COLUMN);
$availableTopics = array_filter($topics, fn($t) => !in_array($t['title'], $usedTopics));

if (empty($availableTopics)) {
	$db->exec("DELETE FROM topic_history WHERE used_at < DATE_SUB(NOW(), INTERVAL 60 DAY)");
	$availableTopics = $topics;
	echo "♻️ Topic pool reset\n";
}

$topicData = $availableTopics[array_rand($availableTopics)];
$db->prepare("INSERT INTO topic_history (topic_title) VALUES (?)")->execute([$topicData['title']]);

echo "📝 Topic: {$topicData['title']}\n";
echo "📁 Category: {$topicData['category']}\n\n";

// Generate article with Gemini
$article = callGeminiAPI(
	"Kamu adalah SEO content writer AHLI untuk blog \"NIZAMY\" — platform kalkulator waris Islam (faraidh) dan keuangan syariah di Indonesia. Kamu memahami Google E-E-A-T (Experience, Expertise, Authoritativeness, Trustworthiness) dan algoritma ranking terbaru Google.

Tulis artikel blog dalam bahasa Indonesia yang profesional, informatif, dan bermanfaat tentang: \"{$topicData['title']}\"

KONTEKS NIZAMY:
- Platform kalkulator waris Islam berbasis KHI (Kompilasi Hukum Islam)
- Fitur: kalkulator waris (faraidh), kalkulator zakat, hafalan Quran, audit keuangan syariah
- URL fitur utama: nizamy.com/faraidh, nizamy.com/zakat, nizamy.com/hafalan
- Target audience: Muslim Indonesia — pasangan muda, keluarga, profesional yang ingin mengatur keuangan sesuai syariah
- Tone: ramah, edukatif, otoritatif dalam hal fiqh, accessible untuk awam
- USP: gratis, privasi terjaga (data tidak disimpan di server), akurat sesuai dalil

PENTING - JUDUL (SEO TITLE):
- Buat judul yang UNIK, menarik, dan SEO-friendly
- Variasikan dari judul topik yang diberikan — JANGAN copy paste
- Max 60 karakter (optimal untuk SERP, Google truncate di 60 karakter)
- Awali atau sisipkan focus keyphrase di awal judul
- Gunakan power words: Panduan, Cara, Langkah, Rahasia, Kunci, Solusi, Tips, Lengkap
- Contoh pola efektif: \"[Focus Keyphrase]: [Benefit/Janji]\" atau \"Cara [Verb] [Keyphrase] [Modifier]\"

PENTING - KONTEN (E-E-A-T OPTIMIZED):
- Bahasa Indonesia yang baik dan benar, profesional tapi friendly
- Panjang 1200-1800 kata (long-form content ranks better)
- Paragraf pertama WAJIB mengandung focus keyphrase dan langsung menjawab search intent
- Struktur:
  1. Hook opening yang menjawab search intent langsung (2-3 kalimat)
  2. 5-7 subheading (H2) yang mengandung variasi keyword
  3. Setiap H2 punya 2-3 paragraf substansial
  4. Sertakan data/statistik jika relevan (e.g., \"Menurut data BPS 2024...\")
  5. FAQ section (4-5 pertanyaan dalam format yang Google bisa extract sebagai FAQ rich snippet)
  6. Kesimpulan + CTA natural ke fitur NIZAMY yang relevan
- Sertakan dalil: Al-Quran (dengan nomor surah:ayat), Hadis (dengan perawi), atau pasal KHI yang spesifik
- Tips praktis dan actionable — pembaca harus bisa langsung menerapkan
- Sebutkan manfaat menggunakan fitur NIZAMY secara natural (JANGAN hard-sell, jadikan bagian dari solusi)
- Gunakan transition words antar paragraf (Selain itu, Di sisi lain, Oleh karena itu, Menariknya)

PENTING - SEO ON-PAGE:
- 1 focus keyphrase utama (2-4 kata, harus sesuai search intent Indonesia)
- Keyphrase density: 1-2% (muncul natural, JANGAN keyword stuffing)
- Distribusi keyphrase: judul, paragraf pertama, minimal 2 subheading H2, 1 subheading H3, paragraf terakhir/kesimpulan
- Sertakan 5-8 LSI keywords (semantically related terms) yang tersebar natural di seluruh artikel
- Gunakan numbered lists (<ol>) dan bullet points (<ul>) — Google loves structured content
- FAQ section WAJIB menggunakan format:
  <h3>Pertanyaan lengkap dengan tanda tanya?</h3>
  <p>Jawaban lengkap dan informatif minimal 2-3 kalimat.</p>
  (Format ini memungkinkan Google mengekstrak FAQ rich snippets)
- Featured snippet optimization: buat 1 paragraf ringkas (40-60 kata) yang langsung menjawab pertanyaan utama artikel. Letakkan setelah H2 pertama.
- Buat seo_title yang BERBEDA dari judul artikel (lebih panjang, max 60 char, include brand \"NIZAMY\")
- Buat seo_description yang compelling dengan CTA implicit (max 155 char)

PENTING - FORMAT HTML (WAJIB PATUHI):
- Setiap paragraf WAJIB dibungkus tag <p>...</p>, JANGAN pernah tulis teks langsung di dalam <div>
- Setiap subheading WAJIB menggunakan <h2>...</h2> atau <h3>...</h3>
- Jarak antar paragraf dan heading SUDAH DIATUR oleh CSS — jangan tambahkan <br> atau style='margin'
- Numbered list: gunakan <ol><li>...</li></ol>
- Bullet list: gunakan <ul><li>...</li></ul>
- Bold: <strong>...</strong> (gunakan untuk highlight focus keyphrase 1-2x secara natural)
- Italic: <em>...</em>
- Quote/ayat: <blockquote>...</blockquote>
- JANGAN tambahkan inline style pada tag HTML manapun
- JANGAN tulis \n atau raw text tanpa tag HTML pembungkus
- JANGAN gunakan &amp;nbsp; — gunakan spasi biasa
- JANGAN gunakan markdown (*bold*, _italic_) — gunakan tag HTML
- Foto kredit JANGAN dimasukkan di content — sudah ditangani terpisah
- JANGAN GUNAKAN tag <table>! Gunakan <ul> berjenjang sebagai gantinya.

CONTOH STRUKTUR HTML YANG BENAR:
<h2>Subheading dengan Keyphrase Pertama</h2>
<p>Paragraf pembahasan yang informatif, mengandung LSI keyword secara natural. Penjelasan mendalam yang menunjukkan expertise penulis.</p>
<p>Paragraf lanjutan dengan data pendukung atau dalil yang relevan.</p>
<h3>Sub-subheading untuk detail</h3>
<ul><li><strong>Poin utama:</strong> Penjelasan detail yang actionable</li><li><strong>Poin kedua:</strong> Tips praktis yang bisa langsung diterapkan</li></ul>
<h2>FAQ Seputar [Topik]</h2>
<h3>Apa itu [topik] dalam Islam?</h3>
<p>Jawaban informatif minimal 2-3 kalimat yang bisa diambil Google sebagai featured snippet.</p>
<h3>Bagaimana cara menghitung [topik]?</h3>
<p>Penjelasan step-by-step yang jelas dan mudah dipahami.</p>

Format output JSON:
{
  \"title\": \"Judul artikel SEO (max 60 karakter, keyphrase di depan)\",
  \"seoTitle\": \"SEO Title untuk tag <title> — bisa berbeda dari judul, max 60 char, include NIZAMY\",
  \"content\": \"Konten HTML lengkap (WAJIB: semua teks dalam <p>, <h2>, <h3>, <li>, <blockquote>. JANGAN teks tanpa tag. JANGAN &amp;nbsp;)\",
  \"excerpt\": \"Meta description compelling dengan CTA implicit (max 155 karakter)\",
  \"focusKeyphrase\": \"frasa kunci utama 2-4 kata\",
  \"lsiKeywords\": [\"lsi1\", \"lsi2\", \"lsi3\", \"lsi4\", \"lsi5\"],
  \"tags\": [\"tag1\", \"tag2\", \"tag3\", \"tag4\", \"tag5\"],
  \"imageKeywords\": \"2-3 simple English words for Unsplash (e.g. 'mosque', 'prayer', 'quran')\"
}"
);

if (!$article) {
	echo "❌ Gemini generation failed\n";
	exit(1);
}

echo "✅ Generated: {$article['title']}\n";
echo "🎯 Focus keyphrase: {$article['focusKeyphrase']}\n\n";

// Fetch Unsplash image
$imageData = null;
$imageQuery = $article['imageKeywords'] ?? $topicData['image_query'];
echo "🖼️ Fetching image: $imageQuery\n";
$imageData = getUnsplashImage($imageQuery, $db);

if (!$imageData && $imageQuery !== 'Islamic mosque') {
	echo "🔄 Fallback: 'Islamic mosque'\n";
	$imageData = getUnsplashImage('Islamic mosque', $db);
}

if ($imageData) {
	echo "📸 Photo by {$imageData['photographer']}\n\n";
} else {
	echo "⚠️ No image fetched, proceeding without\n\n";
}

// Sanitize AI-generated content (fix &nbsp;, stray markdown, empty tags)
$content = sanitizeContent($article['content']);

// Add internal links for SEO cross-linking
$content = addInternalLinks($content, $internalLinks);

// Photo credit is handled by BlogPostPage.tsx via photographer_name/photographer_url fields
// No need to append it to content HTML

// Generate slug
$slug = generateSlug($article['title']);
$checkSlug = $db->prepare("SELECT COUNT(*) FROM posts WHERE slug = ?");
$checkSlug->execute([$slug]);
if ($checkSlug->fetchColumn() > 0) {
	$slug .= '-' . date('Ymd');
}

// Calculate reading time
$wordCount = str_word_count(strip_tags($content));
$readingTime = max(1, ceil($wordCount / 200));

// Insert into database
echo "📤 Publishing to database...\n";

$stmt = $db->prepare("
	INSERT INTO posts (slug, title, excerpt, content, category, tags, author, status,
	featured_image_url, featured_image_alt, photographer_name, photographer_url, unsplash_url,
	seo_title, seo_description, focus_keyphrase, reading_time, source, published_at)
	VALUES (?, ?, ?, ?, ?, ?, ?, 'published', ?, ?, ?, ?, ?, ?, ?, ?, ?, 'auto-generated', NOW())
");

$stmt->execute([
	$slug,
	$article['title'],
	$article['excerpt'],
	$content,
	$topicData['category'],
	json_encode($article['tags'] ?? []),
	'Tim Nizamy',
	$imageData['url'] ?? null,
	$imageData['alt'] ?? null,
	$imageData['photographer'] ?? null,
	$imageData['photographer_url'] ?? null,
	$imageData['unsplash_url'] ?? null,
	$article['seoTitle'] ?? ($article['title'] . ' | NIZAMY'),
	$article['excerpt'],
	$article['focusKeyphrase'],
	$readingTime,
]);

$postId = $db->lastInsertId();

echo "✅ Published! Post ID: $postId\n";
echo "🔗 https://nizamy.com/blog/$slug\n";
echo "🎯 Focus Keyphrase: {$article['focusKeyphrase']}\n";
echo "📊 LSI Keywords: " . implode(', ', $article['lsiKeywords'] ?? []) . "\n";
echo "📏 Word Count: $wordCount | Reading Time: {$readingTime} min\n";
echo "\n✨ Done! " . date('Y-m-d H:i:s') . "\n";

/*

============================================================
SCHEMA ADDITIONS — Run in phpMyAdmin before first use:
============================================================

CREATE TABLE IF NOT EXISTS topic_history (
	id INT AUTO_INCREMENT PRIMARY KEY,
	topic_title VARCHAR(500) NOT NULL,
	used_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	INDEX idx_topic (topic_title(191)),
	INDEX idx_used (used_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS unsplash_history (
	id INT AUTO_INCREMENT PRIMARY KEY,
	photo_id VARCHAR(50) NOT NULL UNIQUE,
	used_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	INDEX idx_photo (photo_id),
	INDEX idx_used (used_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

============================================================
CRON SETUP — cPanel → Cron Jobs:
============================================================

0 8 * * 2,5 /usr/local/bin/php /home/darilote/nizamy.com/scripts/auto-blog-nizamy.php >> /home/darilote/logs/blog-gen.log 2>&1

(Runs every Tuesday & Friday at 08:00 server time)

Create the log directory first:
  mkdir -p /home/darilote/logs && touch /home/darilote/logs/blog-gen.log

============================================================
ENV ADDITIONS — Add to /api/.env:
============================================================

GEMINI_API_KEY=your_gemini_api_key_here
UNSPLASH_KEY=your_unsplash_access_key_here

*/
