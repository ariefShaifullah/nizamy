<?php
/**
 * NIZAMY Blog — Configuration
 * Deploy to: /api/config.php on cPanel
 */

// ─── CLI detection ───────────────────────────────────────────
define('IS_CLI', php_sapi_name() === 'cli');

// ─── Environment loader ──────────────────────────────────────
function loadEnv()
{
	$envFile = __DIR__ . '/.env';
	if (!file_exists($envFile))
		return;

	$lines = file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
	foreach ($lines as $line) {
		$line = trim($line);
		if ($line === '' || str_starts_with($line, '#') || !str_contains($line, '=')) {
			continue;
		}

		[$key, $val] = explode('=', $line, 2);
		$key = trim($key);
		$val = trim($val);

		if (preg_match('/^"(.*)"$/', $val, $m) || preg_match("/^'(.*)'$/", $val, $m)) {
			$val = $m[1];
		}
		$_ENV[$key] = $val;
	}
}
loadEnv();

// ─── Database credentials ────────────────────────────────────
define('DB_HOST', $_ENV['DB_HOST'] ?? 'localhost');
define('DB_NAME', $_ENV['DB_NAME'] ?? '');
define('DB_USER', $_ENV['DB_USER'] ?? '');
define('DB_PASS', $_ENV['DB_PASS'] ?? '');

// ─── Site config ─────────────────────────────────────────────
define('SITE_URL', $_ENV['SITE_URL'] ?? 'https://nizamy.com');
define('API_SECRET', $_ENV['API_SECRET'] ?? '');

// ─── Fail fast if DB not configured ──────────────────────────
if (empty(DB_NAME) || empty(DB_USER)) {
	if (!IS_CLI) {
		header('Content-Type: application/json; charset=utf-8');
		http_response_code(500);
	}
	echo json_encode([
		'error' => 'Database not configured',
		'hint' => 'Check if api/.env exists with DB_NAME and DB_USER',
		'debug' => [
			'env_exists' => file_exists(__DIR__ . '/.env'),
			'db_name_set' => !empty(DB_NAME),
			'db_user_set' => !empty(DB_USER),
		]
	]);
	exit;
}

// ─── CORS ────────────────────────────────────────────────────
function setCorsHeaders()
{
	if (IS_CLI) return;

	$allowed = [
		'https://nizamy.com',
		'https://www.nizamy.com',
		'http://localhost:3000',
		'http://localhost:5173',
	];
	$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
	if (in_array($origin, $allowed)) {
		header("Access-Control-Allow-Origin: $origin");
		header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
		header('Access-Control-Allow-Headers: Content-Type, Authorization');
		header('Access-Control-Allow-Credentials: true');
	}
	if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') {
		http_response_code(204);
		exit;
	}
}

// ─── Database connection ─────────────────────────────────────
function getDB(): PDO
{
	static $db = null;
	if ($db)
		return $db;
	try {
		$db = new PDO(
			"mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8mb4",
			DB_USER,
			DB_PASS,
			[
				PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
				PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
				PDO::ATTR_EMULATE_PREPARES => false,
				PDO::ATTR_STRINGIFY_FETCHES => false,
			]
		);
	} catch (PDOException $e) {
		if (!IS_CLI) {
			header('Content-Type: application/json; charset=utf-8');
			http_response_code(500);
		}
		echo json_encode([
			'error' => 'Database connection failed'
		]);
		exit;
	}
	return $db;
}

// ─── Helpers ─────────────────────────────────────────────────
function jsonResponse(array $data, int $code = 200): void
{
	if (!IS_CLI) {
		header('Content-Type: application/json; charset=utf-8');
		http_response_code($code);
	}
	echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
	exit;
}

function requireAuth(): void
{
	$authHeader = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
	if (!$authHeader || !str_starts_with($authHeader, 'Bearer ')) {
		jsonResponse(['error' => 'Unauthorized'], 401);
	}
	$token = substr($authHeader, 7);
	if ($token !== API_SECRET) {
		jsonResponse(['error' => 'Invalid token'], 403);
	}
}

function generateSlug(string $title): string
{
	$slug = strtolower($title);
	$slug = preg_replace('/[^a-z0-9\p{Arabic}\s-]/u', '', $slug);
	$slug = preg_replace('/[\s-]+/', '-', $slug);
	$slug = trim($slug, '-');
	return $slug ?: 'post-' . time();
}
