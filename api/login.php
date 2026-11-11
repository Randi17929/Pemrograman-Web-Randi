<?php
// pemweb-obe/api/login.php
header('Content-Type: application/json');
require_once '../config/Database.php';

// Hanya menerima POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method Not Allowed']);
    exit;
}

$inputJSON = file_get_contents('php://input');
$input = json_decode($inputJSON, true);

$email = trim($input['email'] ?? '');
$password = trim($input['password'] ?? '');

if (empty($email) || empty($password)) {
    http_response_code(400);
    echo json_encode(['error' => 'Email dan password wajib diisi.']);
    exit;
}

try {
    $db = (new Database())->getConnection();
    
    // Konfigurasi Cookie Session sebelum session_start()
    $isHttps = !empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off';
    session_set_cookie_params([
        'lifetime' => 0,
        'path' => '/',
        'secure' => $isHttps, // True jika menggunakan HTTPS (Production)
        'httponly' => true, // Mencegah pencurian cookie via JavaScript (XSS)
        'samesite' => 'Lax'
    ]);
    session_start();

    // Mencari user berdasarkan email
    $stmt = $db->prepare('SELECT id, nama, email, password_hash, role FROM users WHERE email = :email');
    $stmt->execute(['email' => $email]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    // [PRAKTIKUM D.2] Memverifikasi input kata sandi dengan hash di database
    if (!$user || !password_verify($password, $user['password_hash'])) {
        http_response_code(401);
        // Error generik (Jangan beri tahu apakah email ada/tidak)
        echo json_encode(['error' => 'Email atau password salah']);
        exit;
    }

    // Login sukses -> Regenerasi session ID dan simpan state
    session_regenerate_id(true); 
    $_SESSION['user_id'] = (int)$user['id'];
    $_SESSION['role'] = $user['role'];

    http_response_code(200);
    echo json_encode(['message' => 'Login berhasil', 'role' => $user['role']]);

} catch (PDOException $e) {
    error_log("Login Error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Terjadi kesalahan internal server.']);
}