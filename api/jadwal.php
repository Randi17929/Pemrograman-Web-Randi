<?php
// pemweb-obe/api/jadwal.php
header('Content-Type: application/json'); // Praktikum 6: Pastikan Content-Type JSON

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    // Data sementara - Menggantikan jadwal.json
    $jadwal = [
        [ "id" => 1, "nama" => "SB. TRI PUTRI TD 2005", "tujuan" => "Pulau Bunyu", "harga" => 120000, "berangkat" => "09:00", "tiba" => "10:00", "lokasi" => "Dermaga 1" ],
        [ "id" => 2, "nama" => "SB. MINSEN EXPRESS XIII", "tujuan" => "Tideng Pale", "harga" => 235000, "berangkat" => "09:15", "tiba" => "11:45", "lokasi" => "Dermaga 2" ],
        [ "id" => 3, "nama" => "SB. MINSEN EXPRESS XI", "tujuan" => "Tanjung Selor", "harga" => 145000, "berangkat" => "07:00", "tiba" => "08:30", "lokasi" => "Dermaga 1" ]
    ];
    http_response_code(200);
    echo json_encode($jadwal);
    exit;
} 

elseif ($method === 'POST') {
    $inputJSON = file_get_contents('php://input');
    $input = json_decode($inputJSON, true);

    // Kondisi 1: JSON Rusak (Status 400)
    if (json_last_error() !== JSON_ERROR_NONE) {
        http_response_code(400);
        echo json_encode(['error' => 'Format JSON tidak valid.']);
        exit;
    }

    // Validasi panjang nama maksimal 100 karakter
    if (isset($input['nama']) && strlen($input['nama']) > 100) {
        http_response_code(422); // Kondisi 2: Aturan bisnis tidak terpenuhi
        echo json_encode(['error' => 'Panjang nama kapal maksimal 100 karakter.']);
        exit;
    }

    // JSON Valid (Status 201)
    http_response_code(201);
    echo json_encode([
        'message' => 'Data jadwal berhasil ditambahkan (Simulasi).',
        'data_diterima' => $input
    ]);
    exit;
} 

else {
    // Method selain GET/POST ditolak dengan status 405
    http_response_code(405);
    echo json_encode(['error' => 'Method tidak diizinkan. Gunakan GET atau POST.']);
    exit;
}