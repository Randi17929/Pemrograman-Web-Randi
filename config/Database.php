<?php
// pemweb-obe/config/Database.php
ini_set('display_errors', '0');
ini_set('display_startup_errors', '0');
error_reporting(E_ALL);
ini_set('log_errors', '1');
class Database {
    private $host = 'localhost';
    private $db_name = 'db_speedboat';
    private $username = 'root';
    private $password = '';
    private $conn;

    public function __construct() {
        // Membaca kredensial secara aman dari file .env
        $envFile = __DIR__ . '/../.env';
        if (file_exists($envFile)) {
            $env = parse_ini_file($envFile);
            if ($env !== false) {
                $this->host = $env['DB_HOST'] ?? $this->host;
                $this->username = $env['DB_USER'] ?? $this->username;
                $this->password = $env['DB_PASS'] ?? $this->password;
                $this->db_name = $env['DB_NAME'] ?? $this->db_name;
            }
        }
    }

    public function getConnection() {
        $this->conn = null;

        try {
            $dsn = "mysql:host={$this->host};dbname={$this->db_name};charset=utf8mb4";
            $this->conn = new PDO($dsn, $this->username, $this->password);
            $this->conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            $this->conn->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
        } catch (PDOException $exception) {
            error_log("Database Connection Error: " . $exception->getMessage());
            throw new Exception("Gagal terhubung ke database.");
        }

        return $this->conn;
    }
}