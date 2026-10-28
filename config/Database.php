<?php
class Database {
    private $conn;

    public function getConnection() {
        $this->conn = null;
        
        // Membaca file .env yang berada satu level di atas folder config
        $env = parse_ini_file(__DIR__ . '/../.env');

        $host = $env['DB_HOST'] ?? 'localhost';
        $db_name = $env['DB_NAME'] ?? 'db_speedboat';
        $username = $env['DB_USER'] ?? 'root';
        $password = $env['DB_PASS'] ?? '';

        try {
            $dsn = "mysql:host={$host};dbname={$db_name};charset=utf8mb4";
            $this->conn = new PDO($dsn, $username, $password);
            
            // Atur PDO error mode ke exception & default fetch ke Associative Array
            $this->conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            $this->conn->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
        } catch(PDOException $exception) {
            http_response_code(500);
            echo json_encode(['error' => 'Koneksi database gagal: ' . $exception->getMessage()]);
            exit;
        }
        
        return $this->conn;
    }
}