CREATE DATABASE IF NOT EXISTS db_speedboat CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE db_speedboat;

-- Tabel Master: Pelabuhan
CREATE TABLE pelabuhan (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nama VARCHAR(100) NOT NULL
);

-- Tabel Master: Armada Kapal
CREATE TABLE armada (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nama VARCHAR(100) NOT NULL
);

-- Tabel Transaksi: Jadwal (memiliki Foreign Key ke armada dan pelabuhan)
CREATE TABLE jadwal (
    id INT AUTO_INCREMENT PRIMARY KEY,
    armada_id INT NOT NULL,
    pelabuhan_tujuan_id INT NOT NULL,
    harga DECIMAL(10, 2) NOT NULL,
    waktu_berangkat TIME NOT NULL,
    waktu_tiba TIME NOT NULL,
    lokasi_sandar VARCHAR(50) NOT NULL,
    FOREIGN KEY (armada_id) REFERENCES armada(id),
    FOREIGN KEY (pelabuhan_tujuan_id) REFERENCES pelabuhan(id)
);

-- Insert Data Awal
INSERT INTO pelabuhan (nama) VALUES ('Pulau Bunyu'), ('Tideng Pale'), ('Tanjung Selor');
INSERT INTO armada (nama) VALUES ('SB. TRI PUTRI TD 2005'), ('SB. MINSEN EXPRESS XIII'), ('SB. MINSEN EXPRESS XI');

INSERT INTO jadwal (armada_id, pelabuhan_tujuan_id, harga, waktu_berangkat, waktu_tiba, lokasi_sandar) VALUES 
(1, 1, 120000, '09:00:00', '10:00:00', 'Dermaga 1'),
(2, 2, 235000, '09:15:00', '11:45:00', 'Dermaga 2'),
(3, 3, 145000, '07:00:00', '08:30:00', 'Dermaga 1');