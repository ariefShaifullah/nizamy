<?php
/**
 * NIZAMY Blog — Auth API
 * POST /api/auth.php → Login
 * GET /api/auth.php → Validate token
 */

// 1. FORCE ERROR DISPLAY (Remove or set to 0 once everything works perfectly)
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

require_once __DIR__ . '/config.php';
setCorsHeaders();

$method = $_SERVER['REQUEST_METHOD'];

// 2. WRAP DATABASE FETCH IN A TRY-CATCH TO PREVENT SILENT 500 CRASHES
try {
    $db = getDB();
    if (!$db) {
        throw new Exception("getDB() returned null. Check your database credentials in config.php.");
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'error' => 'Database Connection Error',
        'message' => $e->getMessage()
    ]);
    exit;
}

switch ($method) {
    case 'POST':
        handleLogin($db);
        break;
    case 'GET':
        handleValidate();
        break;
    default:
        jsonResponse(['error' => 'Method not allowed'], 405);
}

function handleLogin($db)
{
    // Rate limiting: 5 attempts per 15 minutes per IP
    $ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
    $rateLimitFile = sys_get_temp_dir() . '/nizamy_login_' . md5($ip) . '.json';
    $maxAttempts = 5;
    $windowSeconds = 900;

    $attempts = [];
    if (file_exists($rateLimitFile)) {
        $attempts = json_decode(file_get_contents($rateLimitFile), true) ?: [];
        $attempts = array_filter($attempts, fn($t) => $t > time() - $windowSeconds);
    }

    if (count($attempts) >= $maxAttempts) {
        $retryAfter = max($attempts) + $windowSeconds - time();
        header("Retry-After: $retryAfter");
        jsonResponse(['error' => 'Terlalu banyak percobaan login. Coba lagi nanti.'], 429);
    }

    $input = json_decode(file_get_contents('php://input'), true);
    if (!$input || empty($input['username']) || empty($input['password'])) {
        jsonResponse(['error' => 'Username dan password wajib diisi'], 400);
    }

    // Prepare and fetch user
    $stmt = $db->prepare("SELECT * FROM admin_users WHERE username = ?");
    $stmt->execute([$input['username']]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    // 3. AUTOMATIC COLUMN DETECTION
    // This looks for either 'password_hash' OR 'password' so it won't crash your server!
    $db_password_hash = null;
    if ($user) {
        if (isset($user['password_hash'])) {
            $db_password_hash = $user['password_hash'];
        } elseif (isset($user['password'])) {
            $db_password_hash = $user['password'];
        } else {
            jsonResponse(['error' => 'Server Configuration Error: Column password or password_hash not found in database table.'], 500);
        }
    }

    // Verify Password against the detected column
    if (!$user || !password_verify($input['password'], $db_password_hash)) {
        $attempts[] = time();
        file_put_contents($rateLimitFile, json_encode(array_values($attempts)));
        jsonResponse(['error' => 'Username atau password salah'], 401);
    }

    // Clear rate limit on success
    if (file_exists($rateLimitFile))
        unlink($rateLimitFile);

    jsonResponse([
        'token' => API_SECRET,
        'username' => $user['username'],
        'message' => 'Login berhasil',
    ]);
}

function handleValidate()
{
    requireAuth();
    jsonResponse(['valid' => true, 'message' => 'Token valid']);
}

// Ensure clean JSON helper outputs if not already globally defined
if (!function_exists('jsonResponse')) {
    function jsonResponse($data, $code = 200)
    {
        header('Content-Type: application/json; charset=utf-8');
        http_response_code($code);
        echo json_encode($data);
        exit;
    }
}
