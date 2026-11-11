<?php
// pemweb-obe/config/auth.php

// Panggil di awal setiap file terlindungi untuk memastikan sesi aktif dan terkonfigurasi dengan benar
function init_secure_session() {
    $isHttps = !empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off';
    session_set_cookie_params([
        'lifetime' => 0,
        'path' => '/',
        'secure' => $isHttps,
        'httponly' => true,
        'samesite' => 'Lax'
    ]);
    
    if (session_status() !== PHP_SESSION_ACTIVE) {
        session_start();
    }
}

// Helper: Memastikan pengguna sudah login
function requireLogin() {
    init_secure_session();
    
    if (empty($_SESSION['user_id'])) {
        http_response_code(401); // Unauthorized
        echo json_encode(['error' => 'Silakan login']);
        exit;
    }
    
    return (int)$_SESSION['user_id'];
}

// Helper: Memastikan pengguna memiliki izin tertentu (RBAC)
function requireRole(array $allowedRoles) {
    requireLogin(); // Wajib login dulu
    
    $userRole = $_SESSION['role'] ?? '';
    
    if (!in_array($userRole, $allowedRoles, true)) {
        http_response_code(403); // Forbidden
        echo json_encode(['error' => 'Akses ditolak. Anda tidak memiliki izin untuk melakukan tindakan ini.']);
        exit;
    }
}