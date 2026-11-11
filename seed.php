<?php
// pemweb-obe/seed.php
require_once 'config/Database.php';

try {
    $db = (new Database())->getConnection();

    // 1. Buat Tabel Users (jika belum ada)
    $queryTabel = "CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nama VARCHAR(100) NOT NULL,
        email VARCHAR(100) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        role ENUM('admin', 'petugas', 'viewer') DEFAULT 'viewer',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )";
    $db->exec($queryTabel);

    // 2. Bersihkan tabel agar tidak terjadi duplikasi saat ujicoba
    $db->exec("TRUNCATE TABLE users");

    // 3. Masukkan (Seed) Data Dummy
    $users = [
        ['Admin Utama', 'admin@speedboat.com', 'Admin123!', 'admin'],
        ['Petugas Loket 1', 'petugas@speedboat.com', 'Petugas123!', 'petugas'],
        ['Pengguna Umum', 'user@speedboat.com', 'User123!', 'viewer']
    ];

    $stmt = $db->prepare('INSERT INTO users (nama, email, password_hash, role) VALUES (?, ?, ?, ?)');

    foreach ($users as $user) {
        // [PRAKTIKUM D.1] Menggunakan password_hash() untuk mengenkripsi kata sandi
        $hash = password_hash($user[2], PASSWORD_DEFAULT);
        $stmt->execute([$user[0], $user[1], $hash, $user[3]]);
    }

    echo "✅ Tabel users berhasil dibuat dan 3 akun dummy telah di-seed (Admin, Petugas, Viewer).";

} catch (PDOException $e) {
    echo "❌ Error Database: " . $e->getMessage();
}