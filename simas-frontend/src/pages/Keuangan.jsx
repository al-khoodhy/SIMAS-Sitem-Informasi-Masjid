// src/pages/Keuangan.jsx
import { useState, useEffect, useCallback } from 'react';
import { Plus, Search, FileText, X, Filter, Edit, Trash2 } from 'lucide-react';
import api from '../api/axios';

export default function Keuangan() {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [submitLoading, setSubmitLoading] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    const [kategoriList, setKategoriList] = useState([]);
    const [campaignList, setCampaignList] = useState([]);
    const user = JSON.parse(localStorage.getItem('user')); // Dapatkan role
    const [editId, setEditId] = useState(null);
    // STATE BARU: Filter Tanggal
    const [filter, setFilter] = useState({
        startDate: '',
        endDate: ''
    });
    
    // State untuk Form
const [formData, setFormData] = useState({
        tipe: 'masuk',
        kategori_id: '', // Kosongkan string awalnya
        campaign_id: '', // Tambahkan field campaign
        nominal: '', keterangan: '', tanggal_transaksi: new Date().toISOString().split('T')[0], bukti_foto: null
    });

    const handleEdit = (trx) => {
        setEditId(trx.id);
        setFormData({
            tipe: trx.tipe,
            kategori_id: trx.kategori_id || '',
            campaign_id: trx.campaign_id || '',
            nominal: trx.nominal,
            keterangan: trx.keterangan,
            tanggal_transaksi: trx.tanggal_transaksi.split(' ')[0], // Ambil format YYYY-MM-DD
            bukti_foto: null
        });
        setIsModalOpen(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm("AWAS: Yakin menghapus transaksi ini? Saldo akan berubah!")) return;
        try {
            await api.delete(`/keuangan/${id}`);
            fetchTransactions();
            alert("Data berhasil dihapus secara permanen.");
        } catch (error) {
            console.log(error);
            alert("Gagal menghapus data.");
        }
    };

// 1. Bungkus fungsi dengan useCallback
const fetchTransactions = useCallback(async () => {
    setLoading(true);
    try {
        const params = {};
        if (filter.startDate && filter.endDate) {
            params.start_date = filter.startDate;
            params.end_date = filter.endDate;
        }
        const response = await api.get('/keuangan', { params }); 
        setTransactions(response.data.data);
    } catch (error) {
        console.error("Gagal mengambil data", error);
    } finally {
        setLoading(false);
    }
}, [filter.startDate, filter.endDate]); // Fungsi ini akan diperbarui hanya jika tanggal filter berubah

// 2. Bungkus fetchMasterData dengan useCallback
const fetchMasterData = useCallback(async () => {
    try {
        const resKat = await api.get('/kategori-keuangan');
        const resCam = await api.get('/campaign-donasi');
        setKategoriList(resKat.data.data);
        setCampaignList(resCam.data.data.filter(c => c.status === 'aktif'));
        
        if(resKat.data.data.length > 0) {
            setFormData(prev => ({ ...prev, kategori_id: resKat.data.data[0].id }));
        }
    } catch (error) { console.error(error); }
}, []); // Array kosong karena tidak bergantung pada state apapun yang berubah

// 3. Masukkan fungsi yang sudah aman ke dalam useEffect
useEffect(() => {
    fetchTransactions();
    fetchMasterData();
}, [fetchTransactions, fetchMasterData]);

    // Fungsi Download PDF (Panggil ke Laravel)
    const handleExportPdf = async () => {
        setIsExporting(true);
        try {
            const params = {};
            if (filter.startDate && filter.endDate) {
                params.start_date = filter.startDate;
                params.end_date = filter.endDate;
            }

            // Gunakan responseType 'blob' khusus untuk mengunduh file
            const response = await api.get('/keuangan/export-pdf', { 
                params, 
                responseType: 'blob' 
            });

            // Logika download file di React
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Audit_Keuangan_${new Date().getTime()}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);

        } catch (error) {
            console.error("Gagal export PDF", error);
            alert("Terjadi kesalahan saat membuat file PDF.");
        } finally {
            setIsExporting(false);
        }
    };

    // Handle perubahan input form biasa
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // Handle perubahan input file (Gambar)
    const handleFileChange = (e) => {
        setFormData(prev => ({ ...prev, bukti_foto: e.target.files[0] }));
    };

    // Submit Data (Kirim ke Backend)
    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitLoading(true);

        const dataToSend = new FormData();
        dataToSend.append('tipe', formData.tipe);
        dataToSend.append('kategori_id', formData.kategori_id);
        dataToSend.append('nominal', formData.nominal);
        dataToSend.append('keterangan', formData.keterangan);
        dataToSend.append('tanggal_transaksi', formData.tanggal_transaksi);

        if (editId) { await api.post('/keuangan/'+editId+'?_method=PUT', dataToSend) } else { await api.post('/keuangan', dataToSend) }

        if (formData.campaign_id) {
            dataToSend.append('campaign_id', formData.campaign_id);
        }

        if (formData.bukti_foto) {
            dataToSend.append('bukti_foto', formData.bukti_foto);
        }

        try {
            await api.post('/keuangan', dataToSend, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            
            setIsModalOpen(false);
            setFormData({ ...formData, nominal: '', keterangan: '', bukti_foto: null });
            fetchTransactions();
            alert("Transaksi berhasil dicatat!");
        } catch (error) {
            console.error(error);
            alert(error.response?.data?.message || "Terjadi kesalahan saat menyimpan data.");
        } finally {
            setSubmitLoading(false);
        }
    };

    // Format Rupiah
    const formatRupiah = (angka) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(angka);
    };

    // Format Tanggal
    const formatTanggal = (tanggal) => {
        return new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(tanggal));
    };

    return (
        <div>
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Manajemen Keuangan</h1>
                    <p className="text-sm text-gray-500">Catat transaksi dan cetak audit laporan keuangan.</p>
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                    {/* Tombol Cetak PDF */}
                    <button 
                        onClick={handleExportPdf}
                        disabled={isExporting}
                        className="flex-1 md:flex-none bg-red-50 text-red-600 border border-red-200 hover:bg-red-500 hover:text-white px-4 py-2 rounded-lg flex items-center justify-center shadow-sm transition disabled:opacity-50 font-medium text-sm"
                    >
                        {isExporting ? <span className="animate-pulse">Menyiapkan PDF...</span> : <><FileText className="w-4 h-4 mr-2" /> Cetak Audit PDF</>}
                    </button>
                    
                    {/* Tombol Catat Transaksi */}
                    <button 
                        onClick={() => setIsModalOpen(true)}
                        className="flex-1 md:flex-none bg-primary hover:bg-secondary text-white px-4 py-2 rounded-lg flex items-center justify-center shadow-sm transition font-medium text-sm"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Catat Transaksi
                    </button>
                </div>
            </div>

            {/* BARU: Filter Bar (Tanggal) */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6 flex flex-col md:flex-row items-center gap-4">
                <div className="flex items-center text-gray-500 font-medium text-sm">
                    <Filter className="w-4 h-4 mr-2" /> Filter Periode:
                </div>
                <div className="flex items-center gap-2 w-full md:w-auto">
                    <input 
                        type="date" 
                        value={filter.startDate} 
                        onChange={(e) => setFilter({ ...filter, startDate: e.target.value })}
                        className="w-full md:w-auto border rounded-lg p-2 text-sm focus:ring-primary outline-none"
                    />
                    <span className="text-gray-400">s/d</span>
                    <input 
                        type="date" 
                        value={filter.endDate} 
                        onChange={(e) => setFilter({ ...filter, endDate: e.target.value })}
                        className="w-full md:w-auto border rounded-lg p-2 text-sm focus:ring-primary outline-none"
                    />
                </div>
                {/* Tombol Reset Filter hanya muncul jika tanggal diisi */}
                {(filter.startDate || filter.endDate) && (
                    <button 
                        onClick={() => setFilter({ startDate: '', endDate: '' })}
                        className="text-sm text-red-500 hover:underline font-medium"
                    >
                        Reset Filter
                    </button>
                )}
            </div>

            {/* Table Section */}
{/* Table Section */}
<div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-4 border-b border-gray-100 flex justify-between items-center">
                    <h2 className="font-semibold text-gray-700">Buku Kas Terbaru</h2>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-600">
                        <thead className="bg-gray-50 text-gray-700 uppercase font-medium text-xs">
                            <tr>
                                <th className="px-6 py-3">Tanggal</th>
                                <th className="px-6 py-3">Rincian Transaksi</th>
                                <th className="px-6 py-3 text-center">Tipe</th>
                                <th className="px-6 py-3 text-right">Nominal</th>
                                <th className="px-6 py-3 text-center">Bukti</th>
                                {user.role === 'developer' && <th className="px-6 py-3 text-center">Aksi Dev</th>}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-10 text-center text-gray-500">Memuat data transaksi...</td>
                                </tr>
                            ) : transactions.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-10 text-center text-gray-500">Belum ada data transaksi untuk periode ini.</td>
                                </tr>
                            ) : (
                                transactions.map((trx) => (
                                    <tr key={trx.id} className="hover:bg-gray-50 transition">
                                        <td className="px-6 py-4 whitespace-nowrap">{formatTanggal(trx.tanggal_transaksi)}</td>
                                        
                                        {/* PERBAIKAN: Kolom Rincian Transaksi (Kategori + Keterangan + Target Dana) */}
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-gray-800">
                                                {/* Mengambil nama kategori dari relasi API */}
                                                {trx.kategori?.nama_kategori || 'Kategori Tidak Diketahui'}
                                            </div>
                                            <div className="text-sm text-gray-500 mt-1 line-clamp-2">
                                                {trx.keterangan}
                                            </div>
                                            
                                            {/* Badge Target Dana: Hanya muncul jika transaksi ini masuk ke Target Pengadaan */}
                                            {trx.campaign && (
                                                <div className="mt-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-100">
                                                    <Target className="w-3 h-3 mr-1" />
                                                    Target Dana: {trx.campaign.judul}
                                                </div>
                                            )}
                                        </td>

                                        <td className="px-6 py-4 text-center">
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold inline-block ${
                                                trx.tipe === 'masuk' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                            }`}>
                                                {trx.tipe === 'masuk' ? 'Pemasukan' : 'Pengeluaran'}
                                            </span>
                                        </td>
                                        <td className={`px-6 py-4 text-right font-bold whitespace-nowrap ${
                                            trx.tipe === 'masuk' ? 'text-green-600' : 'text-red-600'
                                        }`}>
                                            {trx.tipe === 'masuk' ? '+' : '-'} {formatRupiah(trx.nominal)}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex justify-center">
                                                {trx.bukti_foto ? (
                                                    <a 
                                                        href={`http://localhost:8000/storage/${trx.bukti_foto}`} 
                                                        target="_blank" 
                                                        rel="noreferrer"
                                                        className="relative group block w-10 h-10"
                                                        title="Klik untuk melihat bukti utuh"
                                                    >
                                                        <img 
                                                            src={`http://localhost:8000/storage/${trx.bukti_foto}`} 
                                                            alt="Bukti" 
                                                            className="w-10 h-10 object-cover rounded-md border border-gray-200 shadow-sm transition-transform duration-200 group-hover:scale-105"
                                                            onError={(e) => { e.target.src = 'https://via.placeholder.com/150?text=Error'; }}
                                                        />
                                                        <div className="absolute inset-0 bg-black/50 hidden group-hover:flex items-center justify-center rounded-md transition-all">
                                                            <Search className="w-4 h-4 text-white" />
                                                        </div>
                                                    </a>
                                                ) : (
                                                    <span className="text-gray-400 text-[10px] uppercase font-bold tracking-wider bg-gray-100 px-2 py-1 rounded border border-gray-200">Tanpa Bukti</span>
                                                )}
                                            </div>
                                        </td>
                                        {user.role === 'developer' && (
                                        <td className="px-6 py-4 text-center">
                                            <div className="flex justify-center space-x-2">
                                                <button onClick={() => handleEdit(trx)} className="p-1 bg-blue-50 text-blue-600 rounded hover:bg-blue-100"><Edit className="w-4 h-4" /></button>
                                                <button onClick={() => handleDelete(trx.id)} className="p-1 bg-red-50 text-red-600 rounded hover:bg-red-100"><Trash2 className="w-4 h-4" /></button>
                                            </div>
                                        </td>
                                    )}
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal Form Tambah Transaksi */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="flex justify-between items-center p-4 border-b bg-gray-50">
                            <h3 className="font-bold text-lg text-gray-800">Catat Transaksi Baru</h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        
                        <div className="p-6 overflow-y-auto">
                            <form id="keuanganForm" onSubmit={handleSubmit} className="space-y-4">
                                
                                {/* Baris 1: Tipe Transaksi & Tanggal */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Tipe Transaksi</label>
                                        <select 
                                            name="tipe" 
                                            value={formData.tipe} 
                                            onChange={(e) => {
                                                handleInputChange(e);
                                                // Reset kategori dan campaign saat tipe berubah agar tidak error
                                                setFormData(prev => ({...prev, kategori_id: '', campaign_id: ''}));
                                            }} 
                                            className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-primary focus:border-primary outline-none text-sm bg-white"
                                        >
                                            <option value="masuk">Pemasukan (+)</option>
                                            <option value="keluar">Pengeluaran (-)</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal</label>
                                        <input 
                                            type="date" 
                                            name="tanggal_transaksi" 
                                            value={formData.tanggal_transaksi} 
                                            onChange={handleInputChange} 
                                            required 
                                            className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-primary focus:border-primary outline-none text-sm" 
                                        />
                                    </div>
                                </div>

                                {/* Baris 2: Kategori (Otomatis Filter sesuai Tipe Transaksi) */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Kategori Transaksi</label>
                                    <select 
                                        name="kategori_id" 
                                        value={formData.kategori_id} 
                                        onChange={handleInputChange} 
                                        className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-primary focus:border-primary outline-none text-sm bg-white" 
                                        required
                                    >
                                        <option value="" disabled>-- Pilih Kategori --</option>
                                        {kategoriList.filter(k => k.jenis === (formData.tipe === 'masuk' ? 'pemasukan' : 'pengeluaran')).map(kat => (
                                            <option key={kat.id} value={kat.id}>{kat.nama_kategori}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Baris 3: Target Campaign (Hanya Muncul Jika Pemasukan) */}
                                {formData.tipe === 'masuk' && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Salurkan Ke Target Pengadaan (Opsional)</label>
                                        <select 
                                            name="campaign_id" 
                                            value={formData.campaign_id} 
                                            onChange={handleInputChange} 
                                            className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-primary focus:border-primary outline-none text-sm bg-white"
                                        >
                                            <option value="">-- Masuk Kas Umum Masjid --</option>
                                            {campaignList.map(cam => (
                                                <option key={cam.id} value={cam.id}>Tujuan: {cam.judul}</option>
                                            ))}
                                        </select>
                                    </div>
                                )}

                                {/* Baris 4: Nominal */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Nominal (Rp) <span className="text-red-500">*</span></label>
                                    <input 
                                        type="number" 
                                        name="nominal" 
                                        value={formData.nominal} 
                                        onChange={handleInputChange} 
                                        required min="1" 
                                        placeholder="Contoh: 50000" 
                                        className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-primary focus:border-primary outline-none text-sm" 
                                    />
                                </div>

                                {/* Baris 5: Keterangan */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Keterangan Detail <span className="text-red-500">*</span></label>
                                    <textarea 
                                        name="keterangan" 
                                        value={formData.keterangan} 
                                        onChange={handleInputChange} 
                                        required rows="2" 
                                        placeholder="Contoh: Kotak amal jumat minggu ke-1" 
                                        className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-primary focus:border-primary outline-none text-sm"
                                    ></textarea>
                                </div>

                                {/* Baris 6: Upload Foto */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Bukti Foto (Opsional)</label>
                                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-3 text-center hover:bg-gray-50 transition">
                                        <input 
                                            type="file" 
                                            accept="image/*" 
                                            onChange={handleFileChange} 
                                            className="w-full text-sm text-gray-500 file:mr-4 file:py-1.5 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 cursor-pointer" 
                                        />
                                    </div>
                                </div>
                            </form>
                        </div>

                        <div className="p-4 border-t bg-gray-50 flex gap-3 justify-end">
                            <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium text-sm">Batal</button>
                            <button type="submit" form="keuanganForm" disabled={submitLoading} className="px-5 py-2.5 bg-primary text-white rounded-lg hover:bg-secondary transition font-medium text-sm flex items-center disabled:opacity-50">
                                {submitLoading ? 'Menyimpan...' : 'Simpan Transaksi'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}