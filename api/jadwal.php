<?php
header('Content-Type: application/json');
require_once '../config/Database.php';

$database = new Database();
$db = $database->getConnection();
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    // Menangkap parameter kategori/tujuan jika ada (Bagian Latihan filter query aman)
    $tujuan = $_GET['tujuan'] ?? null;
    
    // Query dengan JOIN karena tabel sudah direlasikan
    $query = "SELECT j.id, a.nama, p.nama as tujuan, j.harga, 
                     TIME_FORMAT(j.waktu_berangkat, '%H:%i') as berangkat, 
                     TIME_FORMAT(j.waktu_tiba, '%H:%i') as tiba, 
                     j.lokasi_sandar as lokasi 
              FROM jadwal j
              JOIN armada a ON j.armada_id = a.id
              JOIN pelabuhan p ON j.pelabuhan_tujuan_id = p.id";
    
    if ($tujuan) {
        $query .= " WHERE p.nama = :tujuan";
        $stmt = $db->prepare($query);
        $stmt->bindParam(':tujuan', $tujuan);
    } else {
        $stmt = $db->prepare($query);
    }
    
    $stmt->execute();
    $jadwal = $stmt->fetchAll();
    
    http_response_code(200);
    echo json_encode($jadwal);
    exit;
} 
elseif ($method === 'POST') {
    $contentType = isset($_SERVER["CONTENT_TYPE"]) ? trim($_SERVER["CONTENT_TYPE"]) : '';
    if ($contentType !== "application/json") {
        http_response_code(415);
        echo json_encode(['error' => 'Content-Type harus application/json']);
        exit;
    }

    $inputJSON = file_get_contents('php://input');
    $input = json_decode($inputJSON, true);

    if (json_last_error() !== JSON_ERROR_NONE) {
        http_response_code(400);
        echo json_encode(['error' => 'Format JSON tidak valid.']);
        exit;
    }

    // Validasi input data relasional
    if (empty($input['armada_id']) || empty($input['pelabuhan_id'])) {
        http_response_code(422);
        echo json_encode(['error' => 'ID Armada dan ID Pelabuhan wajib diisi.']);
        exit;
    }

    // Insert menggunakan Prepared Statement (Bagian Latihan keamanan query)
    $query = "INSERT INTO jadwal (armada_id, pelabuhan_tujuan_id, harga, waktu_berangkat, waktu_tiba, lokasi_sandar) 
              VALUES (:armada_id, :pelabuhan_id, :harga, :berangkat, :tiba, :lokasi)";
    
    $stmt = $db->prepare($query);
    
    $stmt->bindParam(':armada_id', $input['armada_id']);
    $stmt->bindParam(':pelabuhan_id', $input['pelabuhan_id']);
    $stmt->bindParam(':harga', $input['harga']);
    $stmt->bindParam(':berangkat', $input['berangkat']);
    $stmt->bindParam(':tiba', $input['tiba']);
    $stmt->bindParam(':lokasi', $input['lokasi']);
    
    try {
        $stmt->execute();
        http_response_code(201);
        echo json_encode(['message' => 'Data jadwal berhasil ditambahkan ke database.']);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Gagal menyimpan data database: ' . $e->getMessage()]);
    }
    exit;
} 
else {
    http_response_code(405);
    echo json_encode(['error' => 'Method tidak diizinkan. Gunakan GET atau POST.']);
    exit;
}