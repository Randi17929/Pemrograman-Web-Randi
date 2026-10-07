import { ringkasJadwal } from './utils.js';

// Variabel global kosong untuk menampung data dari API
let jadwalSpeedboat = [];

// Elemen DOM untuk UI State
const daftarJadwalDOM = document.querySelector('#daftar-jadwal');
const apiMessage = document.querySelector('#api-message');
const btnRetry = document.querySelector('#btn-retry');

// Fungsi Async/Await untuk Fetch API
async function loadJadwalAPI() {
    apiMessage.textContent = '⏳ Memuat data jadwal kapal...';
    apiMessage.style.color = 'var(--brand)';
    btnRetry.style.display = 'none';
    daftarJadwalDOM.innerHTML = ''; 

    try {
        // Lakukan GET Request ke file JSON lokal
        const response = await fetch('./data/jadwal.json');
        
        if (!response.ok) {
            throw new Error(`HTTP Error Status: ${response.status}`);
        }

        // Parse format JSON menjadi array JavaScript
        const data = await response.json();
        jadwalSpeedboat = data;

        apiMessage.textContent = `✅ Berhasil memuat ${jadwalSpeedboat.length} jadwal keberangkatan.`;
        apiMessage.style.color = '#10b981';
        
        setTimeout(() => { apiMessage.textContent = ''; }, 3000);

        // Render data pertama kali ke DOM
        const limitDropdown = document.querySelector('#limit');
        renderItems(jadwalSpeedboat.slice(0, Number(limitDropdown.value)));
        jalankanAnalisaConsole();

    } catch (error) {
        console.error("Gagal Fetch API:", error);
        apiMessage.textContent = '❌ Gagal memuat data dari server. Periksa koneksi Anda.';
        apiMessage.style.color = '#ef4444'; 
        btnRetry.style.display = 'block'; 
    }
}

// Event Listener untuk Tombol Retry
btnRetry.addEventListener('click', loadJadwalAPI);

// Inisialisasi awal saat halaman dimuat
loadJadwalAPI();


const themeButton = document.querySelector('#theme-button');
const savedTheme = localStorage.getItem('theme') ?? 'light';
document.documentElement.dataset.theme = savedTheme;

function updateThemeButtonText(theme) {
    if (theme === 'dark') {
        themeButton.textContent = '☀️ Mode Keterangan';
    } else {
        themeButton.textContent = '🌙 Mode Kegelapan';
    }
}
updateThemeButtonText(savedTheme);

themeButton.addEventListener('click', () => {
    const currentTheme = document.documentElement.dataset.theme;
    const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = nextTheme;
    localStorage.setItem('theme', nextTheme);
    updateThemeButtonText(nextTheme);
});

// LOGIKA HAMBURGER MENU
const hamburgerBtn = document.querySelector('#hamburger-menu');
const closeBtn = document.querySelector('#close-sidebar');
const sidebar = document.querySelector('#sidebar');
const overlay = document.querySelector('#sidebar-overlay');
hamburgerBtn.addEventListener('click', () => {
    sidebar.classList.add('active');
    overlay.classList.add('active');
});
closeBtn.addEventListener('click', () => {
    sidebar.classList.remove('active');
    overlay.classList.remove('active');
});
overlay.addEventListener('click', () => {
    sidebar.classList.remove('active');
    overlay.classList.remove('active');
});

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

        const button = document.createElement('button');
        button.type = 'button';
        button.textContent = 'Lihat Detail';
        button.className = 'btn-outline'; 
        button.style.marginTop = '1rem';
        button.style.padding = '0.5rem';
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

    modalDetail.classList.add('active');
});

const limitDropdown = document.querySelector('#limit');
limitDropdown.value = localStorage.getItem('limit') ?? '5';

limitDropdown.addEventListener('change', () => {
    localStorage.setItem('limit', limitDropdown.value);
    renderItems(jadwalSpeedboat.slice(0, Number(limitDropdown.value)));
});


