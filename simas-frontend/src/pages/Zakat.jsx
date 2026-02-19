// src/pages/Zakat.jsx
import { useState, useEffect, useCallback } from 'react';
import { Users, Plus, Search, MapPin, HandHeart, History, X, CheckCircle, Camera, FileText, Calendar, ArrowUpDown, Edit, Trash2 } from 'lucide-react';
import api from '../api/axios';
import imageCompression from 'browser-image-compression';

export default function Zakat() {
    const user = JSON.parse(localStorage.getItem('user'));
    
    // State Navigasi Tab
    const [activeTab, setActiveTab] = useState(user.role === 'remaja' ? 'riwayat' : 'mustahik'); 
    
    // State Data Master
    const [mustahikList, setMustahikList] = useState([]);
    const [penyaluranList, setPenyaluranList] = useState([]);
    const [summary, setSummary] = useState({ total_fitrah: 0, total_mal: 0, total_mustahik_menerima: 0 });
    const [loading, setLoading] = useState(true);
    const [tahunAudit, setTahunAudit] = useState(new Date().getFullYear());
    const [isExporting, setIsExporting] = useState(false);
    const [compressingText, setCompressingText] = useState('');
    const [submitLoading, setSubmitLoading] = useState(false);

    // State Filter & Sort
    const [searchMustahik, setSearchMustahik] = useState('');
    const [sortMustahik, setSortMustahik] = useState('nama_asc'); 
    const [searchPenyaluran, setSearchPenyaluran] = useState('');
    const [sortPenyaluran, setSortPenyaluran] = useState('nama_asc');

    // State Modal
    const [isMustahikModalOpen, setIsMustahikModalOpen] = useState(false);
    const [isBagiModalOpen, setIsBagiModalOpen] = useState(false);
    const [isKonfirmasiModalOpen, setIsKonfirmasiModalOpen] = useState(false);
    const [selectedPenyaluranId, setSelectedPenyaluranId] = useState(null);

    // State FITUR MASSAL ZAKAT (Baru)
    const [selectedIds, setSelectedIds] = useState([]);
    const [isMassEditModalOpen, setIsMassEditModalOpen] = useState(false);

    // State Khusus Tab Mustahik
    const [selectedMustahikIds, setSelectedMustahikIds] = useState([]);
    const [editMustahikId, setEditMustahikId] = useState(null);

    // Forms
    const [formMustahik, setFormMustahik] = useState({ nama_lengkap: '', nik: '', rt: '10', alamat: '', kategori: 'fakir' });
    const [formBagi, setFormBagi] = useState({ mustahik_ids: [], jenis_zakat: 'fitrah', bentuk_barang: '', nominal_uang: '' });
    const [formKonfirmasi, setFormKonfirmasi] = useState({ foto_dokumentasi: null });
    const [massEditForm, setMassEditForm] = useState({ status: '', jenis_zakat: '', bentuk_barang: '', nominal_uang: '' });

    const kategoriZakat = [
        { id: 'fakir', label: 'Fakir (Sangat miskin)' },
        { id: 'miskin', label: 'Miskin (Penghasilan kurang)' },
        { id: 'mualaf', label: 'Mualaf (Baru masuk Islam)' },
        { id: 'fisabilillah', label: 'Fisabilillah (Pejuang jalan Allah)' },
        { id: 'ibnu_sabil', label: 'Ibnu Sabil (Musafir)' },
        { id: 'gharim', label: 'Gharim (Terlilit hutang)' },
        { id: 'riqab', label: 'Riqab (Memerdekakan budak)' },
        { id: 'amil', label: 'Amil (Panitia zakat)' }
    ];

    // --- FUNGSI FETCH API (Memakai useCallback) ---
    const fetchMustahik = useCallback(async () => {
        setLoading(true);
        try { const res = await api.get('/mustahik'); setMustahikList(res.data.data); } 
        catch (err) { console.error(err); } finally { setLoading(false); }
    }, []);

    const fetchPenyaluran = useCallback(async () => {
        setLoading(true);
        try { 
            const res = await api.get('/penyaluran-zakat'); 
            setPenyaluranList(res.data.data); 
            setSelectedIds([]); // Kosongkan seleksi massal jika data diperbarui
        } catch (err) { console.error(err); } finally { setLoading(false); }
    }, []);

    const fetchSummary = useCallback(async () => {
        try { const res = await api.get(`/zakat/summary?tahun=${tahunAudit}`); setSummary(res.data.data); } 
        catch (err) { console.error(err); }
    }, [tahunAudit]);

    useEffect(() => {
        if (activeTab === 'mustahik' && user.role !== 'remaja') fetchMustahik();
        if (activeTab === 'riwayat') fetchPenyaluran();
        if (activeTab === 'audit' && user.role !== 'remaja') fetchSummary();
    }, [activeTab, user.role, fetchMustahik, fetchPenyaluran, fetchSummary]);

    // --- LOGIKA FILTER & SORTING ---
    const processedMustahik = mustahikList
        .filter(m => m.nama_lengkap.toLowerCase().includes(searchMustahik.toLowerCase()) || m.rt.includes(searchMustahik))
        .sort((a, b) => {
            if (sortMustahik === 'nama_asc') return a.nama_lengkap.localeCompare(b.nama_lengkap);
            if (sortMustahik === 'nama_desc') return b.nama_lengkap.localeCompare(a.nama_lengkap);
            if (sortMustahik === 'rt_asc') return a.rt.localeCompare(b.rt, undefined, {numeric: true});
            if (sortMustahik === 'rt_desc') return b.rt.localeCompare(a.rt, undefined, {numeric: true});
            return 0;
        });

    const processedPenyaluran = penyaluranList
        .filter(p => (p.mustahik?.nama_lengkap || '').toLowerCase().includes(searchPenyaluran.toLowerCase()) || (p.mustahik?.rt || '').includes(searchPenyaluran))
        .sort((a, b) => {
            const namaA = a.mustahik?.nama_lengkap || ''; const namaB = b.mustahik?.nama_lengkap || '';
            const rtA = a.mustahik?.rt || ''; const rtB = b.mustahik?.rt || '';
            if (sortPenyaluran === 'nama_asc') return namaA.localeCompare(namaB);
            if (sortPenyaluran === 'nama_desc') return namaB.localeCompare(namaA);
            if (sortPenyaluran === 'rt_asc') return rtA.localeCompare(rtB, undefined, {numeric: true});
            if (sortPenyaluran === 'rt_desc') return rtB.localeCompare(rtA, undefined, {numeric: true});
            return 0;
        });

    const sortedMustahikForModal = [...mustahikList].sort((a, b) => a.nama_lengkap.localeCompare(b.nama_lengkap));

    // --- LOGIKA AKSI MASSAL (MASS EDIT & DELETE) ---
    const handleSelectAllPenyaluran = (e) => {
        if (e.target.checked) setSelectedIds(processedPenyaluran.map(p => p.id));
        else setSelectedIds([]);
    };

    const handleSelectOnePenyaluran = (id) => {
        setSelectedIds(prev => prev.includes(id) ? prev.filter(itemId => itemId !== id) : [...prev, id]);
    };

    const handleMassDeletePenyaluran = async () => {
        if (!window.confirm(`Yakin menghapus ${selectedIds.length} data penyaluran secara permanen?`)) return;
        try {
            await api.post('/penyaluran-zakat/mass-destroy', { ids: selectedIds });
            fetchPenyaluran(); alert('Data berhasil dihapus');
        } catch (err) { console.log(err);alert('Gagal menghapus'); }
    };

    const submitMassEdit = async (e) => {
        e.preventDefault();
        setSubmitLoading(true);
        try {
            await api.post('/penyaluran-zakat/mass-update', { ids: selectedIds, ...massEditForm });
            setIsMassEditModalOpen(false); 
            fetchPenyaluran();
            alert('Pembaruan massal berhasil diterapkan!');
        } catch (err) { 
            console.log(err);
            alert('Gagal melakukan update massal'); 
        } finally { 
            setSubmitLoading(false); 
        }
    };

    // Aksi Single Khusus Developer
    const handleDeleteSinglePenyaluran = async (id) => {
        if (!window.confirm("Yakin menghapus riwayat penyaluran ini?")) return;
        try {
            await api.delete(`/penyaluran-zakat/${id}`);
            fetchPenyaluran();
        } catch (error) { console.log(error);alert("Gagal menghapus"); }
    };

    // --- FUNGSI SUBMIT FORM UTAMA ---
    const handleSubmitMustahik = async (e) => {
        e.preventDefault();
        setSubmitLoading(true);
        try {
            if (editMustahikId) {
                // Proses Edit (PUT)
                await api.put(`/mustahik/${editMustahikId}`, formMustahik);
                alert("Data Mustahik berhasil diperbarui!");
            } else {
                // Proses Tambah Baru (POST)
                await api.post('/mustahik', formMustahik);
                alert("Data Mustahik berhasil ditambahkan!");
            }
            setIsMustahikModalOpen(false);
            setFormMustahik({ nama_lengkap: '', nik: '', rt: '10', alamat: '', kategori: 'fakir' });
            setEditMustahikId(null);
            fetchMustahik();
        } catch (error) {
            alert(error.response?.data?.message || "Terjadi kesalahan saat menyimpan data.");
        } finally {
            setSubmitLoading(false);
        }
    };
    // --- LOGIKA MUSTAHIK (EDIT, DELETE, MASS DELETE) ---
    const handleAddMustahik = () => {
        setEditMustahikId(null);
        setFormMustahik({ nama_lengkap: '', nik: '', rt: '10', alamat: '', kategori: 'fakir' });
        setIsMustahikModalOpen(true);
    };

    const handleEditMustahik = (item) => {
        setEditMustahikId(item.id);
        setFormMustahik({
            nama_lengkap: item.nama_lengkap, nik: item.nik || '', rt: item.rt, alamat: item.alamat, kategori: item.kategori
        });
        setIsMustahikModalOpen(true);
    };

    const handleDeleteMustahik = async (id) => {
        if (!window.confirm("Yakin ingin menghapus data warga ini? Data penyalurannya mungkin akan terpengaruh.")) return;
        try {
            await api.delete(`/mustahik/${id}`);
            fetchMustahik(); alert("Warga berhasil dihapus!");
        } catch (err) { console.log(err);alert("Gagal menghapus warga."); }
    };
    const handleSelectAllMustahikForBagi = (e) => {
        if (e.target.checked) setFormBagi(prev => ({ ...prev, mustahik_ids: sortedMustahikForModal.map(m => m.id) }));
        else setFormBagi(prev => ({ ...prev, mustahik_ids: [] }));
    };

    const handleSelectAllMustahik = (e) => {
        if (e.target.checked) setSelectedMustahikIds(processedMustahik.map(m => m.id));
        else setSelectedMustahikIds([]);
    };

    const handleSelectOneMustahik = (id) => {
        setSelectedMustahikIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    };

    const handleMassDeleteMustahik = async () => {
        if (!window.confirm(`Yakin menghapus ${selectedMustahikIds.length} data warga sekaligus?`)) return;
        try {
            await api.post('/mustahik/mass-destroy', { ids: selectedMustahikIds });
            setSelectedMustahikIds([]); fetchMustahik(); alert("Data massal berhasil dihapus!");
        } catch (err) { console.log(err);alert("Gagal menghapus massal."); }
    };

    const submitBagiZakat = async (e) => {
        e.preventDefault();
        if (formBagi.mustahik_ids.length === 0) { alert("Pilih minimal 1 warga terlebih dahulu!"); return; }
        setSubmitLoading(true);
        try {
            await Promise.all(formBagi.mustahik_ids.map(id => 
                api.post('/penyaluran-zakat', {
                    mustahik_id: id, jenis_zakat: formBagi.jenis_zakat, bentuk_barang: formBagi.bentuk_barang, nominal_uang: formBagi.nominal_uang
                })
            ));
            setIsBagiModalOpen(false); 
            setFormBagi({ mustahik_ids: [], jenis_zakat: 'fitrah', bentuk_barang: '', nominal_uang: '' });
            fetchPenyaluran(); alert(`Berhasil merencanakan penyaluran untuk ${formBagi.mustahik_ids.length} warga!`);
        } catch (err) { console.log(err);alert("Gagal merencanakan penyaluran massal"); } finally { setSubmitLoading(false); }
    };

    const submitKonfirmasi = async (e) => {
        e.preventDefault();
        if (!formKonfirmasi.foto_dokumentasi) { alert("Mohon pilih foto terlebih dahulu!"); return; }
        setSubmitLoading(true); setCompressingText('Mengompres foto...'); 
        try {
            const compressedFile = await imageCompression(formKonfirmasi.foto_dokumentasi, {
                maxSizeMB: 0.5, maxWidthOrHeight: 1024, useWebWorker: true, fileType: 'image/jpeg'
            });
            setCompressingText('Mengunggah ke server...');
            const data = new FormData();
            data.append('foto_dokumentasi', compressedFile, compressedFile.name);
            await api.post(`/penyaluran-zakat/${selectedPenyaluranId}/konfirmasi`, data, { headers: { 'Content-Type': 'multipart/form-data' } });
            
            setIsKonfirmasiModalOpen(false); setFormKonfirmasi({ foto_dokumentasi: null });
            fetchPenyaluran(); alert("Penyaluran Dikonfirmasi!");
        } catch (err) { console.log(err);alert("Gagal mengompres/mengunggah"); } finally { setSubmitLoading(false); setCompressingText(''); }
    };

    const handleExportPdf = async () => {
        setIsExporting(true);
        try {
            const res = await api.get(`/zakat/export-pdf?tahun=${tahunAudit}`, { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement('a'); link.href = url; link.setAttribute('download', `Audit_Zakat_${tahunAudit}.pdf`);
            document.body.appendChild(link); link.click(); link.parentNode.removeChild(link);
        } catch (err) { console.log(err);alert("Gagal membuat PDF"); } finally { setIsExporting(false); }
    };

    const formatRupiah = (angka) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(angka || 0);

    return (
        <div>
            {/* Header Section */}
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Manajemen Penyaluran Zakat</h1>
                <p className="text-sm text-gray-500">
                    {user.role === 'remaja' 
                        ? "Tugas Relawan: Konfirmasi pengiriman zakat kepada warga berserta foto." 
                        : "Kelola data warga, bagikan zakat secara massal, dan cetak audit tahunan."}
                </p>
            </div>

            {/* Navigasi Tabs */}
            <div className="flex border-b border-gray-200 mb-6 overflow-x-auto">
                {user.role !== 'remaja' && (
                    <button onClick={() => setActiveTab('mustahik')} className={`flex items-center pb-3 px-4 font-medium text-sm transition whitespace-nowrap ${activeTab === 'mustahik' ? 'border-b-2 border-primary text-primary' : 'text-gray-500 hover:text-gray-700'}`}>
                        <Users className="w-4 h-4 mr-2" /> Data Warga (Mustahik)
                    </button>
                )}
                <button onClick={() => setActiveTab('riwayat')} className={`flex items-center pb-3 px-4 font-medium text-sm transition whitespace-nowrap ${activeTab === 'riwayat' ? 'border-b-2 border-primary text-primary' : 'text-gray-500 hover:text-gray-700'}`}>
                    <HandHeart className="w-4 h-4 mr-2" /> Penyaluran & Konfirmasi
                </button>
                {user.role !== 'remaja' && (
                    <button onClick={() => setActiveTab('audit')} className={`flex items-center pb-3 px-4 font-medium text-sm transition whitespace-nowrap ${activeTab === 'audit' ? 'border-b-2 border-primary text-primary' : 'text-gray-500 hover:text-gray-700'}`}>
                        <FileText className="w-4 h-4 mr-2" /> Laporan & Audit
                    </button>
                )}
            </div>

            {/* TAB 1: MUSTAHIK */}
{/* TAB 1: MUSTAHIK */}
{activeTab === 'mustahik' && user.role !== 'remaja' && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-4 border-b border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gray-50/50">
                        <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
                            <div className="relative w-full sm:w-64">
                                <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
                                <input type="text" placeholder="Cari nama warga atau RT..." value={searchMustahik} onChange={(e) => setSearchMustahik(e.target.value)} className="w-full pl-9 pr-4 py-2 border rounded-lg text-sm focus:ring-1 focus:ring-primary outline-none bg-white" />
                            </div>
                            <div className="relative w-full sm:w-48">
                                <ArrowUpDown className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
                                <select value={sortMustahik} onChange={(e) => setSortMustahik(e.target.value)} className="w-full pl-9 pr-4 py-2 border rounded-lg text-sm focus:ring-1 focus:ring-primary outline-none bg-white appearance-none cursor-pointer">
                                    <option value="nama_asc">Urut Nama (A-Z)</option>
                                    <option value="nama_desc">Urut Nama (Z-A)</option>
                                    <option value="rt_asc">Urut RT (Terkecil)</option>
                                    <option value="rt_desc">Urut RT (Terbesar)</option>
                                </select>
                            </div>
                        </div>
                        {/* Tombol panggil handleAddMustahik */}
                        <button onClick={handleAddMustahik} className="w-full md:w-auto bg-primary hover:bg-secondary text-white px-4 py-2 rounded-lg flex items-center justify-center text-sm font-medium shadow-sm transition">
                            <Plus className="w-4 h-4 mr-2" /> Tambah Warga
                        </button>
                    </div>

                    {/* PANEL AKSI MASSAL MUSTAHIK */}
                    {processedMustahik.length > 0 && (
                        <div className="flex flex-col sm:flex-row justify-between items-center bg-blue-50/50 p-3 mx-4 mt-4 rounded-lg border border-blue-100 gap-3">
                            <label className="flex items-center cursor-pointer select-none">
                                <input type="checkbox" checked={selectedMustahikIds.length === processedMustahik.length && processedMustahik.length > 0} onChange={handleSelectAllMustahik} className="w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary mr-3 cursor-pointer" />
                                <span className="font-bold text-sm text-blue-800">Pilih Semua ({processedMustahik.length})</span>
                            </label>
                            {selectedMustahikIds.length > 0 && user.role === 'developer' && (
                                <button onClick={handleMassDeleteMustahik} className="bg-red-100 text-red-600 hover:bg-red-500 hover:text-white px-4 py-1.5 rounded-lg text-sm font-bold transition flex items-center shadow-sm">
                                    <Trash2 className="w-4 h-4 mr-1.5" /> Hapus {selectedMustahikIds.length} Warga
                                </button>
                            )}
                        </div>
                    )}

                    <div className="overflow-x-auto p-4">
                        <table className="w-full text-sm text-left text-gray-600">
                            <thead className="bg-gray-50 text-gray-700 uppercase font-medium text-xs">
                                <tr>
                                    <th className="px-4 py-3 w-10">#</th>
                                    <th className="px-6 py-3">Nama Lengkap / NIK</th>
                                    <th className="px-6 py-3">Kategori</th>
                                    <th className="px-6 py-3">RT & Alamat</th>
                                    <th className="px-6 py-3 text-center">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {loading ? <tr><td colSpan="5" className="px-6 py-10 text-center text-gray-500">Memuat...</td></tr> : 
                                 processedMustahik.length === 0 ? <tr><td colSpan="5" className="px-6 py-10 text-center text-gray-500">Pencarian tidak ditemukan.</td></tr> :
                                 processedMustahik.map((person) => {
                                    const isSelected = selectedMustahikIds.includes(person.id);
                                    return (
                                    <tr key={person.id} className={isSelected ? 'bg-green-50/40 transition' : 'hover:bg-gray-50 transition'}>
                                        <td className="px-4 py-4 text-center">
                                            <input type="checkbox" checked={isSelected} onChange={() => handleSelectOneMustahik(person.id)} className="w-4 h-4 text-primary rounded cursor-pointer" />
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-gray-800">{person.nama_lengkap}</div>
                                            <div className="text-[10px] text-gray-500">{person.nik || 'Tidak ada NIK'}</div>
                                        </td>
                                        <td className="px-6 py-4 capitalize">
                                            <span className="bg-blue-50 text-blue-700 px-2.5 py-1 rounded-md text-xs font-semibold border border-blue-100">{person.kategori.replace('_', ' ')}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="font-bold mr-2 text-primary">RT {person.rt}</span> 
                                            <span className="text-gray-500 text-xs">{person.alamat}</span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <div className="flex justify-center gap-2">
                                                <button onClick={() => handleEditMustahik(person)} className="p-1.5 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition" title="Edit">
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                {user.role === 'developer' && (
                                                    <button onClick={() => handleDeleteMustahik(person.id)} className="p-1.5 bg-red-50 text-red-600 rounded hover:bg-red-100 transition" title="Hapus">
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                )})}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* TAB 2: PENYALURAN & KONFIRMASI (TERMASUK MASS EDIT & DELETE) */}
            {activeTab === 'riwayat' && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-4 flex flex-col md:flex-row justify-between items-start md:items-center border-b border-gray-100 bg-gray-50/50 gap-4">
                        <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
                            <div className="relative w-full sm:w-64">
                                <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
                                <input type="text" placeholder="Cari warga penerima..." value={searchPenyaluran} onChange={(e) => setSearchPenyaluran(e.target.value)} className="w-full pl-9 pr-4 py-2 border rounded-lg text-sm focus:ring-1 focus:ring-primary outline-none bg-white" />
                            </div>
                            <div className="relative w-full sm:w-48">
                                <ArrowUpDown className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
                                <select value={sortPenyaluran} onChange={(e) => setSortPenyaluran(e.target.value)} className="w-full pl-9 pr-4 py-2 border rounded-lg text-sm focus:ring-1 focus:ring-primary outline-none bg-white cursor-pointer">
                                    <option value="nama_asc">Urut Nama (A-Z)</option>
                                    <option value="nama_desc">Urut Nama (Z-A)</option>
                                    <option value="rt_asc">Urut RT (Terkecil)</option>
                                    <option value="rt_desc">Urut RT (Terbesar)</option>
                                </select>
                            </div>
                        </div>
                        {user.role !== 'remaja' && (
                            <button onClick={() => { fetchMustahik(); setIsBagiModalOpen(true); }} className="w-full md:w-auto bg-primary hover:bg-secondary text-white px-4 py-2 rounded-lg flex items-center justify-center text-sm font-medium transition shadow-sm">
                                <HandHeart className="w-4 h-4 mr-1"/> Rencana Bagikan Massal
                            </button>
                        )}
                    </div>

                    {/* PANEL AKSI MASSAL (KHUSUS PANITIA & DEVELOPER) */}
                    {processedPenyaluran.length > 0 && user.role !== 'remaja' && (
                        <div className="flex flex-col sm:flex-row justify-between items-center bg-blue-50/50 p-3 mx-4 mt-4 rounded-lg border border-blue-100 gap-3">
                            <label className="flex items-center cursor-pointer select-none">
                                <input 
                                    type="checkbox" 
                                    checked={selectedIds.length === processedPenyaluran.length && processedPenyaluran.length > 0} 
                                    onChange={handleSelectAllPenyaluran} 
                                    className="w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary mr-3 cursor-pointer" 
                                />
                                <span className="font-bold text-sm text-blue-800">Pilih Semua ({processedPenyaluran.length})</span>
                            </label>

                            {selectedIds.length > 0 && (
                                <div className="flex gap-2">
                                    <button onClick={() => setIsMassEditModalOpen(true)} className="bg-blue-100 text-blue-700 hover:bg-blue-600 hover:text-white px-4 py-1.5 rounded-lg text-sm font-bold transition flex items-center shadow-sm">
                                        <Edit className="w-4 h-4 mr-1.5" /> Edit {selectedIds.length} Data
                                    </button>
                                    {user.role === 'developer' && (
                                        <button onClick={handleMassDeletePenyaluran} className="bg-red-100 text-red-600 hover:bg-red-500 hover:text-white px-4 py-1.5 rounded-lg text-sm font-bold transition flex items-center shadow-sm">
                                            <Trash2 className="w-4 h-4 mr-1.5" /> Hapus {selectedIds.length}
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    <div className="overflow-x-auto p-4">
                        <table className="w-full text-sm text-left text-gray-600">
                            <thead className="bg-gray-50 text-gray-700 uppercase font-medium text-xs">
                                <tr>
                                    {user.role !== 'remaja' && <th className="px-4 py-3 w-10">#</th>}
                                    <th className="px-6 py-3">Mustahik & Lokasi</th>
                                    <th className="px-6 py-3">Jenis Zakat</th>
                                    <th className="px-6 py-3">Bentuk & Nominal</th>
                                    <th className="px-6 py-3 text-center">Status</th>
                                    <th className="px-6 py-3 text-center">Tindakan</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {loading ? <tr><td colSpan="6" className="text-center py-10">Memuat...</td></tr> : 
                                 processedPenyaluran.length === 0 ? <tr><td colSpan="6" className="text-center py-10">Tidak ditemukan.</td></tr> :
                                 processedPenyaluran.map(p => {
                                    const isSelected = selectedIds.includes(p.id);
                                    return (
                                        <tr key={p.id} className={isSelected ? 'bg-green-50/40' : 'hover:bg-gray-50 transition'}>
                                            {user.role !== 'remaja' && (
                                                <td className="px-4 py-4 text-center">
                                                    <input 
                                                        type="checkbox" 
                                                        checked={isSelected} 
                                                        onChange={() => handleSelectOnePenyaluran(p.id)} 
                                                        className="w-4 h-4 text-primary rounded cursor-pointer" 
                                                    />
                                                </td>
                                            )}
                                            <td className="px-6 py-4">
                                                <div className="font-bold text-gray-800 text-base">{p.mustahik?.nama_lengkap}</div>
                                                <div className="text-xs text-gray-500 mt-1 flex items-center"><MapPin className="w-3 h-3 mr-1 text-red-400"/> RT {p.mustahik?.rt} - {p.mustahik?.alamat}</div>
                                            </td>
                                            <td className="px-6 py-4"><span className={`px-2.5 py-1 rounded text-xs font-bold capitalize ${p.jenis_zakat === 'fitrah' ? 'bg-indigo-100 text-indigo-700' : 'bg-purple-100 text-purple-700'}`}>Zakat {p.jenis_zakat}</span></td>
                                            <td className="px-6 py-4 font-medium text-gray-700">{p.bentuk_barang ? p.bentuk_barang : formatRupiah(p.nominal_uang)}</td>
                                            <td className="px-6 py-4 text-center">
                                                {p.status === 'disalurkan' ? <span className="inline-flex items-center text-green-700 bg-green-100 px-2 py-1 rounded text-xs font-bold"><CheckCircle className="w-3 h-3 mr-1"/> Selesai</span> : <span className="inline-flex items-center text-orange-700 bg-orange-100 px-2 py-1 rounded text-xs font-bold animate-pulse"><History className="w-3 h-3 mr-1"/> Menunggu</span>}
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <div className="flex flex-col items-center justify-center gap-2">
                                                    {p.status === 'menunggu' ? (
                                                        <button onClick={() => { setSelectedPenyaluranId(p.id); setIsKonfirmasiModalOpen(true); }} className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow flex items-center transition"><Camera className="w-3 h-3 mr-1"/> Konfirmasi</button>
                                                    ) : (
                                                        p.foto_dokumentasi && <a href={`http://localhost:8000/storage/${p.foto_dokumentasi}`} target="_blank" rel="noreferrer" className="text-xs text-blue-600 hover:underline font-medium inline-flex items-center"><FileText className="w-4 h-4 mr-1"/> Bukti</a>
                                                    )}
                                                    {user.role === 'developer' && (
                                                        <button onClick={() => handleDeleteSinglePenyaluran(p.id)} className="text-red-500 hover:text-red-700 text-xs flex items-center transition"><Trash2 className="w-3 h-3 mr-1"/> Hapus</button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* TAB 3: AUDIT ZAKAT */}
            {activeTab === 'audit' && user.role !== 'remaja' && (
                <div>
                    <div className="flex justify-between items-center mb-6">
                        <div className="flex items-center bg-white px-3 py-2 border border-gray-200 rounded-lg shadow-sm">
                            <Calendar className="w-5 h-5 text-gray-400 mr-2" />
                            <select value={tahunAudit} onChange={(e) => setTahunAudit(e.target.value)} className="bg-transparent font-bold text-gray-700 outline-none pr-2 cursor-pointer">
                                <option value="2026">Tahun 2026</option><option value="2025">Tahun 2025</option><option value="2024">Tahun 2024</option>
                            </select>
                        </div>
                        <button onClick={handleExportPdf} disabled={isExporting} className="bg-red-50 text-red-600 hover:bg-red-500 hover:text-white px-5 py-2.5 border border-red-200 rounded-lg flex items-center font-bold text-sm transition disabled:opacity-50">
                            {isExporting ? 'Memproses...' : <><FileText className="w-4 h-4 mr-2"/> Cetak Audit PDF</>}
                        </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white p-6 rounded-xl border-t-4 border-t-indigo-500 text-center shadow-sm">
                            <p className="text-gray-500 text-sm font-medium mb-2">Zakat Fitrah Terkumpul</p>
                            <h3 className="text-3xl font-bold text-indigo-600">{formatRupiah(summary.total_fitrah)}</h3>
                        </div>
                        <div className="bg-white p-6 rounded-xl border-t-4 border-t-purple-500 text-center shadow-sm">
                            <p className="text-gray-500 text-sm font-medium mb-2">Zakat Mal Terkumpul</p>
                            <h3 className="text-3xl font-bold text-purple-600">{formatRupiah(summary.total_mal)}</h3>
                        </div>
                        <div className="bg-white p-6 rounded-xl border-t-4 border-t-primary text-center shadow-sm">
                            <p className="text-gray-500 text-sm font-medium mb-2">Telah Disalurkan Ke</p>
                            <h3 className="text-3xl font-bold text-gray-800">{summary.total_mustahik_menerima} <span className="text-base text-gray-500">Keluarga</span></h3>
                        </div>
                    </div>
                </div>
            )}

            {/* --- AREA MODAL --- */}

            {/* Modal Tambah Mustahik */}
            {isMustahikModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-lg flex flex-col">
                        <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
                            <h3 className="font-bold text-lg text-gray-800">
                                {editMustahikId ? 'Edit Data Warga' : 'Registrasi Mustahik Baru'}
                            </h3><X onClick={()=>setIsMustahikModalOpen(false)} className="cursor-pointer text-gray-500 hover:text-gray-800"/></div>
                        <div className="p-6">
                            <form id="mustahikForm" onSubmit={handleSubmitMustahik} className="space-y-4">
                                <input type="text" name="nama_lengkap" value={formMustahik.nama_lengkap} onChange={(e) => setFormMustahik({...formMustahik, nama_lengkap: e.target.value})} required placeholder="Nama Lengkap" className="w-full border p-2.5 rounded outline-none focus:ring-1 focus:ring-primary" />
                                <div className="grid grid-cols-2 gap-4">
                                    <select name="kategori" value={formMustahik.kategori} onChange={(e) => setFormMustahik({...formMustahik, kategori: e.target.value})} className="w-full border p-2.5 rounded outline-none focus:ring-1 focus:ring-primary bg-white">
                                        {kategoriZakat.map(k => <option key={k.id} value={k.id}>{k.label}</option>)}
                                    </select>
                                    <select name="rt" value={formMustahik.rt} onChange={(e) => setFormMustahik({...formMustahik, rt: e.target.value})} className="w-full border p-2.5 rounded outline-none focus:ring-1 focus:ring-primary bg-white">
                                        <option value="10">RT 10</option><option value="11">RT 11</option><option value="12">RT 12</option>
                                    </select>
                                </div>
                                <textarea name="alamat" value={formMustahik.alamat} onChange={(e) => setFormMustahik({...formMustahik, alamat: e.target.value})} required rows="2" placeholder="Alamat detail" className="w-full border p-2.5 rounded outline-none focus:ring-1 focus:ring-primary"></textarea>
                            </form>
                        </div>
                        <div className="p-4 border-t bg-gray-50 flex justify-end gap-2"><button type="button" onClick={()=>setIsMustahikModalOpen(false)} className="px-5 py-2.5 bg-white border border-gray-300 rounded-lg text-sm font-medium">Batal</button><button type="submit" form="mustahikForm" className="px-5 py-2.5 bg-primary text-white rounded-lg text-sm font-bold shadow-md">Simpan</button></div>
                    </div>
                </div>
            )}

            {/* Modal Bagi Zakat Massal */}
            {isBagiModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="p-4 border-b bg-gray-50 flex justify-between items-center"><h3 className="font-bold text-lg">Bagikan Zakat Massal</h3><X onClick={()=>setIsBagiModalOpen(false)} className="cursor-pointer text-gray-500 hover:text-gray-800"/></div>
                        <div className="p-6 overflow-y-auto">
                            <form id="bagiForm" onSubmit={submitBagiZakat} className="space-y-5">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Pilih Warga Penerima <span className="text-red-500">*</span></label>
                                    <div className="border rounded-xl bg-white overflow-hidden shadow-inner">
                                        <label className="flex items-center p-3 hover:bg-gray-50 border-b border-gray-200 bg-gray-50 cursor-pointer">
                                            <input type="checkbox" onChange={handleSelectAllMustahikForBagi} checked={formBagi.mustahik_ids.length === sortedMustahikForModal.length && sortedMustahikForModal.length > 0} className="w-4 h-4 text-primary rounded mr-3" />
                                            <span className="font-bold text-gray-800 text-sm">Pilih Semua ({sortedMustahikForModal.length})</span>
                                        </label>
                                        <div className="max-h-48 overflow-y-auto divide-y divide-gray-100">
                                            {sortedMustahikForModal.map(m => (
                                                <label key={m.id} className="flex items-center p-3 hover:bg-green-50/50 cursor-pointer transition">
                                                    <input type="checkbox" checked={formBagi.mustahik_ids.includes(m.id)} onChange={() => {
                                                        setFormBagi(prev => ({
                                                            ...prev, mustahik_ids: prev.mustahik_ids.includes(m.id) ? prev.mustahik_ids.filter(i => i !== m.id) : [...prev.mustahik_ids, m.id]
                                                        }));
                                                    }} className="w-4 h-4 text-primary rounded mr-3" />
                                                    <div className="flex-1"><div className="font-medium text-sm text-gray-800">{m.nama_lengkap}</div><div className="text-xs text-gray-500">RT {m.rt}</div></div>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                    <p className="text-xs text-primary mt-2 font-medium">Terpilih: {formBagi.mustahik_ids.length} Warga</p>
                                </div>
                                <div><label className="block text-sm font-medium text-gray-700 mb-1">Jenis Zakat <span className="text-red-500">*</span></label><select value={formBagi.jenis_zakat} onChange={e=>setFormBagi({...formBagi, jenis_zakat: e.target.value})} className="w-full border rounded-lg p-2.5 outline-none bg-white"><option value="fitrah">Zakat Fitrah</option><option value="mal">Zakat Mal</option></select></div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div><label className="block text-sm font-medium text-gray-700 mb-1">Bentuk (Misal: Beras 3Kg)</label><input type="text" value={formBagi.bentuk_barang} onChange={e=>setFormBagi({...formBagi, bentuk_barang: e.target.value})} className="w-full border rounded-lg p-2.5 outline-none" /></div>
                                    <div><label className="block text-sm font-medium text-gray-700 mb-1">Uang Tunai (Rp)</label><input type="number" value={formBagi.nominal_uang} onChange={e=>setFormBagi({...formBagi, nominal_uang: e.target.value})} className="w-full border rounded-lg p-2.5 outline-none" /></div>
                                </div>
                            </form>
                        </div>
                        <div className="p-4 border-t bg-gray-50 flex justify-end gap-2"><button type="button" onClick={()=>setIsBagiModalOpen(false)} className="px-5 py-2.5 bg-white border border-gray-300 rounded-lg text-sm font-medium">Batal</button><button type="submit" form="bagiForm" disabled={submitLoading} className="px-5 py-2.5 bg-primary text-white rounded-lg text-sm font-bold shadow-md disabled:opacity-50">{submitLoading ? 'Memproses...' : 'Simpan Pembagian'}</button></div>
                    </div>
                </div>
            )}

            {/* Modal Konfirmasi Remaja */}
            {isKonfirmasiModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden flex flex-col text-center border-t-4 border-blue-600">
                        <div className="p-6 bg-blue-50/50 flex flex-col items-center border-b border-gray-100">
                            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 mb-3"><Camera className="w-8 h-8" /></div>
                            <h3 className="font-bold text-xl text-gray-800">Bukti Pengiriman</h3>
                        </div>
                        <div className="p-6">
                            <form id="konfirmasiForm" onSubmit={submitKonfirmasi}>
                                <label className="block border-2 border-dashed border-blue-300 bg-white rounded-xl p-6 mb-2 hover:bg-blue-50 transition cursor-pointer group">
                                    <input type="file" accept="image/*" capture="environment" onChange={e => setFormKonfirmasi({foto_dokumentasi: e.target.files[0]})} className="hidden" required />
                                    <div className="flex flex-col items-center text-blue-600">
                                        <Plus className="w-8 h-8 mb-2 group-hover:scale-110 transition" />
                                        <span className="font-bold text-sm">{formKonfirmasi.foto_dokumentasi ? formKonfirmasi.foto_dokumentasi.name : "Ketuk untuk Buka Kamera"}</span>
                                    </div>
                                </label>
                            </form>
                        </div>
                        <div className="p-4 border-t bg-gray-50 flex flex-col gap-2">
                            {submitLoading ? <div className="py-2.5 text-blue-600 font-bold text-sm animate-pulse">{compressingText}</div> : (
                                <div className="flex gap-2">
                                    <button type="button" onClick={() => setIsKonfirmasiModalOpen(false)} className="flex-1 py-2.5 bg-white border border-gray-300 rounded-lg text-sm font-bold text-gray-600 hover:bg-gray-100">Batal</button>
                                    <button type="submit" form="konfirmasiForm" className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-bold shadow-md transition">Kirim Bukti</button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL EDIT MASSAL ZAKAT */}
            {isMassEditModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden flex flex-col">
                        <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
                            <h3 className="font-bold text-lg text-blue-800">Edit Massal ({selectedIds.length} Data)</h3>
                            <X onClick={()=>setIsMassEditModalOpen(false)} className="cursor-pointer text-gray-500 hover:text-gray-800"/>
                        </div>
                        <div className="p-6 overflow-y-auto">
                            <p className="text-sm text-gray-500 mb-4 bg-yellow-50 p-3 rounded border border-yellow-200">
                                💡 Hanya kolom yang Anda isi/pilih di bawah ini yang akan menimpa data warga yang terpilih. Kosongkan jika tidak ingin diubah.
                            </p>
                            <form id="massEditForm" onSubmit={submitMassEdit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Ubah Status Penyaluran</label>
                                    <select value={massEditForm.status} onChange={e=>setMassEditForm({...massEditForm, status: e.target.value})} className="w-full border p-2.5 rounded-lg outline-none bg-white">
                                        <option value="">-- Biarkan Tetap --</option>
                                        <option value="menunggu">Menunggu Dikirim (Reset)</option>
                                        <option value="disalurkan">Selesai Disalurkan</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Ubah Jenis Zakat</label>
                                    <select value={massEditForm.jenis_zakat} onChange={e=>setMassEditForm({...massEditForm, jenis_zakat: e.target.value})} className="w-full border p-2.5 rounded-lg outline-none bg-white">
                                        <option value="">-- Biarkan Tetap --</option>
                                        <option value="fitrah">Zakat Fitrah</option>
                                        <option value="mal">Zakat Mal</option>
                                    </select>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1">Ubah Barang</label>
                                        <input type="text" placeholder="Beras 5Kg" value={massEditForm.bentuk_barang} onChange={e=>setMassEditForm({...massEditForm, bentuk_barang: e.target.value})} className="w-full border p-2.5 rounded-lg outline-none" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1">Ubah Uang (Rp)</label>
                                        <input type="number" placeholder="50000" value={massEditForm.nominal_uang} onChange={e=>setMassEditForm({...massEditForm, nominal_uang: e.target.value})} className="w-full border p-2.5 rounded-lg outline-none" />
                                    </div>
                                </div>
                            </form>
                        </div>
                        <div className="p-4 border-t bg-gray-50 flex justify-end gap-2">
                            <button type="button" onClick={()=>setIsMassEditModalOpen(false)} className="px-5 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg text-sm font-bold">Batal</button>
                            <button type="submit" form="massEditForm" disabled={submitLoading} className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-bold shadow-md disabled:opacity-50">
                                {submitLoading ? 'Menyimpan...' : 'Terapkan Perubahan'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}