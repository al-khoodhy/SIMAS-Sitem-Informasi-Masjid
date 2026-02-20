export const formatRupiah = (angka) => new Intl.NumberFormat('id-ID', { 
    style: 'currency', 
    currency: 'IDR', 
    minimumFractionDigits: 0 
}).format(angka || 0);

export const formatTanggal = (tanggal) => new Intl.DateTimeFormat('id-ID', { 
    day: 'numeric', 
    month: 'long', 
    year: 'numeric', 
    hour: '2-digit', 
    minute: '2-digit' 
}).format(new Date(tanggal));