// Fungsi untuk memisahkan console log analisis agar dijalankan setelah data API selesai dimuat
function jalankanAnalisaConsole() {
    const jadwalTanjungSelor = jadwalSpeedboat.filter(item => item.tujuan === 'Tanjung Selor');
    console.log("=== BAGIAN D: JADWAL SPEEDBOAT PELABUHAN TENGKAYU ===");
    console.table(jadwalTanjungSelor);

    try {
        const ringkasan = ringkasJadwal(jadwalSpeedboat);
        console.log(`- Total Armada Beroperasi: ${ringkasan.totalArmada} Kapal`);
        console.log(`- Rata-rata Harga Tiket: Rp ${ringkasan.rataRataHarga.toLocaleString('id-ID')}`);
    } catch (error) {
        console.error("Terjadi kesalahan sistem pengolahan jadwal:", error.message);
    }
}


const formPesan = document.querySelector('#form-pesan-tiket');
const errorSummary = document.querySelector('#error-summary');

function bacaDataForm(form) {
    return {
        nama: form.nama.value.trim(),
        kontak: form.kontak.value.trim().toLowerCase(),
        tujuan: form.ke.value,
        tanggal: form.tanggal.value,
        penumpang: Number(form.penumpang.value),
        catatan: form.catatan.value.trim(),
        setuju: form.setuju.checked
    };
}

function validasiForm(data) {
    const errors = {};
    if (!data.nama || data.nama.length < 3) errors.nama = 'Nama lengkap wajib diisi minimal 3 karakter.';
    if (!data.kontak) errors.kontak = 'Email atau No. WhatsApp wajib diisi.';
    if (!data.tujuan) errors.ke = 'Silakan pilih pelabuhan tujuan.';
    if (!data.tanggal) {
        errors.tanggal = 'Tanggal keberangkatan wajib diisi.';
    } else {
        const hariIni = new Date().toISOString().split('T')[0];
        if (data.tanggal < hariIni) errors.tanggal = 'Tanggal keberangkatan tidak boleh di masa lalu.';
    }
    if (data.penumpang < 1 || data.penumpang > 10) errors.penumpang = 'Jumlah penumpang harus antara 1 hingga 10.';
    if (data.catatan.length > 200) errors.catatan = 'Catatan tidak boleh lebih dari 200 karakter.';
    if (!data.setuju) errors.setuju = 'Anda wajib menyetujui syarat & ketentuan.';
    return errors;
}

if (formPesan) {
    formPesan.addEventListener('submit', (event) => {
        event.preventDefault();
        const data = bacaDataForm(formPesan);
        const errors = validasiForm(data);

        formPesan.querySelectorAll('.error-text').forEach(el => el.textContent = '');
        formPesan.querySelectorAll('[aria-invalid="true"]').forEach(el => el.removeAttribute('aria-invalid'));
        errorSummary.style.display = 'none';
        errorSummary.textContent = '';

        const daftarError = Object.keys(errors);
        if (daftarError.length > 0) {
            for (const [field, message] of Object.entries(errors)) {
                document.querySelector(`#error-${field}`).textContent = message;
                formPesan.elements[field]?.setAttribute('aria-invalid', 'true');
            }
            errorSummary.textContent = `Pemesanan gagal. Terdapat ${daftarError.length} kolom yang harus diperbaiki.`;
            errorSummary.style.display = 'block';
            formPesan.elements[daftarError[0]]?.focus();
            return; 
        }

        alert('Data valid! Simulasi berhasil, mengarahkan ke halaman pembayaran...');
        formPesan.reset();
    });
}

const formCari = document.querySelector('#form-cari-tiket');
const inputCariKe = document.querySelector('#cari_ke'); 

if (formCari) {
    formCari.addEventListener('submit', (event) => {
        event.preventDefault(); 
        
        const tujuanPilihan = inputCariKe.value;
        const limitActive = Number(document.querySelector('#limit').value);

        let hasilPencarian;
        if (tujuanPilihan === "") {
            hasilPencarian = jadwalSpeedboat;
        } else {
            hasilPencarian = jadwalSpeedboat.filter(item => item.tujuan === tujuanPilihan);
        }
        renderItems(hasilPencarian.slice(0, limitActive));

        const tombolFilter = document.querySelectorAll('[data-filter]');
        tombolFilter.forEach(btn => btn.classList.replace('btn-primary', 'btn-outline'));
        
        const searchInputLive = document.querySelector('#search');
        if(searchInputLive) searchInputLive.value = tujuanPilihan;

        const bagianJadwal = document.querySelector('#bagian-jadwal');
        if (bagianJadwal) bagianJadwal.scrollIntoView({ behavior: 'smooth' });
    });
}