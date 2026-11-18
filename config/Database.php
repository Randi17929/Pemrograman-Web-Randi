<?php
class Database {
    private $conn;

    public function __construct() {
    // Membaca kredensial secara aman dari file .env
    $envFile = __DIR__ . '/../.env';
    if (file_exists($envFile)) {
        $env = parse_ini_file($envFile);
        $this->host = $env['DB_HOST'] ?? 'localhost';
        $this->username = $env['DB_USER'] ?? 'root';
        $this->password = $env['DB_PASS'] ?? '';
        $this->db_name = $env['DB_NAME'] ?? 'db_speedboat';
    }

        try {
            $dsn = "mysql:host={$this->host};dbname={$this->db_name};charset=utf8mb4";
            $this->conn = new PDO($dsn, $this->username, $this->password);
            
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