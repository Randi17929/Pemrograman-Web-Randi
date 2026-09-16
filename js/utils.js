export function ringkasJadwal(data) {
    if (!Array.isArray(data)) {
        throw new TypeError('Data jadwal harus berupa array');
    }
    
    // Menyaring jadwal keberangkatan pagi (sebelum jam 12:00)
    const jadwalPagi = data.filter(item => {
        const jamBerangkat = parseInt(item.berangkat.split(':')[0]);
        return jamBerangkat < 12;
    });

    return {
        totalArmada: data.length,
        armadaPagi: jadwalPagi.length,
        armadaSiangSore: data.length - jadwalPagi.length,
        rataRataHarga: data.reduce((sum, item) => sum + item.harga, 0) / data.length
    };
}