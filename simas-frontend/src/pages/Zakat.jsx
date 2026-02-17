// src/pages/Zakat.jsx
import { useState, useEffect } from 'react';
import { Users, Plus, Search, MapPin, HandHeart, History, X } from 'lucide-react';
import api from '../api/axios';

export default function Zakat() {
    // State Navigasi Tab
    const [activeTab, setActiveTab] = useState('mustahik'); // 'mustahik' atau 'riwayat'
    
    // State Data
    const [mustahikList, setMustahikList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    // State Modal & Form Mustahik
    const [isMustahikModalOpen, setIsMustahikModalOpen] = useState(false);
    const [submitLoading, setSubmitLoading] = useState(false);
    const [formData, setFormData] = useState({
        nama_lengkap: '',
        nik: '',
        rt: '10', // Default RT di Desa Puloniti
        alamat: '',
        kategori: 'fakir'
    });

    const kategoriZakat = [
        { id: 'fakir', label: 'Fakir (Sangat miskin, tidak ada penghasilan)' },
        { id: 'miskin', label: 'Miskin (Penghasilan tidak cukup)' },
        { id: 'mualaf', label: 'Mualaf (Baru masuk Islam)' },
        { id: 'fisabilillah', label: 'Fisabilillah (Pejuang jalan Allah/Guru ngaji)' },
        { id: 'ibnu_sabil', label: 'Ibnu Sabil (Musafir kehabisan bekal)' },
        { id: 'gharim', label: 'Gharim (Terlilit hutang kebutuhan pokok)' },
        { id: 'riqab', label: 'Riqab (Memerdekakan budak)' },
        { id: 'amil', label: 'Amil (Panitia pengelola zakat)' }
    ];

    useEffect(() => {
        fetchMustahik();
    }, []);

    // 1. Fungsi Tarik Data dari API
    const fetchMustahik = async () => {
        setLoading(true);
        try {
            const response = await api.get('/mustahik'); // Pastikan endpoint ini ada di Laravel
            setMustahikList(response.data.data);
        } catch (error) {
            console.error("Gagal mengambil data Mustahik", error);
        } finally {
            setLoading(false);
        }
    };

    // 2. Handle Perubahan Input Form
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // 3. Submit Data Mustahik Baru
    const handleSubmitMustahik = async (e) => {
        e.preventDefault();
        setSubmitLoading(true);

        try {
            await api.post('/mustahik', formData);
            setIsMustahikModalOpen(false);
            setFormData({ nama_lengkap: '', nik: '', rt: '10', alamat: '', kategori: 'fakir' });
            fetchMustahik();
            alert("Data Mustahik berhasil ditambahkan!");
        } catch (error) {
            console.error(error);
            alert(error.response?.data?.message || "Terjadi kesalahan saat menyimpan data.");
        } finally {
            setSubmitLoading(false);
        }
    };

    // 4. Fitur Pencarian Real-time (Frontend Filtering)
    const filteredMustahik = mustahikList.filter(m => 
        m.nama_lengkap.toLowerCase().includes(searchQuery.toLowerCase()) || 
        m.rt.includes(searchQuery)
    );

    return (
        <div>
            {/* Header Section */}
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Manajemen Zakat & Mustahik</h1>
                <p className="text-sm text-gray-500">Kelola data penerima zakat di wilayah Desa Puloniti secara tertutup dan aman.</p>
            </div>

            {/* Navigasi Tabs */}
            <div className="flex border-b border-gray-200 mb-6">
                <button 
                    onClick={() => setActiveTab('mustahik')}
                    className={`flex items-center pb-3 px-4 font-medium text-sm transition ${activeTab === 'mustahik' ? 'border-b-2 border-primary text-primary' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    <Users className="w-4 h-4 mr-2" />
                    Data Warga (Mustahik)
                </button>
                <button 
                    onClick={() => setActiveTab('riwayat')}
                    className={`flex items-center pb-3 px-4 font-medium text-sm transition ${activeTab === 'riwayat' ? 'border-b-2 border-primary text-primary' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    <History className="w-4 h-4 mr-2" />
                    Riwayat Penyaluran
                </button>
            </div>

            {/* KONTEN TAB: MUSTAHIK */}
            {activeTab === 'mustahik' && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        {/* Pencarian */}
                        <div className="relative w-full sm:w-64">
                            <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
                            <input 
                                type="text" 
                                placeholder="Cari nama atau RT..." 
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-9 pr-4 py-2 border rounded-lg text-sm focus:ring-1 focus:ring-primary outline-none" 
                            />
                        </div>
                        {/* Tombol Tambah */}
                        <button 
                            onClick={() => setIsMustahikModalOpen(true)}
                            className="w-full sm:w-auto bg-primary hover:bg-secondary text-white px-4 py-2 rounded-lg flex items-center justify-center shadow-sm transition whitespace-nowrap text-sm font-medium"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Tambah Mustahik
                        </button>
                    </div>

                    {/* Tabel Mustahik */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-gray-600">
                            <thead className="bg-gray-50 text-gray-700 uppercase font-medium text-xs">
                                <tr>
                                    <th className="px-6 py-3">Nama Lengkap / NIK</th>
                                    <th className="px-6 py-3">Kategori (Asnaf)</th>
                                    <th className="px-6 py-3 text-center">RT</th>
                                    <th className="px-6 py-3">Alamat Detail</th>
                                    <th className="px-6 py-3 text-center">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {loading ? (
                                    <tr><td colSpan="5" className="px-6 py-10 text-center text-gray-500">Memuat data warga...</td></tr>
                                ) : filteredMustahik.length === 0 ? (
                                    <tr><td colSpan="5" className="px-6 py-10 text-center text-gray-500">Tidak ada data yang ditemukan.</td></tr>
                                ) : (
                                    filteredMustahik.map((person) => (
                                        <tr key={person.id} className="hover:bg-gray-50 transition">
                                            <td className="px-6 py-4">
                                                <div className="font-bold text-gray-800">{person.nama_lengkap}</div>
                                                <div className="text-xs text-gray-500">{person.nik || 'NIK Tidak Ada'}</div>
                                            </td>
                                            <td className="px-6 py-4 capitalize">
                                                <span className="bg-blue-50 text-blue-700 px-2.5 py-1 rounded-md text-xs font-semibold border border-blue-100">
                                                    {person.kategori.replace('_', ' ')}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-center font-bold text-gray-700">
                                                {person.rt}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-start text-xs text-gray-600">
                                                    <MapPin className="w-3.5 h-3.5 mr-1 mt-0.5 text-gray-400 flex-shrink-0" />
                                                    <span className="line-clamp-2">{person.alamat}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className={`px-2 py-1 rounded text-xs font-semibold ${person.status_aktif ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                    {person.status_aktif ? 'Aktif' : 'Nonaktif'}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* KONTEN TAB: RIWAYAT PENYALURAN (Placeholder/Coming Soon) */}
            {activeTab === 'riwayat' && (
                <div className="bg-white p-10 rounded-xl shadow-sm border border-gray-100 text-center">
                    <HandHeart className="w-16 h-16 text-primary mx-auto mb-4 opacity-50" />
                    <h3 className="text-xl font-bold text-gray-800 mb-2">Riwayat Penyaluran Zakat</h3>
                    <p className="text-gray-500 max-w-md mx-auto mb-6">Fitur ini akan mencatat kapan dan apa saja (uang/beras) yang telah diberikan kepada setiap Mustahik.</p>
                    <button onClick={() => setActiveTab('mustahik')} className="bg-gray-100 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-200 transition font-medium">
                        Kembali ke Data Warga
                    </button>
                </div>
            )}

            {/* MODAL: TAMBAH MUSTAHIK */}
            {isMustahikModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="flex justify-between items-center p-4 border-b bg-gray-50">
                            <h3 className="font-bold text-lg text-gray-800">Registrasi Mustahik Baru</h3>
                            <button onClick={() => setIsMustahikModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        
                        <div className="p-6 overflow-y-auto">
                            <form id="mustahikForm" onSubmit={handleSubmitMustahik} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap <span className="text-red-500">*</span></label>
                                    <input type="text" name="nama_lengkap" value={formData.nama_lengkap} onChange={handleInputChange} required placeholder="Contoh: Bpk. Supardi" className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-primary focus:border-primary outline-none text-sm transition" />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Nomor Induk Kependudukan (NIK)</label>
                                    <input type="number" name="nik" value={formData.nik} onChange={handleInputChange} placeholder="16 digit angka KTP (Opsional)" className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-primary focus:border-primary outline-none text-sm transition" />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Kategori (8 Asnaf) <span className="text-red-500">*</span></label>
                                        <select name="kategori" value={formData.kategori} onChange={handleInputChange} className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-primary focus:border-primary outline-none text-sm transition bg-white">
                                            {kategoriZakat.map(kat => (
                                                <option key={kat.id} value={kat.id}>{kat.label}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Domisili RT <span className="text-red-500">*</span></label>
                                        <select name="rt" value={formData.rt} onChange={handleInputChange} className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-primary focus:border-primary outline-none text-sm transition bg-white">
                                            <option value="10">RT 10</option>
                                            <option value="11">RT 11</option>
                                            <option value="12">RT 12</option>
                                            <option value="Luar">Luar Desa</option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Alamat Lengkap <span className="text-red-500">*</span></label>
                                    <textarea name="alamat" value={formData.alamat} onChange={handleInputChange} required rows="3" placeholder="Contoh: Samping pos kamling RT 10, rumah cat hijau..." className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-primary focus:border-primary outline-none text-sm transition"></textarea>
                                </div>
                            </form>
                        </div>

                        <div className="p-4 border-t bg-gray-50 flex gap-3 justify-end">
                            <button type="button" onClick={() => setIsMustahikModalOpen(false)} className="px-5 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium text-sm">Batal</button>
                            <button type="submit" form="mustahikForm" disabled={submitLoading} className="px-5 py-2.5 bg-primary text-white rounded-lg hover:bg-secondary transition font-medium text-sm flex items-center disabled:opacity-50">
                                {submitLoading ? 'Menyimpan...' : 'Simpan Data Warga'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}