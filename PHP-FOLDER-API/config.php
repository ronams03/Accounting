<?php
// Database configuration
define('DB_HOST', 'localhost');
define('DB_NAME', 'accounting_system');
define('DB_USER', 'root');
define('DB_PASS', '');

// Application configuration
define('APP_NAME', 'Accounting System');
define('APP_VERSION', '1.0.0');
define('APP_ENV', 'development');

// Security configuration
define('JWT_SECRET', 'your-secret-key-here');
define('SESSION_TIMEOUT', 3600); // 1 hour
define('MAX_LOGIN_ATTEMPTS', 5);

// API configuration
define('API_VERSION', 'v1');
define('API_BASE_URL', '/accounting/PHP-FOLDER-API/');

// Error reporting
if (APP_ENV === 'development') {
    error_reporting(E_ALL);
    ini_set('display_errors', 1);
} else {
    error_reporting(0);
    ini_set('display_errors', 0);
}

// Set timezone
date_default_timezone_set('Asia/Manila');

// CORS headers for API requests
if (!headers_sent()) {
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
    header('Content-Type: application/json; charset=utf-8');
}

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}
?>
