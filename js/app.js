import { ringkasJadwal, API_URL } from './utils.js';

let jadwalSpeedboat = [];
const daftarJadwalDOM = document.querySelector('#daftar-jadwal');
const apiMessage = document.querySelector('#api-message');
const btnRetry = document.querySelector('#btn-retry');

/* =========================================
   READ (GET) - Load List dari Database
   ========================================= */
async function loadJadwalAPI(tujuanFilter = '') {
    apiMessage.textContent = 'Memuat data jadwal dari server...';
    apiMessage.style.color = 'var(--brand)';
    btnRetry.style.display = 'none';
    daftarJadwalDOM.innerHTML = '<p style="text-align:center;">Memuat data...</p>';

    try {
        // Jika ada filter, tambahkan ke URL
        const fetchUrl = tujuanFilter ? `${API_URL}?tujuan=${encodeURIComponent(tujuanFilter)}` : API_URL;
        
        const response = await fetch(fetchUrl);
        
        if (!response.ok) {
            throw new Error(`HTTP Error Status: ${response.status}`);
        }

        const dataResponse = await response.json();
        
        // Memastikan struktur data dari API sesuai
        if(dataResponse.success && dataResponse.data) {
             jadwalSpeedboat = dataResponse.data;
        } else {
             // Fallback jika API mengembalikan array langsung
             jadwalSpeedboat = Array.isArray(dataResponse) ? dataResponse : [];
        }

        apiMessage.textContent = `✅ Berhasil memuat ${jadwalSpeedboat.length} jadwal.`;
        apiMessage.style.color = '#10b981';
        setTimeout(() => { apiMessage.textContent = ''; }, 3000);

        const limitDropdown = document.querySelector('#limit');
        const limitActive = limitDropdown ? Number(limitDropdown.value) : 5;
        renderItems(jadwalSpeedboat.slice(0, limitActive));
        
        if(typeof jalankanAnalisaConsole === 'function') jalankanAnalisaConsole();

    } catch (error) {
        console.error("Gagal Fetch API:", error);
        apiMessage.textContent = '❌ Gagal memuat data dari server. Periksa koneksi Database Anda.';
        apiMessage.style.color = '#ef4444';
        btnRetry.style.display = 'block';
        daftarJadwalDOM.innerHTML = '';
    }
}

// Inisialisasi awal
loadJadwalAPI();
if(btnRetry) btnRetry.addEventListener('click', () => loadJadwalAPI());


/* =========================================
   CREATE (POST) - Submit Form Jadwal
   ========================================= */
const formPesan = document.querySelector('#form-pesan-tiket');
const errorSummary = document.querySelector('#error-summary');

// Latihan Modul: Mensimulasikan form untuk "menambah" jadwal baru ke database
if (formPesan) {
    formPesan.addEventListener('submit', async (event) => {
        event.preventDefault();
        
        // Mengumpulkan data dari form (disesuaikan dengan kebutuhan tabel)
        const payload = {
            // Asumsi untuk praktikum: Anda punya elemen input hidden atau select untuk id armada/pelabuhan
            // Di sini kita gunakan nilai dummy valid agar sukses insert ke DB untuk keperluan demo
            armada_id: 1, // ID Armada valid di tabel armada
            pelabuhan_id: 2, // ID Pelabuhan valid
            harga: 150000,
            berangkat: "08:00:00",
            tiba: "09:30:00",
            lokasi: "Dermaga 1"
        };

        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const result = await response.json();

            if (response.status === 201) {
                alert('Berhasil: ' + result.message);
                formPesan.reset();
                // SYNC STATE: Muat ulang data terbaru setelah berhasil menambah
                loadJadwalAPI(); 
            } else if (response.status === 422) {
                // Validation Error dari server
                alert('Validasi Gagal: ' + result.error.message);
            } else {
                throw new Error(result.error?.message || 'Gagal menyimpan data');
            }
        } catch (error) {
            console.error("Error POST:", error);
            alert("Terjadi kesalahan saat menyimpan data: " + error.message);
        }
    });
}


/* =========================================
   DELETE - Hapus Data dengan Konfirmasi
   ========================================= */
async function hapusJadwal(id) {
    // Meminta konfirmasi (Langkah Praktikum 6)
    if (!confirm('Apakah Anda yakin ingin menghapus jadwal ini dari database?')) return;

    try {
        const response = await fetch(`${API_URL}?id=${encodeURIComponent(id)}`, {
            method: 'DELETE',
            headers: { 'Accept': 'application/json' }
        });

        if (response.status === 204) {
            alert('Data jadwal berhasil dihapus permanen.');
            // SYNC STATE: Sinkronisasi UI dengan DB
            loadJadwalAPI(); 
            return;
        }

        // Tangkap pesan error jika status bukan 204
        const result = await response.json().catch(() => ({}));
        throw new Error(result.error?.message ?? `HTTP Error ${response.status}`);
        
    } catch (error) {
        console.error("Error DELETE:", error);
        alert("Gagal menghapus data: " + error.message);
    }
}


/* =========================================
   FUNGSI RENDER (Menampilkan ke HTML)
   ========================================= */
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
        article.style.display = 'flex';
        article.style.justifyContent = 'space-between';
        article.style.alignItems = 'center';

        const infoDiv = document.createElement('div');
        const title = document.createElement('h4');
        title.style.color = 'var(--brand)';
        title.textContent = `${item.berangkat} WITA - ${item.armada}`; // Diubah menjadi item.armada hasil JOIN

        const detail = document.createElement('p');
        detail.innerHTML = `Tujuan: <strong>${item.tujuan}</strong> | Lokasi: ${item.lokasi} | 🎟️ Rp ${Number(item.harga).toLocaleString('id-ID')}`;
        
        infoDiv.append(title, detail);

        const actionDiv = document.createElement('div');
        
        // Tombol Hapus (Trigger DELETE)
        const btnDelete = document.createElement('button');
        btnDelete.type = 'button';
        btnDelete.innerHTML = '🗑️ Hapus';
        btnDelete.className = 'btn-outline';
        btnDelete.style.marginRight = '0.5rem';
        btnDelete.style.borderColor = '#ef4444';
        btnDelete.style.color = '#ef4444';
        btnDelete.onclick = () => hapusJadwal(item.id);

        const btnDetail = document.createElement('button');
        btnDetail.type = 'button';
        btnDetail.innerHTML = 'ℹ️ Detail';
        btnDetail.className = 'btn-outline';
        btnDetail.dataset.detail = item.id;

        actionDiv.append(btnDelete, btnDetail);
        
        article.append(infoDiv, actionDiv);
        daftarJadwalDOM.append(article);
    }
}

// ... (Sisa fungsi UI lainnya seperti Tema, Modal, Filter Search tetap dipertahankan) ...

const formCari = document.querySelector('#form-cari-tiket');
const inputCariKe = document.querySelector('#cari_ke'); 

if (formCari) {
    formCari.addEventListener('submit', (event) => {
        event.preventDefault(); 
        const tujuanPilihan = inputCariKe.value;
        
        // Memanggil API dengan filter tujuan
        loadJadwalAPI(tujuanPilihan);
        
        const bagianJadwal = document.querySelector('#bagian-jadwal');
        if (bagianJadwal) bagianJadwal.scrollIntoView({ behavior: 'smooth' });
    });
}