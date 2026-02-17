// src/pages/Inventaris.jsx
import { useState, useEffect } from 'react';
import { Package, Plus, Search, Edit, Trash2, X, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import api from '../api/axios';

export default function Inventaris() {
    const [inventarisList, setInventarisList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    // State Modal & Form
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [submitLoading, setSubmitLoading] = useState(false);
    const [editId, setEditId] = useState(null); // Jika null berarti 'Tambah', jika ada ID berarti 'Edit'
    
    const [formData, setFormData] = useState({
        kode_barang: '',
        nama_barang: '',
        jumlah: 1,
        kondisi: 'baik',
        lokasi_penyimpanan: '',
        keterangan: ''
    });

    useEffect(() => {
        fetchInventaris();
    }, []);

    const fetchInventaris = async () => {
        setLoading(true);
        try {
            const response = await api.get('/inventaris'); 
            // Jika backend mengirim array langsung, gunakan response.data
            // Jika dibungkus pagination/resource, gunakan response.data.data
            const data = response.data.data || response.data; 
            setInventarisList(data);
        } catch (error) {
            console.error("Gagal mengambil data inventaris", error);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // Fungsi Buka Modal untuk Tambah
    const handleAdd = () => {
        setEditId(null);
        setFormData({ kode_barang: '', nama_barang: '', jumlah: 1, kondisi: 'baik', lokasi_penyimpanan: '', keterangan: '' });
        setIsModalOpen(true);
    };

    // Fungsi Buka Modal untuk Edit
    const handleEdit = (barang) => {
        setEditId(barang.id);
        setFormData({
            kode_barang: barang.kode_barang,
            nama_barang: barang.nama_barang,
            jumlah: barang.jumlah,
            kondisi: barang.kondisi,
            lokasi_penyimpanan: barang.lokasi_penyimpanan,
            keterangan: barang.keterangan || ''
        });
        setIsModalOpen(true);
    };

    // Fungsi Hapus Barang
    const handleDelete = async (id, nama) => {
        if (!window.confirm(`Yakin ingin menghapus ${nama} dari sistem?`)) return;

        try {
            await api.delete(`/inventaris/${id}`);
            fetchInventaris();
            alert("Barang berhasil dihapus!");
        } catch (error) {
            console.error(error);
            alert("Gagal menghapus barang.");
        }
    };

    // Submit Data (Tambah atau Update)
    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitLoading(true);

        try {
            if (editId) {
                // Mode Edit (PUT)
                await api.put(`/inventaris/${editId}`, formData);
                alert("Data barang berhasil diperbarui!");
            } else {
                // Mode Tambah Baru (POST)
                await api.post('/inventaris', formData);
                alert("Barang baru berhasil ditambahkan!");
            }
            
            setIsModalOpen(false);
            fetchInventaris();
        } catch (error) {
            console.error(error);
            alert(error.response?.data?.message || "Terjadi kesalahan saat menyimpan data.");
        } finally {
            setSubmitLoading(false);
        }
    };

    // Filter Pencarian
    const filteredInventaris = inventarisList.filter(b => 
        b.nama_barang.toLowerCase().includes(searchQuery.toLowerCase()) || 
        b.kode_barang.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Utility: Badge Kondisi
    const getKondisiBadge = (kondisi) => {
        switch (kondisi) {
            case 'baik':
                return <span className="flex items-center justify-center text-green-700 bg-green-100 px-2 py-1 rounded-md text-xs font-semibold"><CheckCircle className="w-3 h-3 mr-1"/> Baik</span>;
            case 'rusak_ringan':
                return <span className="flex items-center justify-center text-yellow-700 bg-yellow-100 px-2 py-1 rounded-md text-xs font-semibold"><AlertTriangle className="w-3 h-3 mr-1"/> Rusak Ringan</span>;
            case 'rusak_berat':
                return <span className="flex items-center justify-center text-red-700 bg-red-100 px-2 py-1 rounded-md text-xs font-semibold"><XCircle className="w-3 h-3 mr-1"/> Rusak Berat</span>;
            default:
                return null;
        }
    };

    return (
        <div>
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Inventaris Masjid</h1>
                    <p className="text-sm text-gray-500">Pendataan aset, fasilitas, dan barang operasional.</p>
                </div>
                <button 
                    onClick={handleAdd}
                    className="bg-primary hover:bg-secondary text-white px-4 py-2 rounded-lg flex items-center shadow-sm transition whitespace-nowrap font-medium text-sm"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Tambah Barang
                </button>
            </div>

            {/* Tabel Inventaris */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-4 border-b border-gray-100">
                    <div className="relative w-full sm:w-72">
                        <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
                        <input 
                            type="text" 
                            placeholder="Cari kode atau nama barang..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 border rounded-lg text-sm focus:ring-1 focus:ring-primary outline-none" 
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-600">
                        <thead className="bg-gray-50 text-gray-700 uppercase font-medium text-xs">
                            <tr>
                                <th className="px-6 py-3">Kode</th>
                                <th className="px-6 py-3">Nama Barang</th>
                                <th className="px-6 py-3 text-center">Jumlah</th>
                                <th className="px-6 py-3 text-center">Kondisi</th>
                                <th className="px-6 py-3">Lokasi</th>
                                <th className="px-6 py-3 text-center">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr><td colSpan="6" className="px-6 py-10 text-center text-gray-500">Memuat data inventaris...</td></tr>
                            ) : filteredInventaris.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-10 text-center text-gray-500">
                                        <Package className="w-10 h-10 mx-auto text-gray-300 mb-2" />
                                        Belum ada barang yang didata.
                                    </td>
                                </tr>
                            ) : (
                                filteredInventaris.map((barang) => (
                                    <tr key={barang.id} className="hover:bg-gray-50 transition">
                                        <td className="px-6 py-4 font-mono text-xs font-bold text-gray-500">{barang.kode_barang}</td>
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-gray-800">{barang.nama_barang}</div>
                                            {barang.keterangan && <div className="text-xs text-gray-500 truncate max-w-xs">{barang.keterangan}</div>}
                                        </td>
                                        <td className="px-6 py-4 text-center font-bold text-gray-700">{barang.jumlah}</td>
                                        <td className="px-6 py-4 text-center">
                                            {getKondisiBadge(barang.kondisi)}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">{barang.lokasi_penyimpanan}</td>
                                        <td className="px-6 py-4 text-center">
                                            <div className="flex justify-center space-x-2">
                                                <button onClick={() => handleEdit(barang)} className="p-1.5 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition" title="Edit">
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                <button onClick={() => handleDelete(barang.id, barang.nama_barang)} className="p-1.5 bg-red-50 text-red-600 rounded hover:bg-red-100 transition" title="Hapus">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* MODAL FORM (Dipakai untuk Tambah & Edit) */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="flex justify-between items-center p-4 border-b bg-gray-50">
                            <h3 className="font-bold text-lg text-gray-800">
                                {editId ? 'Edit Data Barang' : 'Tambah Barang Baru'}
                            </h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        
                        <div className="p-6 overflow-y-auto">
                            <form id="inventarisForm" onSubmit={handleSubmit} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Kode Barang <span className="text-red-500">*</span></label>
                                        <input type="text" name="kode_barang" value={formData.kode_barang} onChange={handleInputChange} required placeholder="Contoh: SND-001" className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-primary focus:border-primary outline-none text-sm uppercase font-mono" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Jumlah <span className="text-red-500">*</span></label>
                                        <input type="number" name="jumlah" value={formData.jumlah} onChange={handleInputChange} required min="1" className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-primary focus:border-primary outline-none text-sm" />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Nama Barang <span className="text-red-500">*</span></label>
                                    <input type="text" name="nama_barang" value={formData.nama_barang} onChange={handleInputChange} required placeholder="Contoh: Mic Wireless Shure" className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-primary focus:border-primary outline-none text-sm" />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Kondisi <span className="text-red-500">*</span></label>
                                        <select name="kondisi" value={formData.kondisi} onChange={handleInputChange} className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-primary focus:border-primary outline-none text-sm bg-white">
                                            <option value="baik">Baik</option>
                                            <option value="rusak_ringan">Rusak Ringan</option>
                                            <option value="rusak_berat">Rusak Berat</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Lokasi <span className="text-red-500">*</span></label>
                                        <input type="text" name="lokasi_penyimpanan" value={formData.lokasi_penyimpanan} onChange={handleInputChange} required placeholder="Contoh: Gudang Kiri" className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-primary focus:border-primary outline-none text-sm" />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Keterangan Tambahan</label>
                                    <textarea name="keterangan" value={formData.keterangan} onChange={handleInputChange} rows="2" placeholder="Catatan opsional..." className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-primary focus:border-primary outline-none text-sm"></textarea>
                                </div>
                            </form>
                        </div>

                        <div className="p-4 border-t bg-gray-50 flex gap-3 justify-end">
                            <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium text-sm">Batal</button>
                            <button type="submit" form="inventarisForm" disabled={submitLoading} className="px-5 py-2.5 bg-primary text-white rounded-lg hover:bg-secondary transition font-medium text-sm flex items-center disabled:opacity-50">
                                {submitLoading ? 'Menyimpan...' : (editId ? 'Simpan Perubahan' : 'Tambah Barang')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}