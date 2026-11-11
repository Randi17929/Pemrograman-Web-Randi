<?php
// pemweb-obe/api/logout.php
header('Content-Type: application/json');

// Logout harus melalui POST, bukan GET, untuk mencegah request tak terduga.
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method Not Allowed']);
    exit;
}

require_once '../config/auth.php';
init_secure_session(); // Mulai sesi untuk mendapatkan data sesi yang akan dihancurkan

// Kosongkan seluruh variabel sesi
$_SESSION = [];

// Hapus cookie sesi
if (ini_get('session.use_cookies')) {
    $params = session_get_cookie_params();
    setcookie(session_name(), '', [
        'expires' => time() - 42000,
        'path' => $params['path'],
        'domain' => $params['domain'],
        'secure' => (bool)$params['secure'],
        'httponly' => (bool)$params['httponly'],
        'samesite' => $params['samesite'] ?? 'Lax'
    ]);
}

// Hancurkan memori sesi
session_destroy();

http_response_code(200);
echo json_encode(['message' => 'Logout berhasil. Sesi telah diakhiri.']);