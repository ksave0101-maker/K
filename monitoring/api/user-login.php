<?php
/**
 * User Login API Endpoint
 * รับ POST request จาก Vercel และตรวจสอบ user ในฐานข้อมูล MySQL
 *
 * Usage: POST /api/user-login.php
 * Body: { "username": "xxx", "password": "xxx", "site": "xxx" }
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

// Load environment variables
function loadEnv($envFile = __DIR__ . '/../.env') {
    if (!file_exists($envFile)) {
        return;
    }

    $lines = file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        if (strpos(trim($line), '#') === 0) {
            continue;
        }

        $parts = explode('=', $line, 2);
        if (count($parts) === 2) {
            $key = trim($parts[0]);
            $value = trim($parts[1], '"\'');
            putenv("$key=$value");
        }
    }
}

loadEnv();

// Get POST data
$input = json_decode(file_get_contents('php://input'), true);
$username = $input['username'] ?? '';
$password = $input['password'] ?? '';
$site = $input['site'] ?? '';
$pageName = $input['pageName'] ?? 'home';

// Validate input
if (empty($username) || empty($password)) {
    http_response_code(400);
    echo json_encode(['error' => 'กรุณากรอก Username และ Password']);
    exit;
}

if (empty($site)) {
    http_response_code(400);
    echo json_encode(['error' => 'กรุณากรอก Site / Branch']);
    exit;
}

// Database configuration
$host = getenv('MYSQL_HOST') ?: 'localhost';
$port = getenv('MYSQL_PORT') ?: 3307;
$user = getenv('MYSQL_USER') ?: 'ksystem';
$pass = getenv('MYSQL_PASSWORD') ?: 'Ksave2025Admin';
$database = getenv('MYSQL_DATABASE') ?: 'ksystem';

try {
    // Connect to database
    $dsn = "mysql:host={$host};port={$port};dbname={$database};charset=utf8mb4";
    $options = [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    ];

    $pdo = new PDO($dsn, $user, $pass, $options);

    // Query user
    $stmt = $pdo->prepare("
        SELECT userId, userName, name, email, site, password, typeID
        FROM user_list
        WHERE userName = ?
        LIMIT 1
    ");

    $stmt->execute([$username]);
    $userRecord = $stmt->fetch();

    // Check if user exists
    if (!$userRecord) {
        http_response_code(401);
        echo json_encode(['error' => 'Username, Password หรือ Site ไม่ถูกต้อง']);
        exit;
    }

    // Check password
    if ($userRecord['password'] !== $password) {
        http_response_code(401);
        echo json_encode(['error' => 'Username, Password หรือ Site ไม่ถูกต้อง']);
        exit;
    }

    // Check site (case-insensitive)
    if (!empty($site) && !empty($userRecord['site'])) {
        if (strtolower($userRecord['site']) !== strtolower($site)) {
            http_response_code(401);
            echo json_encode(['error' => 'Username, Password หรือ Site ไม่ถูกต้อง']);
            exit;
        }
    } elseif (!empty($site) && empty($userRecord['site'])) {
        // User has no site in database but site is required
        http_response_code(401);
        echo json_encode(['error' => 'Username, Password หรือ Site ไม่ถูกต้อง']);
        exit;
    }

    // Record login log
    try {
        $logStmt = $pdo->prepare("
            INSERT INTO U_log_login (userID, name, login_timestamp, page_log, create_by)
            VALUES (?, ?, NOW(), ?, 'Auto system')
        ");
        $logStmt->execute([$userRecord['userId'], $userRecord['name'], $pageName]);
    } catch (Exception $e) {
        // Log error but don't fail login
        error_log("Failed to record login log: " . $e->getMessage());
    }

    // Generate token
    $token = base64_encode($userRecord['userId'] . '-' . time() . '-' . bin2hex(random_bytes(8)));

    // Return success response
    http_response_code(200);
    echo json_encode([
        'success' => true,
        'token' => $token,
        'userId' => $userRecord['userId'],
        'username' => $userRecord['userName'],
        'name' => $userRecord['name'] ?? '',
        'email' => $userRecord['email'] ?? '',
        'site' => $userRecord['site'] ?? '',
        'typeID' => $userRecord['typeID']
    ]);

} catch (PDOException $e) {
    error_log("Database error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Database connection failed']);
} catch (Exception $e) {
    error_log("Error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'An error occurred during login']);
}
