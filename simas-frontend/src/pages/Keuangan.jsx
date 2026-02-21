// src/pages/Keuangan.jsx
import { useState, useEffect, useRef } from 'react';
import { Wallet, TrendingUp, TrendingDown, Plus, Edit, Trash2, X, Search, ChevronLeft, ChevronRight, FileText, Calendar } from 'lucide-react';
import api from '../api/axios';

export default function Keuangan() {
    const user = JSON.parse(localStorage.getItem('user'));
    
    // State Utama
    const [transactions, setTransactions] = useState([]);
    const [summary, setSummary] = useState({ pemasukan: 0, pengeluaran: 0, saldo: 0 });
    const [loading, setLoading] = useState(true);
    
    // State Optimasi
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalData, setTotalData] = useState(0);
    const [tipeFilter, setTipeFilter] = useState('semua');
    const [searchTerm, setSearchTerm] = useState('');
    const typingTimeoutRef = useRef(null); 

    // State Modal & Form Transaksi
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editId, setEditId] = useState(null);
    const [submitLoading, setSubmitLoading] = useState(false);
    const [formData, setFormData] = useState({
        tanggal_transaksi: '', tipe: 'masuk', kategori_id: '', nominal: '', keterangan: ''
    });

    // ==========================================
    // STATE & FUNGSI BARU: FITUR AUDIT PDF
    // ==========================================
    const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    const [auditDates, setAuditDates] = useState({ 
        start_date: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0], // Default awal bulan ini
        end_date: new Date().toISOString().split('T')[0] // Default hari ini
    });

    const handleExportPdf = async (e) => {
        e.preventDefault();
        if (auditDates.start_date > auditDates.end_date) {
            alert("Tanggal awal tidak boleh lebih dari tanggal akhir!"); return;
        }

        setIsExporting(true);
        try {
            // Tembak API dan paksa tipe response menjadi Blob (File/Binary)
            const res = await api.get('/keuangan/export-pdf', {
                params: { start_date: auditDates.start_date, end_date: auditDates.end_date },
                responseType: 'blob'
            });

            // Buat URL virtual dan pancing browser untuk mendownload file
            const url = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Laporan_Kas_${auditDates.start_date}_sd_${auditDates.end_date}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);

            setIsAuditModalOpen(false);
        } catch (error) {
            console.error("Gagal export PDF", error);
            alert("Gagal mengunduh Laporan PDF. Pastikan format Backend sudah benar.");
        } finally {
            setIsExporting(false);
        }
    };
    // ==========================================

    useEffect(() => {
        fetchTransactions();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page, tipeFilter]);

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => {
            setPage(1); 
            fetchTransactions(1, e.target.value);
        }, 500);
    };

    const fetchTransactions = async (currentPage = page, search = searchTerm) => {
        setLoading(true);
        try {
            const params = { page: currentPage };
            if (tipeFilter !== 'semua') params.tipe = tipeFilter;
            if (search.trim() !== '') params.search = search;

            const res = await api.get(`/keuangan`, { params });
            const responseData = res.data;
            
            setTransactions(responseData.data || []);
            
            if (responseData.summary) {
                setSummary({
                    pemasukan: responseData.summary.pemasukan || 0,
                    pengeluaran: responseData.summary.pengeluaran || 0,
                    saldo: responseData.summary.saldo || 0
                });
            }
            if (responseData.pagination) {
                setTotalPages(responseData.pagination.last_page || 1);
                setTotalData(responseData.pagination.total || 0);
            }
        } catch (error) { console.error("Gagal mengambil data", error); } finally { setLoading(false); }
    };

    const handleAdd = () => {
        setEditId(null);
        setFormData({ tanggal_transaksi: new Date().toISOString().split('T')[0], tipe: 'masuk', kategori_id: '', nominal: '', keterangan: '' });
        setIsModalOpen(true);
    };

    const handleEdit = (item) => {
        setEditId(item.id);
        setFormData({ 
            tanggal_transaksi: item.tanggal_transaksi.split(' ')[0], 
            tipe: item.tipe, 
            kategori_id: item.kategori_id || '', 
            nominal: item.nominal, 
            keterangan: item.keterangan 
        });
        setIsModalOpen(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm("AWAS! Menghapus data transaksi dapat memengaruhi saldo kas keseluruhan. Lanjutkan?")) return;
        try { await api.delete(`/keuangan/${id}`); fetchTransactions(); alert("Data berhasil dihapus!"); } catch (error) { alert("Gagal menghapus"); }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitLoading(true);
        try {
            if (editId) {
                await api.put(`/keuangan/${editId}`, formData);
                alert("Transaksi berhasil diperbarui.");
            } else {
                await api.post('/keuangan', formData);
                alert("Transaksi baru berhasil dicatat.");
            }
            setIsModalOpen(false); setPage(1); fetchTransactions(1);
        } catch (error) {
            alert(error.response?.data?.message || "Gagal menyimpan data. Pastikan semua kolom terisi.");
        } finally { setSubmitLoading(false); }
    };

    const formatRupiah = (angka) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(angka || 0);
    const formatTanggal = (tanggal) => new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(tanggal));

    return (
        <div className="pb-10">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Manajemen Kas Masjid</h1>
                    <p className="text-sm text-gray-500">Pencatatan buku kas secara transparan dan real-time.</p>
                </div>
                
                {/* GRUP TOMBOL HEADER */}
                <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                    <button onClick={() => setIsAuditModalOpen(true)} className="bg-white border border-gray-300 text-gray-700 px-4 py-2.5 rounded-xl font-bold flex items-center justify-center shadow-sm hover:bg-gray-50 transition whitespace-nowrap">
                        <FileText className="w-5 h-5 mr-2 text-primary" /> Cetak Audit PDF
                    </button>
                    <button onClick={handleAdd} className="bg-primary text-white px-5 py-2.5 rounded-xl font-bold flex items-center justify-center shadow-md hover:bg-secondary transition whitespace-nowrap">
                        <Plus className="w-5 h-5 mr-2" /> Catat Transaksi Baru
                    </button>
                </div>
            </div>

            {/* BARIS 1: KARTU RINGKASAN */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center">
                    <div className="w-14 h-14 bg-green-100 text-green-600 rounded-xl flex items-center justify-center mr-4"><TrendingUp className="w-7 h-7" /></div>
                    <div>
                        <p className="text-sm text-gray-500 font-medium mb-1">Total Pemasukan</p>
                        <h3 className="text-2xl font-bold text-green-600">{formatRupiah(summary.pemasukan)}</h3>
                    </div>
                </div>
                <div className="bg-primary p-6 rounded-2xl shadow-lg border border-primary flex items-center relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full blur-2xl transform translate-x-10 -translate-y-10"></div>
                    <div className="w-14 h-14 bg-white/20 text-white rounded-xl flex items-center justify-center mr-4 relative z-10"><Wallet className="w-7 h-7" /></div>
                    <div className="relative z-10">
                        <p className="text-sm text-green-100 font-medium mb-1">Saldo Kas Akhir</p>
                        <h3 className="text-2xl font-bold text-white">{formatRupiah(summary.saldo)}</h3>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center">
                    <div className="w-14 h-14 bg-red-100 text-red-600 rounded-xl flex items-center justify-center mr-4"><TrendingDown className="w-7 h-7" /></div>
                    <div>
                        <p className="text-sm text-gray-500 font-medium mb-1">Total Pengeluaran</p>
                        <h3 className="text-2xl font-bold text-red-600">{formatRupiah(summary.pengeluaran)}</h3>
                    </div>
                </div>
            </div>

            {/* BARIS 2: TABEL PENCARIAN & FILTER */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-5 border-b border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row gap-4 justify-between items-center">
                    <div className="flex gap-2 w-full sm:w-auto">
                        <button onClick={() => {setTipeFilter('semua'); setPage(1);}} className={`px-4 py-2 rounded-lg text-sm font-bold transition flex-1 sm:flex-none ${tipeFilter === 'semua' ? 'bg-gray-800 text-white shadow' : 'bg-white border text-gray-600 hover:bg-gray-50'}`}>Semua</button>
                        <button onClick={() => {setTipeFilter('masuk'); setPage(1);}} className={`px-4 py-2 rounded-lg text-sm font-bold transition flex-1 sm:flex-none ${tipeFilter === 'masuk' ? 'bg-green-500 text-white shadow' : 'bg-white border text-gray-600 hover:bg-green-50'}`}>Pemasukan</button>
                        <button onClick={() => {setTipeFilter('keluar'); setPage(1);}} className={`px-4 py-2 rounded-lg text-sm font-bold transition flex-1 sm:flex-none ${tipeFilter === 'keluar' ? 'bg-red-500 text-white shadow' : 'bg-white border text-gray-600 hover:bg-red-50'}`}>Pengeluaran</button>
                    </div>
                    
                    <div className="relative w-full sm:w-72">
                        <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                        <input type="text" placeholder="Cari keterangan..." value={searchTerm} onChange={handleSearchChange} className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary outline-none" />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-600">
                        <thead className="bg-gray-50 text-gray-700 uppercase font-bold text-xs border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4">Tanggal</th>
                                <th className="px-6 py-4">Keterangan</th>
                                <th className="px-6 py-4">Kategori</th>
                                <th className="px-6 py-4 text-right">Masuk (Rp)</th>
                                <th className="px-6 py-4 text-right">Keluar (Rp)</th>
                                <th className="px-6 py-4 text-center">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr><td colSpan="6" className="text-center py-10 text-gray-500"><div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-primary mx-auto mb-2"></div> Memuat data server...</td></tr>
                            ) : transactions.length === 0 ? (
                                <tr><td colSpan="6" className="text-center py-10 text-gray-500 italic">Data transaksi tidak ditemukan.</td></tr>
                            ) : (
                                transactions.map((t) => (
                                    <tr key={t.id} className="hover:bg-blue-50/30 transition">
                                        <td className="px-6 py-4 whitespace-nowrap">{formatTanggal(t.tanggal_transaksi)}</td>
                                        <td className="px-6 py-4 font-medium text-gray-800">{t.keterangan}</td>
                                        <td className="px-6 py-4">
                                            <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider">
                                                {t.kategori ? t.kategori.nama_kategori : 'UMUM'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right font-bold text-green-600">{t.tipe === 'masuk' ? formatRupiah(t.nominal) : '-'}</td>
                                        <td className="px-6 py-4 text-right font-bold text-red-600">{t.tipe === 'keluar' ? formatRupiah(t.nominal) : '-'}</td>
                                        <td className="px-6 py-4 text-center">
                                            <div className="flex justify-center gap-2">
                                                <button onClick={() => handleEdit(t)} className="p-1.5 bg-blue-50 text-blue-600 rounded hover:bg-blue-600 hover:text-white transition" title="Edit Transaksi"><Edit className="w-4 h-4"/></button>
                                                {(user.role === 'developer' || user.role === 'panitia') && (
                                                    <button onClick={() => handleDelete(t.id)} className="p-1.5 bg-red-50 text-red-600 rounded hover:bg-red-600 hover:text-white transition" title="Hapus Transaksi"><Trash2 className="w-4 h-4"/></button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* PAGINATION */}
                {!loading && totalPages > 1 && (
                    <div className="p-4 border-t border-gray-100 flex items-center justify-between bg-gray-50">
                        <span className="text-sm text-gray-500">
                            Hal <span className="font-bold">{page}</span> dari <span className="font-bold">{totalPages}</span> ({totalData} data)
                        </span>
                        <div className="flex gap-2">
                            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1.5 border rounded-lg text-sm disabled:opacity-50 flex"><ChevronLeft className="w-4 h-4 mr-1"/> Prev</button>
                            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="px-3 py-1.5 border rounded-lg text-sm disabled:opacity-50 flex">Next <ChevronRight className="w-4 h-4 ml-1"/></button>
                        </div>
                    </div>
                )}
            </div>

            {/* MODAL 1: FORM TRANSAKSI */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col">
                        <div className="p-5 border-b bg-gray-50 flex justify-between items-center">
                            <h3 className="font-bold text-xl text-gray-800">{editId ? 'Ralat Transaksi' : 'Pencatatan Baru'}</h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-800 bg-gray-200 hover:bg-gray-300 p-1.5 rounded-full transition"><X className="w-5 h-5"/></button>
                        </div>
                        <div className="p-6">
                            <form id="keuanganForm" onSubmit={handleSubmit} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div><label className="block text-sm font-bold mb-1">Tanggal</label><input type="date" required value={formData.tanggal_transaksi} onChange={e=>setFormData({...formData, tanggal_transaksi: e.target.value})} className="w-full border p-2.5 rounded-lg outline-none focus:ring-2 focus:ring-primary" /></div>
                                    <div><label className="block text-sm font-bold mb-1">Jenis Arus</label><select value={formData.tipe} onChange={e=>setFormData({...formData, tipe: e.target.value})} className="w-full border p-2.5 rounded-lg outline-none focus:ring-2 focus:ring-primary font-bold"><option value="masuk">🟢 PEMASUKAN</option><option value="keluar">🔴 PENGELUARAN</option></select></div>
                                </div>
                                <div><label className="block text-sm font-bold mb-1">Nominal (Rp)</label><input type="number" required min="1" placeholder="50000" value={formData.nominal} onChange={e=>setFormData({...formData, nominal: e.target.value})} className="w-full border p-2.5 rounded-lg outline-none focus:ring-2 focus:ring-primary font-bold text-lg" /></div>
                                <div><label className="block text-sm font-bold mb-1">Uraian / Keterangan Lengkap</label><textarea required rows="2" placeholder="Contoh: Pembelian token listrik masjid..." value={formData.keterangan} onChange={e=>setFormData({...formData, keterangan: e.target.value})} className="w-full border p-2.5 rounded-lg outline-none focus:ring-2 focus:ring-primary"></textarea></div>
                            </form>
                        </div>
                        <div className="p-4 border-t bg-gray-50 flex justify-end gap-3">
                            <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 border rounded-lg font-bold hover:bg-gray-100">Batal</button>
                            <button type="submit" form="keuanganForm" disabled={submitLoading} className="px-6 py-2.5 bg-primary text-white rounded-lg shadow hover:bg-secondary font-bold disabled:opacity-50">{submitLoading ? 'Menyimpan...' : 'Simpan ke Buku Kas'}</button>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL 2: FILTER AUDIT PDF */}
            {isAuditModalOpen && (
                <div className="fixed inset-0 bg-black/60 z-[70] flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden flex flex-col">
                        <div className="p-5 border-b border-gray-100 bg-gray-50 flex flex-col items-center text-center relative">
                            <button onClick={() => setIsAuditModalOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-800"><X className="w-5 h-5"/></button>
                            <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-3">
                                <Calendar className="w-7 h-7" />
                            </div>
                            <h3 className="font-bold text-xl text-gray-800">Cetak Audit Keuangan</h3>
                            <p className="text-xs text-gray-500 mt-1">Tentukan rentang tanggal laporan yang ingin Anda unduh dalam bentuk PDF.</p>
                        </div>
                        <div className="p-6">
                            <form id="auditForm" onSubmit={handleExportPdf} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1.5">Dari Tanggal</label>
                                    <input type="date" required value={auditDates.start_date} onChange={e=>setAuditDates({...auditDates, start_date: e.target.value})} className="w-full border border-gray-300 p-2.5 rounded-lg outline-none focus:ring-2 focus:ring-primary text-gray-700 font-medium" />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1.5">Sampai Tanggal</label>
                                    <input type="date" required value={auditDates.end_date} onChange={e=>setAuditDates({...auditDates, end_date: e.target.value})} className="w-full border border-gray-300 p-2.5 rounded-lg outline-none focus:ring-2 focus:ring-primary text-gray-700 font-medium" />
                                </div>
                            </form>
                        </div>
                        <div className="p-4 border-t bg-gray-50 flex flex-col gap-2">
                            <button type="submit" form="auditForm" disabled={isExporting} className="w-full py-2.5 bg-blue-600 text-white rounded-xl shadow-md hover:bg-blue-700 transition font-bold disabled:opacity-50 flex justify-center items-center">
                                {isExporting ? 'Memproses Laporan...' : 'Unduh Laporan PDF'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}