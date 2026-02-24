// src/pages/Zakat.jsx
import { useState, useEffect, useCallback, useRef } from 'react';
import { Users, Plus, Search, MapPin, HandHeart, History, X, CheckCircle, Camera, FileText, Calendar, ArrowUpDown, Edit, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import api from '../api/axios';
import imageCompression from 'browser-image-compression';

export default function Zakat() {
    const user = JSON.parse(localStorage.getItem('user'));
    
    const [activeTab, setActiveTab] = useState(user.role === 'remaja' ? 'riwayat' : 'mustahik'); 
    
    // --- STATE DATA ---
    const [mustahikList, setMustahikList] = useState([]);
    const [penyaluranList, setPenyaluranList] = useState([]);
    const [allMustahikForBagi, setAllMustahikForBagi] = useState([]); // Khusus list Modal Bagi Zakat
    const [summary, setSummary] = useState({ total_fitrah: 0, total_mal: 0, total_mustahik_menerima: 0 });
    
    const [loading, setLoading] = useState(true);
    const [submitLoading, setSubmitLoading] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    const [compressingText, setCompressingText] = useState('');
    const [tahunAudit, setTahunAudit] = useState(new Date().getFullYear());

    // --- STATE OPTIMASI (PAGINATION, SEARCH, SORT) ---
    const [pageMustahik, setPageMustahik] = useState(1);
    const [paginationMustahik, setPaginationMustahik] = useState({ last_page: 1, total: 0 });
    const [searchMustahik, setSearchMustahik] = useState('');
    const [sortMustahik, setSortMustahik] = useState('nama_asc'); 
    
    const [pagePenyaluran, setPagePenyaluran] = useState(1);
    const [paginationPenyaluran, setPaginationPenyaluran] = useState({ last_page: 1, total: 0 });
    const [searchPenyaluran, setSearchPenyaluran] = useState('');
    const [sortPenyaluran, setSortPenyaluran] = useState('nama_asc');
    
    const typingTimeoutRef = useRef(null);

    // --- STATE MODAL & FORM ---
    const [isMustahikModalOpen, setIsMustahikModalOpen] = useState(false);
    const [isBagiModalOpen, setIsBagiModalOpen] = useState(false);
    const [isKonfirmasiModalOpen, setIsKonfirmasiModalOpen] = useState(false);
    const [isMassEditModalOpen, setIsMassEditModalOpen] = useState(false);
    
    const [selectedPenyaluranId, setSelectedPenyaluranId] = useState(null);
    const [selectedIds, setSelectedIds] = useState([]);
    const [selectedMustahikIds, setSelectedMustahikIds] = useState([]);
    const [editMustahikId, setEditMustahikId] = useState(null);

    const [formMustahik, setFormMustahik] = useState({ nama_lengkap: '', nik: '', rt: '10', alamat: '', kategori: 'fakir' });
    const [formBagi, setFormBagi] = useState({ mustahik_ids: [], jenis_zakat: 'fitrah', bentuk_barang: '', nominal_uang: '' });
    const [formKonfirmasi, setFormKonfirmasi] = useState({ foto_dokumentasi: null });
    const [massEditForm, setMassEditForm] = useState({ status: '', jenis_zakat: '', bentuk_barang: '', nominal_uang: '' });

    const kategoriZakat = [
        { id: 'fakir', label: 'Fakir (Sangat miskin)' }, { id: 'miskin', label: 'Miskin (Penghasilan kurang)' },
        { id: 'mualaf', label: 'Mualaf (Baru masuk)' }, { id: 'fisabilillah', label: 'Fisabilillah' },
        { id: 'ibnu_sabil', label: 'Ibnu Sabil' }, { id: 'gharim', label: 'Gharim' },
        { id: 'riqab', label: 'Riqab' }, { id: 'amil', label: 'Amil (Panitia)' }
    ];

    // --- FUNGSI FETCH SERVER-SIDE ---
    const fetchMustahik = useCallback(async (currentPage = pageMustahik, search = searchMustahik, sort = sortMustahik) => {
        setLoading(true);
        try { 
            const res = await api.get('/mustahik', { params: { page: currentPage, search, sort } }); 
            setMustahikList(res.data.data || []);
            if(res.data.pagination) setPaginationMustahik({ last_page: res.data.pagination.last_page, total: res.data.pagination.total });
        } catch (err) { console.error(err); } finally { setLoading(false); }
    }, [pageMustahik, searchMustahik, sortMustahik]);

    const fetchPenyaluran = useCallback(async (currentPage = pagePenyaluran, search = searchPenyaluran, sort = sortPenyaluran) => {
        setLoading(true);
        try { 
            const res = await api.get('/penyaluran-zakat', { params: { page: currentPage, search, sort } }); 
            setPenyaluranList(res.data.data || []);
            if(res.data.pagination) setPaginationPenyaluran({ last_page: res.data.pagination.last_page, total: res.data.pagination.total });
            setSelectedIds([]); // Reset selection when page changes
        } catch (err) { console.error(err); } finally { setLoading(false); }
    }, [pagePenyaluran, searchPenyaluran, sortPenyaluran]);

    const fetchAllMustahikForBagi = async () => {
        try {
            const res = await api.get('/mustahik', { params: { get_all: true, sort: 'nama_asc' }});
            setAllMustahikForBagi(res.data.data || []);
        } catch(err) { console.log(err); }
    };

    const fetchSummary = useCallback(async () => {
        try { const res = await api.get(`/zakat/summary?tahun=${tahunAudit}`); setSummary(res.data.data); } catch (err) {}
    }, [tahunAudit]);

    // Efek Utama
    useEffect(() => {
        if (activeTab === 'mustahik' && user.role !== 'remaja') fetchMustahik();
        if (activeTab === 'riwayat') fetchPenyaluran();
        if (activeTab === 'audit' && user.role !== 'remaja') fetchSummary();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeTab, pageMustahik, pagePenyaluran, sortMustahik, sortPenyaluran, tahunAudit]);

    // --- FITUR DEBOUNCE PENCARIAN ---
    const handleSearchMustahikChange = (e) => {
        const val = e.target.value;
        setSearchMustahik(val);
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => { setPageMustahik(1); fetchMustahik(1, val, sortMustahik); }, 500);
    };

    const handleSearchPenyaluranChange = (e) => {
        const val = e.target.value;
        setSearchPenyaluran(val);
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => { setPagePenyaluran(1); fetchPenyaluran(1, val, sortPenyaluran); }, 500);
    };


    // --- FUNGSI AKSI MASSAL ---
    const handleSelectAllMustahik = (e) => {
        if (e.target.checked) setSelectedMustahikIds(mustahikList.map(m => m.id));
        else setSelectedMustahikIds([]);
    };
    const handleSelectOneMustahik = (id) => setSelectedMustahikIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);

    const handleSelectAllPenyaluran = (e) => {
        if (e.target.checked) setSelectedIds(penyaluranList.map(p => p.id));
        else setSelectedIds([]);
    };
    const handleSelectOnePenyaluran = (id) => setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);

    const handleMassDeleteMustahik = async () => {
        if (!window.confirm(`Yakin menghapus ${selectedMustahikIds.length} data warga?`)) return;
        try { await api.post('/mustahik/mass-destroy', { ids: selectedMustahikIds }); setSelectedMustahikIds([]); fetchMustahik(); } 
        catch (err) { alert("Gagal menghapus"); }
    };

    const handleMassDeletePenyaluran = async () => {
        if (!window.confirm(`Yakin menghapus ${selectedIds.length} data penyaluran?`)) return;
        try { await api.post('/penyaluran-zakat/mass-destroy', { ids: selectedIds }); fetchPenyaluran(); } 
        catch (err) { alert('Gagal menghapus'); }
    };

    const submitMassEdit = async (e) => {
        e.preventDefault(); setSubmitLoading(true);
        try {
            await api.post('/penyaluran-zakat/mass-update', { ids: selectedIds, ...massEditForm });
            setIsMassEditModalOpen(false); fetchPenyaluran(); alert('Pembaruan massal berhasil!');
        } catch (err) { alert('Gagal update massal'); } finally { setSubmitLoading(false); }
    };

    const submitBagiZakat = async (e) => {
        e.preventDefault();
        if (formBagi.mustahik_ids.length === 0) { alert("Pilih minimal 1 warga!"); return; }
        setSubmitLoading(true);
        try {
            await Promise.all(formBagi.mustahik_ids.map(id => api.post('/penyaluran-zakat', { mustahik_id: id, jenis_zakat: formBagi.jenis_zakat, bentuk_barang: formBagi.bentuk_barang, nominal_uang: formBagi.nominal_uang })));
            setIsBagiModalOpen(false); setFormBagi({ mustahik_ids: [], jenis_zakat: 'fitrah', bentuk_barang: '', nominal_uang: '' });
            alert(`Berhasil merencanakan penyaluran untuk ${formBagi.mustahik_ids.length} warga!`);
            if(activeTab === 'riwayat') fetchPenyaluran();
        } catch (err) { alert("Gagal merencanakan penyaluran"); } finally { setSubmitLoading(false); }
    };

    // --- CRUD SINGLE ---
    const handleSubmitMustahik = async (e) => {
        e.preventDefault(); setSubmitLoading(true);
        try {
            if (editMustahikId) await api.put(`/mustahik/${editMustahikId}`, formMustahik);
            else await api.post('/mustahik', formMustahik);
            setIsMustahikModalOpen(false); setFormMustahik({ nama_lengkap: '', nik: '', rt: '10', alamat: '', kategori: 'fakir' }); setEditMustahikId(null);
            fetchMustahik();
        } catch (error) { alert("Terjadi kesalahan."); } finally { setSubmitLoading(false); }
    };

    const handleDeleteMustahik = async (id) => {
        if (!window.confirm("Yakin hapus warga ini?")) return;
        try { await api.delete(`/mustahik/${id}`); fetchMustahik(); } catch (err) { alert("Gagal menghapus."); }
    };

    const submitKonfirmasi = async (e) => {
        e.preventDefault(); if (!formKonfirmasi.foto_dokumentasi) return alert("Pilih foto!");
        setSubmitLoading(true); setCompressingText('Mengompres foto...'); 
        try {
            const compressedFile = await imageCompression(formKonfirmasi.foto_dokumentasi, { maxSizeMB: 0.5, maxWidthOrHeight: 1024, useWebWorker: true, fileType: 'image/jpeg' });
            setCompressingText('Mengunggah...');
            const data = new FormData(); data.append('foto_dokumentasi', compressedFile, compressedFile.name);
            await api.post(`/penyaluran-zakat/${selectedPenyaluranId}/konfirmasi`, data, { headers: { 'Content-Type': 'multipart/form-data' } });
            setIsKonfirmasiModalOpen(false); setFormKonfirmasi({ foto_dokumentasi: null }); fetchPenyaluran(); alert("Penyaluran Dikonfirmasi!");
        } catch (err) { alert("Gagal mengunggah"); } finally { setSubmitLoading(false); }
    };

    // FITUR CETAK AUDIT PDF
    const handleExportPdf = async () => {
        setIsExporting(true);
        try {
            const res = await api.get(`/zakat/export-pdf?tahun=${tahunAudit}`, { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement('a'); 
            link.href = url; 
            link.setAttribute('download', `Audit_Zakat_${tahunAudit}.pdf`);
            document.body.appendChild(link); 
            link.click(); 
            link.parentNode.removeChild(link);
        } catch (err) { 
            console.log(err);
            alert("Gagal membuat PDF. Pastikan backend siap."); 
        } finally { 
            setIsExporting(false); 
        }
    };

    const formatRupiah = (angka) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(angka || 0);

    return (
        <div className="pb-10">
            {/* Header & Tabs */}
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Manajemen Penyaluran Zakat</h1>
                <p className="text-sm text-gray-500">{user.role === 'remaja' ? "Tugas Relawan: Konfirmasi pengiriman zakat berserta foto." : "Kelola data warga, bagikan zakat massal, dan cetak audit."}</p>
            </div>
            <div className="flex border-b border-gray-200 mb-6 overflow-x-auto">
                {user.role !== 'remaja' && (<button onClick={() => {setActiveTab('mustahik'); setPageMustahik(1);}} className={`flex items-center pb-3 px-4 font-medium text-sm transition whitespace-nowrap ${activeTab === 'mustahik' ? 'border-b-2 border-primary text-primary' : 'text-gray-500 hover:text-gray-700'}`}><Users className="w-4 h-4 mr-2" /> Data Warga</button>)}
                <button onClick={() => {setActiveTab('riwayat'); setPagePenyaluran(1);}} className={`flex items-center pb-3 px-4 font-medium text-sm transition whitespace-nowrap ${activeTab === 'riwayat' ? 'border-b-2 border-primary text-primary' : 'text-gray-500 hover:text-gray-700'}`}><HandHeart className="w-4 h-4 mr-2" /> Penyaluran</button>
                {user.role !== 'remaja' && (<button onClick={() => setActiveTab('audit')} className={`flex items-center pb-3 px-4 font-medium text-sm transition whitespace-nowrap ${activeTab === 'audit' ? 'border-b-2 border-primary text-primary' : 'text-gray-500 hover:text-gray-700'}`}><FileText className="w-4 h-4 mr-2" /> Audit PDF</button>)}
            </div>

            {/* TAB 1: MUSTAHIK */}
            {activeTab === 'mustahik' && user.role !== 'remaja' && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    {/* Alat Pencarian & Sorting */}
                    <div className="p-4 border-b border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gray-50/50">
                        <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
                            <div className="relative w-full sm:w-64">
                                <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
                                <input type="text" placeholder="Cari nama atau RT..." value={searchMustahik} onChange={handleSearchMustahikChange} className="w-full pl-9 pr-4 py-2 border rounded-lg text-sm focus:ring-1 focus:ring-primary outline-none" />
                            </div>
                            <div className="relative w-full sm:w-48">
                                <ArrowUpDown className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
                                <select value={sortMustahik} onChange={(e) => {setSortMustahik(e.target.value); setPageMustahik(1);}} className="w-full pl-9 pr-4 py-2 border rounded-lg text-sm outline-none cursor-pointer">
                                    <option value="nama_asc">Urut Nama (A-Z)</option><option value="nama_desc">Urut Nama (Z-A)</option>
                                    <option value="rt_asc">Urut RT (Terkecil)</option><option value="rt_desc">Urut RT (Terbesar)</option>
                                </select>
                            </div>
                        </div>
                        <button onClick={() => {setEditMustahikId(null); setFormMustahik({ nama_lengkap: '', nik: '', rt: '10', alamat: '', kategori: 'fakir' }); setIsMustahikModalOpen(true);}} className="w-full md:w-auto bg-primary text-white px-4 py-2 rounded-lg flex items-center justify-center text-sm font-bold shadow-sm transition">
                            <Plus className="w-4 h-4 mr-2" /> Tambah Warga
                        </button>
                    </div>

                    {/* Aksi Massal Mustahik */}
                    {mustahikList.length > 0 && (
                        <div className="flex flex-col sm:flex-row justify-between items-center bg-blue-50/50 p-3 mx-4 mt-4 rounded-lg border border-blue-100 gap-3">
                            <label className="flex items-center cursor-pointer">
                                <input type="checkbox" checked={selectedMustahikIds.length === mustahikList.length} onChange={handleSelectAllMustahik} className="w-4 h-4 text-primary rounded mr-3" />
                                <span className="font-bold text-sm text-blue-800">Pilih Semua di Halaman Ini</span>
                            </label>
                            {selectedMustahikIds.length > 0 && user.role === 'developer' && (
                                <button onClick={handleMassDeleteMustahik} className="bg-red-100 text-red-600 px-4 py-1.5 rounded-lg text-sm font-bold flex items-center shadow-sm"><Trash2 className="w-4 h-4 mr-1.5" /> Hapus {selectedMustahikIds.length}</button>
                            )}
                        </div>
                    )}

                    {/* Tabel Mustahik */}
                    <div className="overflow-x-auto p-4">
                        <table className="w-full text-sm text-left text-gray-600">
                            <thead className="bg-gray-50 text-gray-700 uppercase font-medium text-xs">
                                <tr><th className="px-4 py-3 w-10">#</th><th className="px-6 py-3">Nama Lengkap</th><th className="px-6 py-3">Kategori</th><th className="px-6 py-3">RT & Alamat</th><th className="px-6 py-3 text-center">Aksi</th></tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {loading ? <tr><td colSpan="5" className="text-center py-10">Memuat data server...</td></tr> : 
                                 mustahikList.length === 0 ? <tr><td colSpan="5" className="text-center py-10">Tidak ada data.</td></tr> :
                                 mustahikList.map((m) => (
                                    <tr key={m.id} className="hover:bg-gray-50">
                                        <td className="px-4 py-4 text-center"><input type="checkbox" checked={selectedMustahikIds.includes(m.id)} onChange={() => handleSelectOneMustahik(m.id)} className="w-4 h-4" /></td>
                                        <td className="px-6 py-4"><div className="font-bold text-gray-800">{m.nama_lengkap}</div><div className="text-[10px] text-gray-500">{m.nik || '-'}</div></td>
                                        <td className="px-6 py-4"><span className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs font-semibold">{m.kategori.replace('_', ' ')}</span></td>
                                        <td className="px-6 py-4"><span className="font-bold text-primary mr-2">RT {m.rt}</span><span className="text-xs">{m.alamat}</span></td>
                                        <td className="px-6 py-4 text-center">
                                            <button onClick={() => {setEditMustahikId(m.id); setFormMustahik(m); setIsMustahikModalOpen(true);}} className="p-1.5 bg-blue-50 text-blue-600 rounded mr-2"><Edit className="w-4 h-4"/></button>
                                            {user.role === 'developer' && <button onClick={() => handleDeleteMustahik(m.id)} className="p-1.5 bg-red-50 text-red-600 rounded"><Trash2 className="w-4 h-4"/></button>}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination Mustahik */}
                    {!loading && paginationMustahik.last_page > 1 && (
                        <div className="p-4 border-t flex justify-between bg-gray-50 items-center">
                            <span className="text-sm text-gray-500">Hal <b>{pageMustahik}</b> dari <b>{paginationMustahik.last_page}</b> ({paginationMustahik.total} data)</span>
                            <div className="flex gap-2">
                                <button onClick={() => setPageMustahik(p => Math.max(1, p - 1))} disabled={pageMustahik === 1} className="px-3 py-1 border rounded disabled:opacity-50 flex items-center text-sm bg-white"><ChevronLeft className="w-4 h-4 mr-1"/> Prev</button>
                                <button onClick={() => setPageMustahik(p => Math.min(paginationMustahik.last_page, p + 1))} disabled={pageMustahik === paginationMustahik.last_page} className="px-3 py-1 border rounded disabled:opacity-50 flex items-center text-sm bg-white">Next <ChevronRight className="w-4 h-4 ml-1"/></button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* TAB 2: PENYALURAN */}
            {activeTab === 'riwayat' && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-4 flex flex-col md:flex-row justify-between items-start md:items-center border-b border-gray-100 bg-gray-50/50 gap-4">
                        <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
                            <div className="relative w-full sm:w-64">
                                <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
                                <input type="text" placeholder="Cari penerima..." value={searchPenyaluran} onChange={handleSearchPenyaluranChange} className="w-full pl-9 pr-4 py-2 border rounded-lg text-sm focus:ring-1 focus:ring-primary outline-none" />
                            </div>
                            <div className="relative w-full sm:w-48">
                                <ArrowUpDown className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
                                <select value={sortPenyaluran} onChange={(e) => {setSortPenyaluran(e.target.value); setPagePenyaluran(1);}} className="w-full pl-9 pr-4 py-2 border rounded-lg text-sm outline-none cursor-pointer">
                                    <option value="nama_asc">Urut Nama (A-Z)</option><option value="nama_desc">Urut Nama (Z-A)</option>
                                    <option value="rt_asc">Urut RT (Terkecil)</option><option value="rt_desc">Urut RT (Terbesar)</option>
                                </select>
                            </div>
                        </div>
                        {user.role !== 'remaja' && (
                            <button onClick={() => { fetchAllMustahikForBagi(); setIsBagiModalOpen(true); }} className="w-full md:w-auto bg-primary text-white px-4 py-2 rounded-lg font-bold shadow-sm flex justify-center items-center">
                                <HandHeart className="w-4 h-4 mr-1"/> Rencana Bagikan Massal
                            </button>
                        )}
                    </div>

                    {/* Aksi Massal Penyaluran */}
                    {penyaluranList.length > 0 && user.role !== 'remaja' && (
                        <div className="flex flex-col sm:flex-row justify-between items-center bg-blue-50/50 p-3 mx-4 mt-4 rounded-lg border border-blue-100 gap-3">
                            <label className="flex items-center cursor-pointer">
                                <input type="checkbox" checked={selectedIds.length === penyaluranList.length} onChange={handleSelectAllPenyaluran} className="w-4 h-4 text-primary rounded mr-3" />
                                <span className="font-bold text-sm text-blue-800">Pilih Semua di Halaman Ini</span>
                            </label>
                            {selectedIds.length > 0 && (
                                <div className="flex gap-2">
                                    <button onClick={() => setIsMassEditModalOpen(true)} className="bg-blue-100 text-blue-700 px-4 py-1.5 rounded-lg text-sm font-bold flex items-center shadow-sm"><Edit className="w-4 h-4 mr-1.5" /> Edit {selectedIds.length}</button>
                                    {user.role === 'developer' && <button onClick={handleMassDeletePenyaluran} className="bg-red-100 text-red-600 px-4 py-1.5 rounded-lg text-sm font-bold flex items-center shadow-sm"><Trash2 className="w-4 h-4 mr-1.5" /> Hapus {selectedIds.length}</button>}
                                </div>
                            )}
                        </div>
                    )}

                    <div className="overflow-x-auto p-4">
                        <table className="w-full text-sm text-left text-gray-600">
                            <thead className="bg-gray-50 text-gray-700 uppercase font-medium text-xs">
                                <tr>{user.role !== 'remaja' && <th className="px-4 py-3 w-10">#</th>}<th className="px-6 py-3">Penerima</th><th className="px-6 py-3">Jenis</th><th className="px-6 py-3">Bentuk/Nominal</th><th className="px-6 py-3 text-center">Status</th><th className="px-6 py-3 text-center">Aksi</th></tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {loading ? <tr><td colSpan="6" className="text-center py-10">Memuat...</td></tr> : 
                                 penyaluranList.length === 0 ? <tr><td colSpan="6" className="text-center py-10">Tidak ditemukan.</td></tr> :
                                 penyaluranList.map(p => (
                                    <tr key={p.id} className="hover:bg-gray-50">
                                        {user.role !== 'remaja' && <td className="px-4 py-4 text-center"><input type="checkbox" checked={selectedIds.includes(p.id)} onChange={() => handleSelectOnePenyaluran(p.id)} className="w-4 h-4" /></td>}
                                        <td className="px-6 py-4"><div className="font-bold text-gray-800">{p.mustahik?.nama_lengkap}</div><div className="text-xs text-gray-500">RT {p.mustahik?.rt}</div></td>
                                        <td className="px-6 py-4"><span className="px-2.5 py-1 rounded text-xs font-bold capitalize bg-indigo-100 text-indigo-700">Zakat {p.jenis_zakat}</span></td>
                                        <td className="px-6 py-4 font-bold">{p.bentuk_barang || formatRupiah(p.nominal_uang)}</td>
                                        <td className="px-6 py-4 text-center">{p.status === 'disalurkan' ? <span className="text-green-700 bg-green-100 px-2 py-1 rounded text-xs font-bold">Selesai</span> : <span className="text-orange-700 bg-orange-100 px-2 py-1 rounded text-xs font-bold animate-pulse">Menunggu</span>}</td>
                                        <td className="px-6 py-4 text-center">
                                            {p.status === 'menunggu' ? (
                                                <button onClick={() => { setSelectedPenyaluranId(p.id); setIsKonfirmasiModalOpen(true); }} className="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold">Konfirmasi</button>
                                            ) : (
                                                p.foto_dokumentasi && <a href={`http://47.236.145.121/storage/${p.foto_dokumentasi}`} target="_blank" rel="noreferrer" className="text-blue-600 text-xs font-bold hover:underline">Lihat Bukti</a>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination Penyaluran */}
                    {!loading && paginationPenyaluran.last_page > 1 && (
                        <div className="p-4 border-t flex justify-between bg-gray-50 items-center">
                            <span className="text-sm text-gray-500">Hal <b>{pagePenyaluran}</b> dari <b>{paginationPenyaluran.last_page}</b> ({paginationPenyaluran.total} data)</span>
                            <div className="flex gap-2">
                                <button onClick={() => setPagePenyaluran(p => Math.max(1, p - 1))} disabled={pagePenyaluran === 1} className="px-3 py-1 border rounded disabled:opacity-50 flex items-center text-sm bg-white"><ChevronLeft className="w-4 h-4 mr-1"/> Prev</button>
                                <button onClick={() => setPagePenyaluran(p => Math.min(paginationPenyaluran.last_page, p + 1))} disabled={pagePenyaluran === paginationPenyaluran.last_page} className="px-3 py-1 border rounded disabled:opacity-50 flex items-center text-sm bg-white">Next <ChevronRight className="w-4 h-4 ml-1"/></button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* TAB 3: AUDIT */}
            {activeTab === 'audit' && user.role !== 'remaja' && (
                <div>
                    <div className="flex justify-between items-center mb-6">
                        <div className="flex items-center bg-white px-3 py-2 border rounded-lg shadow-sm"><Calendar className="w-5 h-5 text-gray-400 mr-2" /><select value={tahunAudit} onChange={(e) => setTahunAudit(e.target.value)} className="bg-transparent font-bold outline-none cursor-pointer"><option value="2026">Tahun 2026</option><option value="2025">Tahun 2025</option></select></div>
                        <button onClick={handleExportPdf} disabled={isExporting} className="bg-red-50 text-red-600 hover:bg-red-500 hover:text-white px-5 py-2.5 border border-red-200 rounded-lg flex font-bold text-sm transition disabled:opacity-50">{isExporting ? 'Proses...' : 'Cetak Audit PDF'}</button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white p-6 rounded-xl border-t-4 border-indigo-500 text-center shadow-sm"><p className="text-gray-500 text-sm mb-2">Zakat Fitrah Terkumpul</p><h3 className="text-3xl font-bold text-indigo-600">{formatRupiah(summary.total_fitrah)}</h3></div>
                        <div className="bg-white p-6 rounded-xl border-t-4 border-purple-500 text-center shadow-sm"><p className="text-gray-500 text-sm mb-2">Zakat Mal Terkumpul</p><h3 className="text-3xl font-bold text-purple-600">{formatRupiah(summary.total_mal)}</h3></div>
                        <div className="bg-white p-6 rounded-xl border-t-4 border-primary text-center shadow-sm"><p className="text-gray-500 text-sm mb-2">Telah Disalurkan Ke</p><h3 className="text-3xl font-bold text-gray-800">{summary.total_mustahik_menerima} <span className="text-base text-gray-500">Keluarga</span></h3></div>
                    </div>
                </div>
            )}

            {/* MODAL BAGI ZAKAT MASSAL (Diperbarui agar memakai Data Bebas Pagination) */}
            {isBagiModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="p-4 border-b bg-gray-50 flex justify-between items-center"><h3 className="font-bold text-lg">Bagikan Zakat Massal</h3><X onClick={()=>setIsBagiModalOpen(false)} className="cursor-pointer text-gray-500 hover:text-gray-800"/></div>
                        <div className="p-6 overflow-y-auto">
                            <form id="bagiForm" onSubmit={submitBagiZakat} className="space-y-5">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Pilih Warga (Dari Keseluruhan Data) <span className="text-red-500">*</span></label>
                                    <div className="border rounded-xl bg-white overflow-hidden shadow-inner">
                                        <label className="flex items-center p-3 border-b bg-gray-50 cursor-pointer">
                                            <input type="checkbox" onChange={(e) => setFormBagi(prev => ({ ...prev, mustahik_ids: e.target.checked ? allMustahikForBagi.map(m=>m.id) : [] }))} checked={formBagi.mustahik_ids.length === allMustahikForBagi.length && allMustahikForBagi.length > 0} className="w-4 h-4 mr-3" />
                                            <span className="font-bold text-sm">Pilih Semua ({allMustahikForBagi.length})</span>
                                        </label>
                                        <div className="max-h-48 overflow-y-auto divide-y divide-gray-100">
                                            {allMustahikForBagi.length === 0 ? <div className="p-4 text-center text-gray-400 text-sm">Memuat data warga...</div> : allMustahikForBagi.map(m => (
                                                <label key={m.id} className="flex items-center p-3 hover:bg-gray-50 cursor-pointer">
                                                    <input type="checkbox" checked={formBagi.mustahik_ids.includes(m.id)} onChange={() => setFormBagi(prev => ({ ...prev, mustahik_ids: prev.mustahik_ids.includes(m.id) ? prev.mustahik_ids.filter(i=>i!==m.id) : [...prev.mustahik_ids, m.id] }))} className="w-4 h-4 mr-3" />
                                                    <div className="flex-1 text-sm font-medium">{m.nama_lengkap} <span className="text-xs text-gray-400 font-normal">RT {m.rt}</span></div>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                <div><label className="block text-sm font-bold">Jenis Zakat</label><select value={formBagi.jenis_zakat} onChange={e=>setFormBagi({...formBagi, jenis_zakat: e.target.value})} className="w-full border p-2.5 rounded-lg bg-white"><option value="fitrah">Fitrah</option><option value="mal">Mal</option></select></div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div><label className="block text-sm font-bold">Bentuk (Cth: Beras)</label><input type="text" value={formBagi.bentuk_barang} onChange={e=>setFormBagi({...formBagi, bentuk_barang: e.target.value})} className="w-full border p-2.5 rounded-lg" /></div>
                                    <div><label className="block text-sm font-bold">Uang (Rp)</label><input type="number" value={formBagi.nominal_uang} onChange={e=>setFormBagi({...formBagi, nominal_uang: e.target.value})} className="w-full border p-2.5 rounded-lg" /></div>
                                </div>
                            </form>
                        </div>
                        <div className="p-4 border-t flex justify-end gap-2"><button type="button" onClick={()=>setIsBagiModalOpen(false)} className="px-5 py-2.5 border rounded-lg">Batal</button><button type="submit" form="bagiForm" disabled={submitLoading} className="px-5 py-2.5 bg-primary text-white rounded-lg font-bold">{submitLoading ? 'Memproses...' : 'Simpan'}</button></div>
                    </div>
                </div>
            )}

            {/* Modal Tambah/Edit Mustahik, Konfirmasi, Mass Edit (Tetap Sama Seperti Sebelumnya) */}
            {isMustahikModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-lg flex flex-col">
                        <div className="p-4 border-b bg-gray-50 flex justify-between items-center"><h3 className="font-bold text-lg">{editMustahikId ? 'Edit Data Warga' : 'Registrasi Mustahik'}</h3><X onClick={()=>setIsMustahikModalOpen(false)} className="cursor-pointer"/></div>
                        <div className="p-6">
                            <form id="mustahikForm" onSubmit={handleSubmitMustahik} className="space-y-4">
                                <input type="text" value={formMustahik.nama_lengkap} onChange={e=>setFormMustahik({...formMustahik, nama_lengkap: e.target.value})} required placeholder="Nama Lengkap" className="w-full border p-2.5 rounded-lg" />
                                <div className="grid grid-cols-2 gap-4">
                                    <select value={formMustahik.kategori} onChange={e=>setFormMustahik({...formMustahik, kategori: e.target.value})} className="w-full border p-2.5 rounded-lg bg-white">{kategoriZakat.map(k => <option key={k.id} value={k.id}>{k.label}</option>)}</select>
                                    <select value={formMustahik.rt} onChange={e=>setFormMustahik({...formMustahik, rt: e.target.value})} className="w-full border p-2.5 rounded-lg bg-white"><option value="10">RT 10</option><option value="11">RT 11</option></select>
                                </div>
                                <textarea value={formMustahik.alamat} onChange={e=>setFormMustahik({...formMustahik, alamat: e.target.value})} required rows="2" placeholder="Alamat detail" className="w-full border p-2.5 rounded-lg"></textarea>
                            </form>
                        </div>
                        <div className="p-4 border-t flex justify-end gap-2"><button type="button" onClick={()=>setIsMustahikModalOpen(false)} className="px-5 py-2.5 border rounded-lg">Batal</button><button type="submit" form="mustahikForm" className="px-5 py-2.5 bg-primary text-white font-bold rounded-lg shadow">Simpan</button></div>
                    </div>
                </div>
            )}

            {isKonfirmasiModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm flex flex-col border-t-4 border-blue-600">
                        <div className="p-6 bg-blue-50/50 flex flex-col items-center border-b"><Camera className="w-12 h-12 text-blue-600 mb-2" /><h3 className="font-bold text-xl">Bukti Pengiriman</h3></div>
                        <div className="p-6">
                            <form id="konfirmasiForm" onSubmit={submitKonfirmasi}>
                                <label className="block border-2 border-dashed border-blue-300 rounded-xl p-6 text-center cursor-pointer hover:bg-blue-50">
                                    <input type="file" accept="image/*" capture="environment" onChange={e => setFormKonfirmasi({foto_dokumentasi: e.target.files[0]})} className="hidden" required />
                                    <Plus className="w-8 h-8 mx-auto text-blue-600 mb-2" />
                                    <span className="font-bold text-sm text-blue-600">{formKonfirmasi.foto_dokumentasi ? formKonfirmasi.foto_dokumentasi.name : "Ketuk untuk Kamera"}</span>
                                </label>
                            </form>
                        </div>
                        <div className="p-4 border-t flex gap-2"><button type="button" onClick={()=>setIsKonfirmasiModalOpen(false)} className="flex-1 py-2.5 border rounded-lg font-bold text-gray-600">Batal</button><button type="submit" form="konfirmasiForm" className="flex-1 py-2.5 bg-blue-600 text-white rounded-lg font-bold shadow">{submitLoading ? compressingText : 'Kirim Bukti'}</button></div>
                    </div>
                </div>
            )}

            {isMassEditModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md flex flex-col">
                        <div className="p-4 border-b flex justify-between"><h3 className="font-bold text-lg text-blue-800">Edit Massal ({selectedIds.length} Data)</h3><X onClick={()=>setIsMassEditModalOpen(false)} className="cursor-pointer"/></div>
                        <div className="p-6"><p className="text-sm text-gray-500 mb-4 bg-yellow-50 p-3 rounded">Kosongkan input yang tidak ingin diubah.</p>
                            <form id="massEditForm" onSubmit={submitMassEdit} className="space-y-4">
                                <div><label className="block text-sm font-bold mb-1">Ubah Status</label><select value={massEditForm.status} onChange={e=>setMassEditForm({...massEditForm, status: e.target.value})} className="w-full border p-2.5 rounded-lg bg-white"><option value="">-- Biarkan Tetap --</option><option value="menunggu">Menunggu</option><option value="disalurkan">Selesai</option></select></div>
                                <div><label className="block text-sm font-bold mb-1">Ubah Jenis Zakat</label><select value={massEditForm.jenis_zakat} onChange={e=>setMassEditForm({...massEditForm, jenis_zakat: e.target.value})} className="w-full border p-2.5 rounded-lg bg-white"><option value="">-- Biarkan Tetap --</option><option value="fitrah">Fitrah</option><option value="mal">Mal</option></select></div>
                                <div className="grid grid-cols-2 gap-4"><div><label className="block text-sm font-bold mb-1">Barang</label><input type="text" value={massEditForm.bentuk_barang} onChange={e=>setMassEditForm({...massEditForm, bentuk_barang: e.target.value})} className="w-full border p-2.5 rounded-lg" /></div><div><label className="block text-sm font-bold mb-1">Uang</label><input type="number" value={massEditForm.nominal_uang} onChange={e=>setMassEditForm({...massEditForm, nominal_uang: e.target.value})} className="w-full border p-2.5 rounded-lg" /></div></div>
                            </form>
                        </div>
                        <div className="p-4 border-t flex justify-end gap-2"><button type="button" onClick={()=>setIsMassEditModalOpen(false)} className="px-5 py-2.5 border rounded-lg font-bold">Batal</button><button type="submit" form="massEditForm" disabled={submitLoading} className="px-5 py-2.5 bg-blue-600 text-white rounded-lg font-bold">{submitLoading ? 'Menyimpan...' : 'Terapkan'}</button></div>
                    </div>
                </div>
            )}

        </div>
    );
}