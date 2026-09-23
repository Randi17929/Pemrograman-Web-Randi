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


const themeButton = document.querySelector('#theme-button');
const savedTheme = localStorage.getItem('theme') ?? 'light';
document.documentElement.dataset.theme = savedTheme;

// tombol mode kegelapan dan mode keterangan
function updateThemeButtonText(theme) {
    if (theme === 'dark') {
        themeButton.textContent = '☀️ Mode Keterangan';
    } else {
        themeButton.textContent = '🌙 Mode Kegelapan';
    }
}

updateThemeButtonText(savedTheme);

// Event ketika tombol ganti tema dipencet
themeButton.addEventListener('click', () => {
    const currentTheme = document.documentElement.dataset.theme;
    const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    // Ubah di tampilan UI HTML
    document.documentElement.dataset.theme = nextTheme;
    localStorage.setItem('theme', nextTheme);
    updateThemeButtonText(nextTheme);
});

// LOGIKA HAMBURGER MENU (DOM & EVENT)
const hamburgerBtn = document.querySelector('#hamburger-menu');
const closeBtn = document.querySelector('#close-sidebar');
const sidebar = document.querySelector('#sidebar');
const overlay = document.querySelector('#sidebar-overlay');

// Fungsi untuk membuka menu
hamburgerBtn.addEventListener('click', () => {
    sidebar.classList.add('active');
    overlay.classList.add('active');
});

// Fungsi untuk menutup menu dengan X
closeBtn.addEventListener('click', () => {
    sidebar.classList.remove('active');
    overlay.classList.remove('active');
});

// Fungsi untuk menutup menu jika area gelap luar diklik
overlay.addEventListener('click', () => {
    sidebar.classList.remove('active');
    overlay.classList.remove('active');
});

const daftarJadwalDOM = document.querySelector('#daftar-jadwal');
const tombolFilter = document.querySelectorAll('[data-filter]');

function renderItems(items) {
    daftarJadwalDOM.replaceChildren();

    if (items.length === 0) {
        const pesanKosong = document.createElement('p');
        pesanKosong.textContent = "Data kapal tidak ditemukan. Coba kata kunci lain.";
        pesanKosong.style.fontStyle = 'italic';
        pesanKosong.style.color = 'var(--text-light)';
        daftarJadwalDOM.append(pesanKosong);
        return;
    }

    for (const item of items) {
        const article = document.createElement('article');
        article.className = 'card jadwal-card'; 
        article.style.padding = '1rem';
        article.style.border = '1px solid #ccc';

        const title = document.createElement('h4');
        title.style.color = 'var(--brand)';
        title.textContent = `${item.berangkat} WITA - ${item.nama}`;

        const info = document.createElement('p');
        info.textContent = `Tujuan: ${item.tujuan} | Lokasi: ${item.lokasi} | Harga: Rp ${item.harga.toLocaleString('id-ID')}`;

        // [Latihan 2] Tambahkan Tombol Detail
        const button = document.createElement('button');
        button.type = 'button';
        button.textContent = 'Lihat Detail';
        button.className = 'btn-outline'; 
        button.style.marginTop = '1rem';
        button.style.padding = '0.5rem';
        // Menyimpan ID kapal
        button.dataset.detail = item.id;

        article.append(title, info, button);
        daftarJadwalDOM.append(article);
    }
}

tombolFilter.forEach(button => {
    button.addEventListener('click', () => {
        const filterValue = button.dataset.filter;
        const limitActive = Number(document.querySelector('#limit').value);
    
        const hasilFilter = filterValue === 'Semua' 
            ? jadwalSpeedboat 
            : jadwalSpeedboat.filter(item => item.lokasi === filterValue);
    
        renderItems(hasilFilter.slice(0, limitActive));

        tombolFilter.forEach(btn => btn.classList.replace('btn-primary', 'btn-outline'));
        button.classList.replace('btn-outline', 'btn-primary');
    });
});

const searchInput = document.querySelector('#search');
searchInput.addEventListener('input', (event) => {
    const keyword = event.target.value.toLowerCase();
    
    const hasilPencarian = jadwalSpeedboat.filter(item => 
        item.nama.toLowerCase().includes(keyword) ||
        item.tujuan.toLowerCase().includes(keyword)
    );
    
    const limitActive = Number(document.querySelector('#limit').value);
    renderItems(hasilPencarian.slice(0, limitActive));
});


const modalDetail = document.querySelector('#detail-modal');
const modalContentDOM = document.querySelector('#modal-body-content');
const btnTutupModal = document.querySelectorAll('#close-modal, #modal-ok-btn');

function tutupModal() {
    modalDetail.classList.remove('active');
}
btnTutupModal.forEach(btn => btn.addEventListener('click', tutupModal));

modalDetail.addEventListener('click', (event) => {
    if (event.target === modalDetail) tutupModal();
});

daftarJadwalDOM.addEventListener('click', (event) => {
    const button = event.target.closest('[data-detail]');
    if (!button) return; 

    const idKapal = Number(button.dataset.detail);
    const detailKapal = jadwalSpeedboat.find(data => data.id === idKapal);

    modalContentDOM.innerHTML = `
        <p><strong>🚢 Kapal:</strong> ${detailKapal.nama}</p>
        <p><strong>📍 Tujuan:</strong> ${detailKapal.tujuan}</p>
        <p><strong>⚓ Lokasi Sandar:</strong> ${detailKapal.lokasi}</p>
        <p><strong>⏰ Tiba Estimasi:</strong> ${detailKapal.tiba} WITA</p>
        <hr style="border: 0; border-top: 1px dashed #ccc; margin: 1rem 0;">
        <p style="font-size: 1.2rem; color: var(--brand); font-weight: bold; text-align: right;">
            🎟️ Rp ${detailKapal.harga.toLocaleString('id-ID')}
        </p>
    `;

    // Tampilkan modal pop-up meluncur
    modalDetail.classList.add('active');
});

// [Latihan 3] Simpan Preferensi Jumlah Item di localStorage
const limitDropdown = document.querySelector('#limit');
limitDropdown.value = localStorage.getItem('limit') ?? '5';

limitDropdown.addEventListener('change', () => {
    localStorage.setItem('limit', limitDropdown.value);
    renderItems(jadwalSpeedboat.slice(0, Number(limitDropdown.value)));
});

renderItems(jadwalSpeedboat.slice(0, Number(limitDropdown.value)));

const jadwalTanjungSelor = jadwalSpeedboat.filter(item => item.tujuan === 'Tanjung Selor');
const infoKeberangkatan = jadwalSpeedboat.map(({ berangkat, nama, tujuan }) => `${berangkat} WITA - ${nama} (${tujuan})`);

console.log("=== BAGIAN D: JADWAL SPEEDBOAT PELABUHAN TENGKAYU ===");
console.table(jadwalTanjungSelor);

try {
    const ringkasan = ringkasJadwal(jadwalSpeedboat);
    console.log(`- Total Armada Beroperasi: ${ringkasan.totalArmada} Kapal`);
    console.log(`- Rata-rata Harga Tiket: Rp ${ringkasan.rataRataHarga.toLocaleString('id-ID')}`);
} catch (error) {
    console.error("Terjadi kesalahan sistem pengolahan jadwal:", error.message);
}

console.log("\n=== JADWAL KAPAL BERDASARKAN DERMAGA ===");
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
    const ringkasanString = `🚢 Kapal ${nama} berangkat dari ${lokasi} menuju ${tujuan}. Harga: Rp ${harga.toLocaleString('id-ID')}`;
    console.log(ringkasanString);
});