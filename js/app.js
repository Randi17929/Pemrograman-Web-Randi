import { ringkasJadwal } from './utils.js';

const jadwalSpeedboat = [
    { id: 1, nama: 'SB. TRI PUTRI TD 2005', tujuan: 'Pulau Bunyu', harga: 120000, berangkat: '09:00', tiba: '10:00', lokasi: 'Dermaga 1' },
    { id: 2, nama: 'SB. MINSEN EXPRESS XIII', tujuan: 'Tideng Pale', harga: 235000, berangkat: '09:15', tiba: '11:45', lokasi: 'Dermaga 2' },
    { id: 3, nama: 'SB. MINSEN EXPRESS XI', tujuan: 'Tanjung Selor', harga: 145000, berangkat: '07:00', tiba: '08:30', lokasi: 'Dermaga 1' },
    { id: 4, nama: 'SB. MENARA NIKLAS', tujuan: 'Tanjung Selor', harga: 145000, berangkat: '16:10', tiba: '17:30', lokasi: 'Dermaga 3' },
    { id: 5, nama: 'SB. SADEWATA 01', tujuan: 'Nunukan', harga: 280000, berangkat: '07:15', tiba: '10:00', lokasi: 'Dermaga 1' },
    { id: 6, nama: 'SB. NEW HARAPAN BARU V', tujuan: 'Malinau', harga: 310000, berangkat: '07:00', tiba: '10:00', lokasi: 'Dermaga 2' },
    { id: 7, nama: 'SB. LESTARI BENUANTA VIP', tujuan: 'Sungai Nyamuk', harga: 280000, berangkat: '08:00', tiba: '10:30', lokasi: 'Dermaga 3' },
    { id: 8, nama: 'SB. SRI EVA', tujuan: 'Berau', harga: 370000, berangkat: '11:00', tiba: '14:30', lokasi: 'Dermaga 1' }
];

const jadwalTanjungSelor = jadwalSpeedboat.filter(item => item.tujuan === 'Tanjung Selor');
const infoKeberangkatan = jadwalSpeedboat.map(item => `${item.berangkat} WITA - ${item.nama} (${item.tujuan})`);

console.log("=== BAGIAN D: JADWAL SPEEDBOAT PELABUHAN TENGKAYU ===");
console.table(jadwalTanjungSelor);
try {
    const ringkasan = ringkasJadwal(jadwalSpeedboat);
    console.log(`- Total Armada Beroperasi: ${ringkasan.totalArmada} Kapal`);
    console.log(`- Rata-rata Harga Tiket: Rp ${ringkasan.rataRataHarga.toLocaleString('id-ID')}`);
} catch (error) {
    console.error("Terjadi kesalahan:", error.message);
}


console.log("\n=== BAGIAN E: JAWABAN LATIHAN ===");

const kapalDermaga1 = jadwalSpeedboat.filter(item => item.lokasi === 'Dermaga 1');
console.log("1. Daftar Kapal yang Bersandar di Dermaga 1:");
console.table(kapalDermaga1);

function cariBerdasarkanId(idPencarian) {
    return jadwalSpeedboat.find(item => item.id === idPencarian);
}
console.log("2. Hasil Pencarian Kapal dengan ID 5:");
console.log(cariBerdasarkanId(5));


console.log("3. Ringkasan Singkat Setiap Kapal:");
jadwalSpeedboat.forEach(({ nama, tujuan, harga, lokasi }) => {
    const ringkasanString = `🚢 Kapal ${nama} berangkat dari${lokasi} menuju ${tujuan}. Harga: Rp ${harga.toLocaleString('id-ID')}`;
    console.log(ringkasanString);
});