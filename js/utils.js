export function ringkasJadwal(data) {
    if (!Array.isArray(data) || data.length === 0) {
        throw new TypeError('Data jadwal tidak valid atau sedang kosong.');
    }
    
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