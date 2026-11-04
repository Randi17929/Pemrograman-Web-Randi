<?php
// pemweb-obe/api/jadwal.php

header('Content-Type: application/json');
require_once '../config/Database.php';

// Fungsi Helper untuk format respons Error yang konsisten
function jsonError($code, $message, $details = null) {
    http_response_code($code);
    echo json_encode([
        'success' => false,
        'error' => [
            'code' => $code,
            'message' => $message,
            'details' => $details
        ]
    ]);
    exit;
}

// Fungsi Helper untuk format respons Sukses yang konsisten
function jsonSuccess($code, $message, $data = null) {
    http_response_code($code);
    $response = ['success' => true, 'message' => $message];
    if ($data !== null) {
        $response['data'] = $data;
    }
    echo json_encode($response);
    exit;
}

// Inisialisasi Database
try {
    $database = new Database();
    $db = $database->getConnection();
} catch (Exception $e) {
    // Log error internal ke server (jangan tampilkan ke klien)
    error_log("Koneksi DB gagal: " . $e->getMessage());
    jsonError(500, 'Terjadi kesalahan internal pada server.');
}

$method = $_SERVER['REQUEST_METHOD'];

// Menangkap ID jika ada (untuk GET by ID, PUT, DELETE)
$id_param = $_GET['id'] ?? null;
$id = filter_var($id_param, FILTER_VALIDATE_INT);

// Blok try-catch utama untuk boundary API (Langkah Praktikum 5)
try {
    
    /* =========================================
       READ (GET Collection & GET by ID)
       ========================================= */
    if ($method === 'GET') {
        // [GET BY ID] - Menampilkan detail satu resource
        if ($id) {
            $query = "SELECT j.id, a.nama as armada, p.nama as tujuan, j.harga, 
                             TIME_FORMAT(j.waktu_berangkat, '%H:%i') as berangkat, 
                             TIME_FORMAT(j.waktu_tiba, '%H:%i') as tiba, 
                             j.lokasi_sandar as lokasi 
                      FROM jadwal j
                      JOIN armada a ON j.armada_id = a.id
                      JOIN pelabuhan p ON j.pelabuhan_tujuan_id = p.id
                      WHERE j.id = :id";
            
            $stmt = $db->prepare($query);
            $stmt->bindParam(':id', $id, PDO::PARAM_INT);
            $stmt->execute();
            $jadwal = $stmt->fetch(PDO::FETCH_ASSOC);
            
            // Latihan 2: Buat response 404 jika id tidak ada
            if (!$jadwal) {
                jsonError(404, 'Data jadwal dengan ID tersebut tidak ditemukan.');
            }
            jsonSuccess(200, 'Data jadwal ditemukan.', $jadwal);
        } 
        
        // [GET COLLECTION] - Menampilkan semua resource (dengan dukungan Filter/Search)
        else {
            $tujuan = $_GET['tujuan'] ?? null;
            
            $query = "SELECT j.id, a.nama as armada, p.nama as tujuan, j.harga, 
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
            $jadwal_list = $stmt->fetchAll(PDO::FETCH_ASSOC);
            jsonSuccess(200, 'Berhasil memuat daftar jadwal.', $jadwal_list);
        }
    } 
    
    /* =========================================
       CREATE (POST)
       ========================================= */
    elseif ($method === 'POST') {
        $inputJSON = file_get_contents('php://input');
        $input = json_decode($inputJSON, true);

        if (json_last_error() !== JSON_ERROR_NONE) {
            jsonError(400, 'Format JSON tidak valid.');
        }

        // Validasi input
        if (empty($input['armada_id']) || empty($input['pelabuhan_id'])) {
            jsonError(422, 'ID Armada dan ID Pelabuhan wajib diisi.');
        }

        $query = "INSERT INTO jadwal (armada_id, pelabuhan_tujuan_id, harga, waktu_berangkat, waktu_tiba, lokasi_sandar) 
                  VALUES (:armada_id, :pelabuhan_id, :harga, :berangkat, :tiba, :lokasi)";
        
        $stmt = $db->prepare($query);
        $stmt->bindParam(':armada_id', $input['armada_id']);
        $stmt->bindParam(':pelabuhan_id', $input['pelabuhan_id']);
        $stmt->bindParam(':harga', $input['harga']);
        $stmt->bindParam(':berangkat', $input['berangkat']);
        $stmt->bindParam(':tiba', $input['tiba']);
        $stmt->bindParam(':lokasi', $input['lokasi']);
        
        $stmt->execute();
        $new_id = $db->lastInsertId();
        
        jsonSuccess(201, 'Data jadwal berhasil ditambahkan.', ['inserted_id' => $new_id]);
    }
    
    /* =========================================
       UPDATE (PUT / PATCH)
       ========================================= */
    elseif ($method === 'PUT' || $method === 'PATCH') {
        if (!$id) {
            jsonError(400, 'ID jadwal wajib disertakan untuk melakukan pembaruan (contoh: ?id=1).');
        }

        // Cek eksistensi data sebelum update
        $cekQuery = "SELECT id FROM jadwal WHERE id = :id";
        $cekStmt = $db->prepare($cekQuery);
        $cekStmt->bindParam(':id', $id);
        $cekStmt->execute();
        if ($cekStmt->rowCount() === 0) {
            jsonError(404, 'Data jadwal tidak ditemukan untuk diperbarui.');
        }

        $inputJSON = file_get_contents('php://input');
        $input = json_decode($inputJSON, true);

        // Contoh update sederhana (hanya harga) untuk praktikum
        if (!isset($input['harga'])) {
            jsonError(422, 'Parameter harga wajib diisi untuk update.');
        }

        $query = "UPDATE jadwal SET harga = :harga WHERE id = :id";
        $stmt = $db->prepare($query);
        $stmt->bindParam(':harga', $input['harga']);
        $stmt->bindParam(':id', $id);
        $stmt->execute();

        jsonSuccess(200, 'Data harga jadwal berhasil diperbarui.');
    }
    
    /* =========================================
       DELETE
       ========================================= */
    elseif ($method === 'DELETE') {
        if (!$id) {
            jsonError(400, 'ID jadwal wajib disertakan untuk menghapus data (contoh: ?id=1).');
        }

        // Cek eksistensi data sebelum delete
        $cekQuery = "SELECT id FROM jadwal WHERE id = :id";
        $cekStmt = $db->prepare($cekQuery);
        $cekStmt->bindParam(':id', $id);
        $cekStmt->execute();
        if ($cekStmt->rowCount() === 0) {
            jsonError(404, 'Data jadwal tidak ditemukan. Tidak ada data yang dihapus.');
        }

        $query = "DELETE FROM jadwal WHERE id = :id";
        $stmt = $db->prepare($query);
        $stmt->bindParam(':id', $id);
        $stmt->execute();

        // DELETE sukses standar REST mengembalikan 204 No Content
        http_response_code(204);
        exit;
    }
    
    /* =========================================
       METHOD TIDAK DIKENAL
       ========================================= */
    else {
        jsonError(405, 'Metode HTTP tidak diizinkan. Gunakan GET, POST, PUT, atau DELETE.');
    }

} catch (PDOException $e) {
    // Latihan 3: Simulasikan error DB tanpa membocorkan stack trace
    error_log("Database Error pada /api/jadwal: " . $e->getMessage());
    jsonError(500, 'Terjadi kesalahan sistem saat memproses data ke database. Silakan coba beberapa saat lagi.');
} catch (Exception $e) {
    error_log("General Error pada /api/jadwal: " . $e->getMessage());
    jsonError(500, 'Terjadi kesalahan internal pada server.');
}