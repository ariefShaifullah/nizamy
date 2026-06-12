<?php
/**
 * NIZAMY Blog — Posts API
 * GET /api/posts.php → List published posts (paginated)
 * GET /api/posts.php?slug=xxx → Single post by slug
 * GET /api/posts.php?id=xxx → Single post by ID (admin)
 * POST /api/posts.php → Create post (auth required)
 * PUT /api/posts.php?id=xxx → Update post (auth required)
 * DELETE /api/posts.php?id=xxx → Delete post (auth required)
 */

// Top-level error handler — ensures we ALWAYS return JSON, never empty HTML 500
set_error_handler(function ($severity, $message, $file, $line) {
	header('Content-Type: application/json; charset=utf-8');
	http_response_code(500);
	echo json_encode(['error' => 'PHP error', 'message' => $message, 'file' => basename($file), 'line' => $line]);
	exit;
});
set_exception_handler(function ($e) {
	header('Content-Type: application/json; charset=utf-8');
	http_response_code(500);
	echo json_encode(['error' => 'Uncaught exception', 'message' => $e->getMessage(), 'file' => basename($e->getFile()), 'line' => $e->getLine()]);
	exit;
});

require_once __DIR__ . '/config.php';
setCorsHeaders();

$method = $_SERVER['REQUEST_METHOD'];
$db = getDB();

switch ($method) {
	case 'GET':
		handleGet($db);
		break;
	case 'POST':
		handlePost($db);
		break;
	case 'PUT':
		handlePut($db);
		break;
	case 'DELETE':
		handleDelete($db);
		break;
	default:
		jsonResponse(['error' => 'Method not allowed'], 405);
}

