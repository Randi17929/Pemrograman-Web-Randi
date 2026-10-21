<?php
// api/health.php
header('Content-Type: application/json');

// Memastikan hanya menerima method GET
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['error' => 'Method Not Allowed']);
    exit;
}

http_response_code(200);
echo json_encode(['status' => 'ok', 'message' => 'API E-Ticketing Tengkayu Berjalan Normal']);