<?php
// pemweb-obe/api/me.php
header('Content-Type: application/json');
require_once '../config/Database.php';
require_once '../config/auth.php';

// Hentikan request di sini jika belum login (akan return 401)
$userId = requireLogin();

try {
    $db = (new Database())->getConnection();
    
    // Mengekstrak profil user tanpa menyertakan password_hash
    $stmt = $db->prepare('SELECT id, nama, email, role FROM users WHERE id = :id');
    $stmt->execute(['id' => $userId]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$user) {
        http_response_code(404);
        echo json_encode(['error' => 'User tidak ditemukan.']);
        exit;
    }

    http_response_code(200);
    echo json_encode(['data' => $user]);

} catch (PDOException $e) {
    error_log("Me Error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Terjadi kesalahan internal server.']);
}