function handleGet($db)
{
	// Single post by slug (public)
	if (isset($_GET['slug'])) {
		$stmt = $db->prepare("SELECT * FROM posts WHERE slug = ? AND status = 'published'");
		$stmt->execute([$_GET['slug']]);
		$post = $stmt->fetch();
		if (!$post)
			jsonResponse(['error' => 'Post not found'], 404);
		$post['tags'] = json_decode($post['tags'] ?? '[]', true);
		$related = $db->prepare("
			SELECT id, slug, title, excerpt, category, featured_image_url, featured_image_alt,
			photographer_name, photographer_url, unsplash_url, published_at, reading_time
			FROM posts
			WHERE category = ? AND id != ? AND status = 'published'
			ORDER BY published_at DESC LIMIT 3
		");
		$related->execute([$post['category'], $post['id']]);
		$post['related'] = $related->fetchAll();
		jsonResponse($post);
	}

	// Single post by ID (admin)
	if (isset($_GET['id'])) {
		requireAuth();
		$stmt = $db->prepare("SELECT * FROM posts WHERE id = ?");
		$stmt->execute([$_GET['id']]);
		$post = $stmt->fetch();
		if (!$post)
			jsonResponse(['error' => 'Post not found'], 404);
		$post['tags'] = json_decode($post['tags'] ?? '[]', true);
		jsonResponse($post);
	}

	// List posts
	$page = max(1, intval($_GET['page'] ?? 1));
	$perPage = min(20, max(1, intval($_GET['per_page'] ?? 9)));
	$offset = ($page - 1) * $perPage;
	$category = $_GET['category'] ?? null;
	$status = $_GET['status'] ?? 'published';
	$search = $_GET['search'] ?? null;

	$where = [];
	$params = [];

	if ($status === 'published') {
		$where[] = "status = 'published'";
	} elseif ($status === 'all') {
		requireAuth();
	} else {
		$where[] = "status = ?";
		$params[] = $status;
	}
	if ($category) {
		$where[] = "category = ?";
		$params[] = $category;
	}
	if ($search) {
		$where[] = "(title LIKE ? OR excerpt LIKE ? OR content LIKE ?)";
		$term = "%{$search}%";
		$params[] = $term;
		$params[] = $term;
		$params[] = $term;
	}

	$whereClause = $where ? 'WHERE ' . implode(' AND ', $where) : '';

	$countStmt = $db->prepare("SELECT COUNT(*) FROM posts $whereClause");
	$countStmt->execute($params);
	$total = intval($countStmt->fetchColumn());

	// Cast LIMIT/OFFSET to int and inline them (MariaDB-safe, values are guaranteed integers)
	$perPage = (int) $perPage;
	$offset = (int) $offset;
	$stmt = $db->prepare("
		SELECT id, slug, title, excerpt, category, status, author,
		featured_image_url, featured_image_alt, photographer_name,
		photographer_url, unsplash_url, published_at, reading_time, source,
		created_at, updated_at
		FROM posts $whereClause
		ORDER BY published_at DESC LIMIT $perPage OFFSET $offset
	");
	$stmt->execute($params);
	$posts = $stmt->fetchAll();

	$totalPages = $perPage > 0 ? (int) ceil($total / $perPage) : 0;

	jsonResponse([
		'posts' => $posts,
		'pagination' => [
			'page' => $page,
			'per_page' => $perPage,
			'total' => $total,
			'total_pages' => $totalPages,
		],
	]);
}

function handlePost($db)
{
	requireAuth();
	$input = json_decode(file_get_contents('php://input'), true);
	if (!$input || empty($input['title']) || empty($input['content'])) {
		jsonResponse(['error' => 'Title and content are required'], 400);
	}

	$slug = generateSlug($input['title']);
	$check = $db->prepare("SELECT COUNT(*) FROM posts WHERE slug = ?");
	$check->execute([$slug]);
	if ($check->fetchColumn() > 0)
		$slug .= '-' . time();

	$status = $input['status'] ?? 'draft';
	$publishedAt = $status === 'published' ? ($input['published_at'] ?? date('Y-m-d H:i:s')) : null;

	$stmt = $db->prepare("
		INSERT INTO posts (slug, title, excerpt, content, category, tags, author, status,
		featured_image_url, featured_image_alt, photographer_name, photographer_url, unsplash_url,
		seo_title, seo_description, focus_keyphrase, reading_time, source, published_at)
		VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
	");
	$stmt->execute([
		$slug,
		$input['title'],
		$input['excerpt'] ?? '',
		$input['content'],
		$input['category'] ?? 'Fiqh Waris',
		json_encode($input['tags'] ?? []),
		$input['author'] ?? 'Arief',
		$status,
		$input['featured_image_url'] ?? null,
		$input['featured_image_alt'] ?? null,
		$input['photographer_name'] ?? null,
		$input['photographer_url'] ?? null,
		$input['unsplash_url'] ?? null,
		$input['seo_title'] ?? ($input['title'] . ' | NIZAMY'),
		$input['seo_description'] ?? $input['excerpt'] ?? '',
		$input['focus_keyphrase'] ?? '',
		$input['reading_time'] ?? 5,
		$input['source'] ?? 'manual',
		$publishedAt,
	]);

	jsonResponse(['id' => $db->lastInsertId(), 'slug' => $slug, 'message' => 'Post created'], 201);
}

function handlePut($db)
{
	requireAuth();
	$id = $_GET['id'] ?? null;
	if (!$id)
		jsonResponse(['error' => 'Post ID required'], 400);

	$input = json_decode(file_get_contents('php://input'), true);
	if (!$input)
		jsonResponse(['error' => 'Invalid input'], 400);

	$fields = [];
	$params = [];
	$allowed = [
		'title',
		'excerpt',
		'content',
		'category',
		'author',
		'status',
		'featured_image_url',
		'featured_image_alt',
		'photographer_name',
		'photographer_url',
		'unsplash_url',
		'seo_title',
		'seo_description',
		'focus_keyphrase',
		'reading_time'
	];

	foreach ($allowed as $field) {
		if (isset($input[$field])) {
			$fields[] = "$field = ?";
			$params[] = $input[$field];
		}
	}
	if (isset($input['tags'])) {
		$fields[] = "tags = ?";
		$params[] = json_encode($input['tags']);
	}

	if (isset($input['title'])) {
		$newSlug = generateSlug($input['title']);
		$check = $db->prepare("SELECT COUNT(*) FROM posts WHERE slug = ? AND id != ?");
		$check->execute([$newSlug, $id]);
		if ($check->fetchColumn() == 0) {
			$fields[] = "slug = ?";
			$params[] = $newSlug;
		}
	}

	if (isset($input['status']) && $input['status'] === 'published') {
		$existing = $db->prepare("SELECT published_at FROM posts WHERE id = ?");
		$existing->execute([$id]);
		$row = $existing->fetch();
		if (!$row['published_at']) {
			$fields[] = "published_at = ?";
			$params[] = date('Y-m-d H:i:s');
		}
	}

	if (empty($fields))
		jsonResponse(['error' => 'No fields to update'], 400);

	$params[] = $id;
	$db->prepare("UPDATE posts SET " . implode(', ', $fields) . " WHERE id = ?")->execute($params);
	jsonResponse(['message' => 'Post updated']);
}

function handleDelete($db)
{
	requireAuth();
	$id = $_GET['id'] ?? null;
	if (!$id)
		jsonResponse(['error' => 'Post ID required'], 400);
	$stmt = $db->prepare("DELETE FROM posts WHERE id = ?");
	$stmt->execute([$id]);
	if ($stmt->rowCount() === 0)
		jsonResponse(['error' => 'Post not found'], 404);
	jsonResponse(['message' => 'Post deleted']);
}
