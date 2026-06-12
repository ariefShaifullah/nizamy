<?php
/**
 * NIZAMY Blog — Categories API
 * GET /api/categories.php → List all categories with post counts
 */

require_once __DIR__ . '/config.php';
setCorsHeaders();

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    jsonResponse(['error' => 'Method not allowed'], 405);
}

$db = getDB();

$stmt = $db->query("
    SELECT c.*, COUNT(p.id) as post_count
    FROM categories c
    LEFT JOIN posts p ON p.category = c.name AND p.status = 'published'
    GROUP BY c.id
    ORDER BY c.name ASC
");

jsonResponse($stmt->fetchAll());
