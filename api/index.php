<?php
// pemweb-obe/api/index.php
header('Content-Type: application/json');

http_response_code(200);
echo json_encode([
    "message" => "Selamat datang di API E-Ticketing Speedboat Pelabuhan Tengkayu",
    "version" => "1.0",
    "available_endpoints" => [
        "GET /api/health.php" => "Mengecek status kesehatan server",
        "GET /api/jadwal.php" => "Mengambil daftar jadwal armada kapal",
        "POST /api/jadwal.php" => "Mensimulasikan penambahan jadwal kapal (wajib JSON)"
    ]
]);