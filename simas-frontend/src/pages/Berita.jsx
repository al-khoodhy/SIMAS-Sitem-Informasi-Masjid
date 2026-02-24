// src/pages/Berita.jsx
import { useState, useEffect, useRef } from 'react';
import { Plus, CheckCircle, Clock, XCircle, FileText, Image as ImageIcon, X, Youtube, Edit, Eye, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import api from '../api/axios';

export default function Berita() {
    const user = JSON.parse(localStorage.getItem('user'));
    
    // State Utama
    const [beritaList, setBeritaList] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // State Optimasi (Pagination, Filter, Search)
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalData, setTotalData] = useState(0);
    const [filterStatus, setFilterStatus] = useState('semua');
    const [searchTerm, setSearchTerm] = useState('');
    const typingTimeoutRef = useRef(null);
    
    // State Modal
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [submitLoading, setSubmitLoading] = useState(false);
    const [editId, setEditId] = useState(null);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [viewData, setViewData] = useState(null);
    const [formData, setFormData] = useState({ judul: '', konten: '', link_youtube: '', thumbnail: null });

    // Efek ketika Halaman atau Filter berganti
    useEffect(() => {
        fetchBerita();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page, filterStatus]);

    // Fitur Debounce Search (Menunggu user selesai mengetik 500ms)
    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        
        typingTimeoutRef.current = setTimeout(() => {
            setPage(1); // Reset ke halaman 1 saat mencari
            fetchBerita(1, e.target.value);
        }, 500);
    };

    // Panggil API dengan Parameter
    const fetchBerita = async (currentPage = page, search = searchTerm) => {
        setLoading(true);
        try {
            const params = { page: currentPage };
            if (filterStatus !== 'semua') params.status = filterStatus;
            if (search.trim() !== '') params.search = search;

            const res = await api.get('/berita', { params });
            const responseData = res.data;

            setBeritaList(responseData.data || []);
            
            if (responseData.pagination) {
                setTotalPages(responseData.pagination.last_page || 1);
                setTotalData(responseData.pagination.total || 0);
            }
        } catch (error) {
            console.error("Gagal mengambil data berita", error);
        } finally {
            setLoading(false);
        }
    };

    // --- HANDLERS (Modal, Input, dll) ---
    const handleInputChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    const handleFileChange = (e) => setFormData(prev => ({ ...prev, thumbnail: e.target.files[0] }));
    
    const handleView = (berita) => { setViewData(berita); setIsViewModalOpen(true); };
    
    const handleEdit = (berita) => {
        setEditId(berita.id);
        setFormData({ judul: berita.judul, konten: berita.konten, link_youtube: berita.link_youtube || '', thumbnail: null });
        setIsModalOpen(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Yakin menghapus berita ini permanen?")) return;
        try {
            await api.delete(`/berita/${id}`);
            fetchBerita();
        } catch (error) { alert("Gagal menghapus berita."); }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitLoading(true);
        const dataToSend = new FormData();
        dataToSend.append('judul', formData.judul);
        dataToSend.append('konten', formData.konten);
        if (formData.link_youtube) dataToSend.append('link_youtube', formData.link_youtube);
        if (formData.thumbnail) dataToSend.append('thumbnail', formData.thumbnail);
        if (!editId) dataToSend.append('status', user.role === 'remaja' ? 'menunggu_persetujuan' : 'dipublikasi');

        try {
            if (editId) {
                dataToSend.append('_method', 'PUT');
                await api.post(`/berita/${editId}`, dataToSend, { headers: { 'Content-Type': 'multipart/form-data' }});
                alert("Berita berhasil diperbarui.");
            } else {
                await api.post('/berita', dataToSend, { headers: { 'Content-Type': 'multipart/form-data' }});
                alert(user.role === 'remaja' ? "Draf berita berhasil dikirim! Menunggu persetujuan panitia." : "Berita berhasil dipublikasikan!");
            }
            setIsModalOpen(false); setEditId(null); setFormData({ judul: '', konten: '', link_youtube: '', thumbnail: null });
            setPage(1); fetchBerita(1);
        } catch (error) { alert(error.response?.data?.message || "Terjadi kesalahan saat menyimpan berita."); } finally { setSubmitLoading(false); }
    };

    const handleApprove = async (id) => {
        if (!window.confirm("Publikasikan berita ini ke Landing Page?")) return;
        try { await api.post(`/berita/${id}/approve`); fetchBerita(); setIsViewModalOpen(false); alert("Berita berhasil dipublikasikan!"); } catch (error) { alert("Gagal mempublikasikan berita."); }
    };

    const handleReject = async (id) => {
        const reason = window.prompt("Alasan menolak berita ini (opsional)?");
        if (reason === null) return; 
        try { await api.post(`/berita/${id}/reject`); fetchBerita(); setIsViewModalOpen(false); alert("Berita telah dikembalikan ke penulis."); } catch (error) { alert("Gagal menolak berita."); }
    };

    // --- UTILITIES ---
    const getStatusBadge = (status) => {
        switch (status) {
            case 'dipublikasi': return <span className="flex items-center text-green-700 bg-green-100 px-2.5 py-1 rounded-full text-xs font-semibold shadow-sm"><CheckCircle className="w-3 h-3 mr-1"/> Dipublikasi</span>;
            case 'menunggu_persetujuan': return <span className="flex items-center text-yellow-700 bg-yellow-100 px-2.5 py-1 rounded-full text-xs font-semibold shadow-sm animate-pulse"><Clock className="w-3 h-3 mr-1"/> Menunggu Review</span>;
            case 'ditolak': return <span className="flex items-center text-red-700 bg-red-100 px-2.5 py-1 rounded-full text-xs font-semibold shadow-sm"><XCircle className="w-3 h-3 mr-1"/> Perlu Perbaikan</span>;
            default: return <span className="flex items-center text-gray-700 bg-gray-100 px-2.5 py-1 rounded-full text-xs font-semibold shadow-sm">Draft</span>;
        }
    };
    const formatTanggal = (tanggal) => tanggal ? new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute:'2-digit' }).format(new Date(tanggal)) : '-';

    return (
        <div className="pb-10">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Publikasi & Berita</h1>
                    <p className="text-sm text-gray-500">
                        {user.role === 'remaja' ? "Tulis kegiatan masjid. Berita akan tayang setelah disetujui Panitia." : "Kelola artikel dan setujui berita dari Remaja Masjid."}
                    </p>
                </div>
                <button onClick={() => { setEditId(null); setFormData({ judul: '', konten: '', link_youtube: '', thumbnail: null }); setIsModalOpen(true); }} className="bg-primary hover:bg-secondary text-white px-5 py-2.5 rounded-xl font-bold flex items-center shadow-md transition whitespace-nowrap">
                    <Plus className="w-5 h-5 mr-2" /> Tulis Berita Baru
                </button>
            </div>

            {/* TAB FILTER & SEARCH BAR */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6 flex flex-col md:flex-row gap-4 justify-between items-center">
                
                {/* Tabs Filter */}
                <div className="flex space-x-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
                    <button onClick={() => {setFilterStatus('semua'); setPage(1);}} className={`px-4 py-2 text-sm font-bold rounded-lg transition whitespace-nowrap ${filterStatus === 'semua' ? 'bg-gray-800 text-white' : 'text-gray-500 hover:bg-gray-100 border border-gray-200'}`}>Semua</button>
                    {(user.role === 'panitia' || user.role === 'developer') && (
                        <button onClick={() => {setFilterStatus('menunggu_persetujuan'); setPage(1);}} className={`px-4 py-2 text-sm font-bold rounded-lg transition whitespace-nowrap flex items-center ${filterStatus === 'menunggu_persetujuan' ? 'bg-yellow-500 text-white' : 'text-gray-500 hover:bg-gray-100 border border-gray-200'}`}>
                            Perlu Review
                        </button>
                    )}
                    <button onClick={() => {setFilterStatus('dipublikasi'); setPage(1);}} className={`px-4 py-2 text-sm font-bold rounded-lg transition whitespace-nowrap ${filterStatus === 'dipublikasi' ? 'bg-green-500 text-white' : 'text-gray-500 hover:bg-gray-100 border border-gray-200'}`}>Tayang</button>
                </div>

                {/* Search Bar */}
                <div className="relative w-full md:w-72">
                    <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                    <input type="text" placeholder="Cari judul artikel..." value={searchTerm} onChange={handleSearchChange} className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary outline-none bg-gray-50 focus:bg-white transition" />
                </div>
            </div>

            {/* GRID KARTU BERITA */}
            {loading ? (
                <div className="text-center py-20 text-gray-500 flex justify-center items-center"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary mr-3"></div> Memuat artikel...</div>
            ) : beritaList.length === 0 ? (
                <div className="bg-white p-16 rounded-2xl shadow-sm text-center border border-gray-100">
                    <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-bold text-gray-700 mb-1">Tidak Ada Berita</h3>
                    <p className="text-gray-500">Belum ada artikel yang sesuai dengan kriteria.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {beritaList.map((berita) => (
                        <div key={berita.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col hover:shadow-lg transition duration-300">
                            <div className="h-48 bg-gray-100 relative group overflow-hidden">
                                {berita.thumbnail ? (
                                    <img src={`http://47.236.145.121/storage/${berita.thumbnail}`} alt={berita.judul} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-400"><ImageIcon className="w-12 h-12 opacity-50" /></div>
                                )}
                                <div className="absolute top-3 right-3">{getStatusBadge(berita.status)}</div>
                            </div>
                            
                            <div className="p-5 flex-1 flex flex-col">
                                <h3 className="font-bold text-gray-800 text-lg mb-2 line-clamp-2 hover:text-primary transition cursor-pointer" onClick={() => handleView(berita)}>{berita.judul}</h3>
                                <p className="text-sm text-gray-500 line-clamp-2 mb-4 flex-1">{berita.konten}</p>
                                
                                <div className="flex flex-col text-xs text-gray-500 mb-4 pt-4 border-t border-gray-100 gap-1">
                                    <div className="flex justify-between items-center">
                                        <span className="flex items-center"><Edit className="w-3 h-3 mr-1"/> <span className="font-bold text-gray-700">{berita.penulis?.name || 'Anonim'}</span></span>
                                        <span className="bg-gray-50 px-2 py-1 rounded">{formatTanggal(berita.created_at)}</span>
                                    </div>
                                </div>

                                <div className="mt-auto flex flex-col gap-2">
                                    <button onClick={() => handleView(berita)} className="w-full bg-blue-50/50 text-blue-700 hover:bg-blue-100 py-2 rounded-xl font-bold transition flex items-center justify-center text-sm">
                                        <Eye className="w-4 h-4 mr-1.5" /> Pratinjau
                                    </button>

                                    {(user.role === 'panitia' || user.role === 'developer') && berita.status === 'menunggu_persetujuan' && (
                                        <div className="grid grid-cols-2 gap-2 mt-1">
                                            <button onClick={() => handleReject(berita.id)} className="bg-red-50 text-red-700 hover:bg-red-500 hover:text-white py-2 rounded-xl font-bold transition text-sm">Tolak</button>
                                            <button onClick={() => handleApprove(berita.id)} className="bg-green-500 text-white hover:bg-green-600 py-2 rounded-xl font-bold transition text-sm flex justify-center items-center shadow-sm"><CheckCircle className="w-4 h-4 mr-1" /> Setujui</button>
                                        </div>
                                    )}

                                    {user.role === 'remaja' && (berita.status === 'ditolak' || berita.status === 'menunggu_persetujuan') && (
                                        <button onClick={() => handleEdit(berita)} className="w-full bg-amber-50 text-amber-700 hover:bg-amber-100 py-2 rounded-xl font-bold transition flex items-center justify-center text-sm mt-1">
                                            <Edit className="w-4 h-4 mr-2" /> {berita.status === 'ditolak' ? 'Perbaiki Berita' : 'Edit Draf'}
                                        </button>
                                    )}

                                    {user.role === 'developer' && (
                                        <button onClick={() => handleDelete(berita.id)} className="w-full text-red-600 text-xs font-bold border border-red-100 bg-white rounded-lg py-1.5 mt-1 hover:bg-red-50 transition">Hapus Permanen</button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* PAGINATION CONTROLS */}
            {!loading && totalPages > 1 && (
                <div className="mt-8 flex items-center justify-between bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                    <span className="text-sm text-gray-500">
                        Menampilkan halaman <span className="font-bold text-gray-800">{page}</span> dari <span className="font-bold text-gray-800">{totalPages}</span> 
                        <span className="hidden sm:inline"> (Total {totalData} Berita)</span>
                    </span>
                    <div className="flex gap-2">
                        <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-4 py-2 border border-gray-200 hover:bg-gray-50 rounded-lg text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed flex items-center transition"><ChevronLeft className="w-4 h-4 mr-1"/> Prev</button>
                        <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="px-4 py-2 border border-gray-200 hover:bg-gray-50 rounded-lg text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed flex items-center transition">Next <ChevronRight className="w-4 h-4 ml-1"/></button>
                    </div>
                </div>
            )}

            {/* Modal Pratinjau (Tetap Sama Seperti Sebelumnya) */}
            {isViewModalOpen && viewData && (
                <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden max-h-[90vh] flex flex-col">
                        <div className="flex justify-between items-center p-5 border-b border-gray-100 bg-gray-50/80">
                            <h3 className="font-bold text-lg text-gray-800 flex items-center"><Eye className="w-5 h-5 mr-2 text-primary"/> Pratinjau Artikel</h3>
                            <button onClick={() => setIsViewModalOpen(false)} className="text-gray-400 hover:text-gray-600 bg-gray-200 hover:bg-gray-300 p-1.5 rounded-full transition"><X className="w-5 h-5" /></button>
                        </div>
                        
                        <div className="p-6 md:p-8 overflow-y-auto flex-1 bg-white">
                            {viewData.thumbnail && (
                                <div className="w-full h-64 md:h-80 rounded-xl overflow-hidden mb-6 shadow-sm border border-gray-100"><img src={`http://47.236.145.121/storage/${viewData.thumbnail}`} alt={viewData.judul} className="w-full h-full object-cover" /></div>
                            )}
                            <div className="mb-4">{getStatusBadge(viewData.status)}</div>
                            <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-4 leading-tight">{viewData.judul}</h1>
                            <div className="flex flex-wrap gap-4 text-xs font-medium text-gray-500 mb-8 pb-6 border-b border-gray-100">
                                <span className="flex items-center bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100"><FileText className="w-4 h-4 mr-1.5 text-primary"/> Ditulis oleh: {viewData.penulis?.name || 'Anonim'}</span>
                                <span className="flex items-center bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100"><Clock className="w-4 h-4 mr-1.5 text-primary"/> {formatTanggal(viewData.created_at)}</span>
                                {viewData.link_youtube && (<a href={viewData.link_youtube} target="_blank" rel="noreferrer" className="flex items-center bg-red-50 text-red-600 hover:bg-red-100 px-3 py-1.5 rounded-full border border-red-100 transition"><Youtube className="w-4 h-4 mr-1.5"/> Tonton Video</a>)}
                            </div>
                            <div className="text-gray-700 leading-relaxed whitespace-pre-wrap text-sm md:text-base">{viewData.konten}</div>
                        </div>

                        <div className="p-4 border-t border-gray-100 bg-gray-50 flex flex-col md:flex-row justify-end gap-3">
                            <button onClick={() => setIsViewModalOpen(false)} className="px-5 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-100 transition font-bold text-sm order-2 md:order-1">Tutup</button>
                            {(user.role === 'panitia' || user.role === 'developer') && viewData.status === 'menunggu_persetujuan' && (
                                <div className="flex gap-2 w-full md:w-auto order-1 md:order-2">
                                    <button onClick={() => handleReject(viewData.id)} className="flex-1 md:flex-none px-6 py-2.5 bg-red-50 text-red-700 hover:bg-red-500 hover:text-white rounded-xl font-bold transition text-sm flex items-center justify-center border border-red-200"><XCircle className="w-4 h-4 mr-1.5" /> Tolak</button>
                                    <button onClick={() => handleApprove(viewData.id)} className="flex-1 md:flex-none px-6 py-2.5 bg-green-500 text-white hover:bg-green-600 rounded-xl font-bold transition text-sm flex items-center justify-center shadow-md"><CheckCircle className="w-4 h-4 mr-1.5" /> Setujui & Tayangkan</button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Edit/Tambah (Tetap Sama) */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden max-h-[90vh] flex flex-col">
                        <div className="flex justify-between items-center p-5 border-b bg-gray-50">
                            <h3 className="font-bold text-lg text-gray-800">{editId ? 'Perbaiki Artikel' : 'Tulis Artikel Baru'}</h3>
                            <button onClick={() => { setEditId(null); setFormData({ judul: '', konten: '', link_youtube: '', thumbnail: null }); setIsModalOpen(false); }} className="text-gray-400 hover:text-gray-600 bg-gray-200 p-1.5 rounded-full"><X className="w-5 h-5" /></button>
                        </div>
                        
                        <div className="p-6 md:p-8 overflow-y-auto flex-1">
                            {editId && user.role === 'remaja' && (
                                <div className="mb-6 bg-yellow-50 border border-yellow-200 text-yellow-800 p-4 rounded-xl text-sm flex items-start">
                                    <Clock className="w-5 h-5 mr-3 flex-shrink-0 mt-0.5" />
                                    <span><strong>Perhatian:</strong> Memperbaiki berita ini akan mengirimkannya kembali ke antrean Panitia untuk di-review ulang.</span>
                                </div>
                            )}
                            <form id="beritaForm" onSubmit={handleSubmit} className="space-y-5">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1.5">Judul Artikel <span className="text-red-500">*</span></label>
                                    <input type="text" name="judul" value={formData.judul} onChange={handleInputChange} required className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition" />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1.5">Isi Konten <span className="text-red-500">*</span></label>
                                    <textarea name="konten" value={formData.konten} onChange={handleInputChange} required rows="8" className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition"></textarea>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1.5">Foto Sampul (Thumbnail)</label>
                                        <div className="border-2 border-dashed border-gray-300 rounded-xl p-5 text-center hover:bg-gray-50 transition cursor-pointer relative">
                                            <ImageIcon className="w-10 h-10 mx-auto text-gray-300 mb-2" />
                                            <input type="file" accept="image/*" onChange={handleFileChange} className="w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:font-bold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 absolute inset-0 opacity-0 cursor-pointer" />
                                            <p className="text-xs text-primary font-bold">Klik untuk unggah foto</p>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1.5">Link YouTube (Opsional)</label>
                                        <div className="relative">
                                            <Youtube className="w-5 h-5 absolute left-3 top-3 text-gray-400" />
                                            <input type="url" name="link_youtube" placeholder="https://youtube.com/..." value={formData.link_youtube} onChange={handleInputChange} className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none transition text-sm" />
                                        </div>
                                    </div>
                                </div>
                            </form>
                        </div>

                        <div className="p-5 border-t bg-gray-50 flex gap-3 justify-end">
                            <button type="button" onClick={() => { setEditId(null); setFormData({ judul: '', konten: '', link_youtube: '', thumbnail: null }); setIsModalOpen(false); }} className="px-6 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-100 transition font-bold">Batal</button>
                            <button type="submit" form="beritaForm" disabled={submitLoading} className="px-6 py-2.5 bg-primary text-white rounded-xl shadow-md hover:bg-secondary transition font-bold flex items-center disabled:opacity-50">
                                {submitLoading ? 'Menyimpan...' : (editId ? 'Kirim Ulang Draf' : 'Kirim Berita')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}