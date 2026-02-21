// src/pages/Agenda.jsx
import { useState, useEffect, useRef } from 'react';
import { Calendar, Plus, Edit, Trash2, X, Clock, MapPin, RefreshCw, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import api from '../api/axios';

export default function Agenda() {
    const user = JSON.parse(localStorage.getItem('user'));
    
    // State Utama
    const [agendas, setAgendas] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // State Optimasi (Pagination & Search)
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalData, setTotalData] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');
    const typingTimeoutRef = useRef(null);

    // State Modal & Aksi
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editId, setEditId] = useState(null);
    const [submitLoading, setSubmitLoading] = useState(false);
    const [selectedIds, setSelectedIds] = useState([]);

    const [formData, setFormData] = useState({
        judul: '', deskripsi: '', waktu_pelaksanaan: '', waktu_selesai: '', lokasi: "Masjid An-Nur Puloniti",
        is_recurring: false, recurrence_type: 'weekly', recurrence_interval: 2, recurrence_end_date: ''
    });

    useEffect(() => { 
        fetchAgendas(); 
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page]);

    // Fitur Debounce Search (Anti-Spam API)
    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => {
            setPage(1); 
            fetchAgendas(1, e.target.value);
        }, 500);
    };

    const fetchAgendas = async (currentPage = page, search = searchTerm) => {
        setLoading(true);
        try {
            const params = { page: currentPage };
            if (search.trim() !== '') params.search = search;

            const res = await api.get('/agenda', { params });
            const responseData = res.data;

            setAgendas(responseData.data || []);
            setSelectedIds([]); // Reset selection saat pindah halaman
            
            if (responseData.pagination) {
                setTotalPages(responseData.pagination.last_page || 1);
                setTotalData(responseData.pagination.total || 0);
            }
        } catch (error) { 
            console.error(error); 
        } finally { 
            setLoading(false); 
        }
    };

    // FUNGSI KONVERSI STRING TANGGAL KE FORMAT INPUT DATETIME-LOCAL
    const formatForInput = (dateStr) => {
        if (!dateStr) return '';
        return dateStr.replace(' ', 'T').substring(0, 16);
    };

    const handleAdd = () => {
        setEditId(null);
        setFormData({ 
            judul: '', deskripsi: '', waktu_pelaksanaan: '', waktu_selesai: '', lokasi: "Masjid An-Nur Puloniti",
            is_recurring: false, recurrence_type: 'weekly', recurrence_interval: 2, recurrence_end_date: ''
        });
        setIsModalOpen(true);
    };

    const handleEdit = (item) => {
        setEditId(item.id);
        setFormData({ 
            judul: item.judul, 
            deskripsi: item.deskripsi, 
            waktu_pelaksanaan: formatForInput(item.waktu_pelaksanaan), 
            waktu_selesai: formatForInput(item.waktu_selesai), 
            lokasi: item.lokasi,
            is_recurring: false 
        });
        setIsModalOpen(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Hapus agenda ini?")) return;
        try { await api.delete(`/agenda/${id}`); fetchAgendas(); } catch (err) { alert("Gagal hapus"); }
    };

    const handleSelectAll = (e) => {
        if (e.target.checked) setSelectedIds(agendas.map(item => item.id));
        else setSelectedIds([]);
    };

    const handleSelectOne = (id) => {
        setSelectedIds(prev => prev.includes(id) ? prev.filter(itemId => itemId !== id) : [...prev, id]);
    };

    const handleMassDelete = async () => {
        if (!window.confirm(`AWAS! Anda akan menghapus ${selectedIds.length} agenda sekaligus. Yakin?`)) return;
        try {
            await api.post('/agenda/mass-destroy', { ids: selectedIds });
            alert(`${selectedIds.length} Agenda berhasil dihapus!`);
            fetchAgendas();
        } catch (err) { alert("Gagal menghapus data massal."); }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formData.is_recurring && !formData.recurrence_end_date) {
            alert("Silakan tentukan Tanggal Batas Akhir Pengulangan!"); return;
        }

        setSubmitLoading(true);
        try {
            const payload = { 
                ...formData, 
                waktu_pelaksanaan: formData.waktu_pelaksanaan.replace('T', ' '),
                waktu_selesai: formData.waktu_selesai ? formData.waktu_selesai.replace('T', ' ') : null,
                recurrence_end_date: formData.recurrence_end_date ? formData.recurrence_end_date : null
            };
            
            if (editId) {
                await api.put(`/agenda/${editId}`, payload);
                alert("Agenda berhasil diperbarui.");
            } else {
                await api.post('/agenda', payload);
                alert("Agenda berhasil dibuat.");
            }
            setIsModalOpen(false); 
            setPage(1); fetchAgendas(1);
        } catch (err) { alert("Gagal menyimpan data"); } finally { setSubmitLoading(false); }
    };

    // RENDER STATUS CERDAS
    const renderStatusBadge = (startStr, endStr) => {
        const now = new Date().getTime();
        const start = new Date(startStr).getTime();
        const end = endStr ? new Date(endStr).getTime() : start + (2 * 60 * 60 * 1000); 

        if (now < start) return <span className="text-[10px] bg-green-100 text-green-700 px-2 py-1 rounded font-bold whitespace-nowrap ml-2">Akan Datang</span>;
        else if (now >= start && now <= end) return <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-1 rounded font-bold whitespace-nowrap ml-2 animate-pulse">Berlangsung</span>;
        else return <span className="text-[10px] bg-gray-200 text-gray-600 px-2 py-1 rounded font-bold whitespace-nowrap ml-2">Selesai</span>;
    };

    // RENDER FORMAT WAKTU LENGKAP
    const formatTimeDisplay = (startStr, endStr) => {
        const startDate = new Date(startStr);
        const dateFormatted = startDate.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
        const timeStart = startDate.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
        const timeEnd = endStr ? new Date(endStr).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : 'Selesai';
        return `${dateFormatted} • ${timeStart} - ${timeEnd} WIB`;
    };

    return (
        <div className="pb-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Manajemen Agenda</h1>
                    <p className="text-sm text-gray-500">Kelola seluruh jadwal kegiatan dengan rentang waktu lengkap.</p>
                </div>
                <button onClick={handleAdd} className="bg-primary text-white px-5 py-2.5 rounded-xl font-bold flex items-center shadow-md hover:bg-secondary transition whitespace-nowrap">
                    <Plus className="w-5 h-5 mr-2" /> Tambah Agenda
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                
                {/* Alat Pencarian & Mass Action */}
                <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4 bg-gray-50/50">
                    <div className="relative w-full sm:w-80">
                        <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                        <input type="text" placeholder="Cari judul atau lokasi..." value={searchTerm} onChange={handleSearchChange} className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary outline-none transition" />
                    </div>

                    {agendas.length > 0 && (
                        <div className="flex items-center gap-3 w-full sm:w-auto">
                            <label className="flex items-center cursor-pointer select-none bg-blue-50 text-blue-800 px-3 py-2 rounded-lg border border-blue-100">
                                <input type="checkbox" checked={selectedIds.length === agendas.length && agendas.length > 0} onChange={handleSelectAll} className="w-4 h-4 text-primary rounded focus:ring-primary mr-2 cursor-pointer" />
                                <span className="font-bold text-sm">Pilih Semua</span>
                            </label>
                            {selectedIds.length > 0 && (user.role === 'developer' || user.role === 'panitia') && (
                                <button onClick={handleMassDelete} className="bg-red-100 text-red-600 hover:bg-red-500 hover:text-white px-4 py-2 rounded-lg text-sm font-bold transition flex items-center shadow-sm">
                                    <Trash2 className="w-4 h-4 mr-1.5" /> Hapus {selectedIds.length}
                                </button>
                            )}
                        </div>
                    )}
                </div>

                {/* Area Daftar Agenda */}
                <div className="p-4 md:p-6 bg-gray-50/30">
                    {loading ? <div className="text-center py-10 text-gray-500 flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary mr-3"></div> Memuat server...</div> : agendas.length === 0 ? (
                        <div className="text-center py-12 bg-white rounded-xl border border-gray-100"><Calendar className="w-16 h-16 text-gray-300 mx-auto mb-3"/><p className="text-gray-500 font-medium">Agenda tidak ditemukan.</p></div>
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            {agendas.map(item => {
                                const isSelected = selectedIds.includes(item.id);
                                const isPassed = new Date(item.waktu_selesai || new Date(item.waktu_pelaksanaan).getTime() + 7200000).getTime() < new Date().getTime();

                                return (
                                    <div key={item.id} className={`p-5 rounded-2xl border transition duration-300 flex gap-4 
                                        ${isSelected ? 'border-primary bg-green-50/40 shadow-sm' : isPassed ? 'bg-gray-50 border-gray-200 opacity-70 grayscale-[30%]' : 'bg-white border-blue-100 hover:border-blue-300 hover:shadow-md'}
                                    `}>
                                        <div className="pt-1">
                                            <input type="checkbox" checked={isSelected} onChange={() => handleSelectOne(item.id)} className="w-5 h-5 text-primary rounded cursor-pointer" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex justify-between items-start mb-2">
                                                <h3 className={`font-bold text-lg leading-tight ${isSelected ? 'text-primary' : 'text-gray-800'}`}>{item.judul}</h3>
                                                {renderStatusBadge(item.waktu_pelaksanaan, item.waktu_selesai)}
                                            </div>
                                            <div className="flex items-center text-xs font-bold text-primary mb-2 bg-blue-50/80 w-fit px-2.5 py-1.5 rounded-md border border-blue-100">
                                                <Clock className="w-3.5 h-3.5 mr-1.5"/> {formatTimeDisplay(item.waktu_pelaksanaan, item.waktu_selesai)}
                                            </div>
                                            <div className="flex items-center text-sm text-gray-500 mb-3"><MapPin className="w-4 h-4 mr-1.5 text-red-400"/> {item.lokasi}</div>
                                            <p className="text-sm text-gray-600 line-clamp-2 mb-4 leading-relaxed">{item.deskripsi}</p>
                                            
                                            <div className="flex gap-2 border-t border-gray-100 pt-4">
                                                <button onClick={() => handleEdit(item)} className="text-blue-600 text-xs font-bold bg-blue-50 px-4 py-2 rounded-lg hover:bg-blue-600 hover:text-white transition flex items-center"><Edit className="w-3.5 h-3.5 mr-1.5"/> Edit</button>
                                                {(user.role === 'developer' || user.role === 'panitia') && (
                                                    <button onClick={() => handleDelete(item.id)} className="text-red-600 text-xs font-bold bg-red-50 px-4 py-2 rounded-lg hover:bg-red-600 hover:text-white transition flex items-center"><Trash2 className="w-3.5 h-3.5 mr-1.5"/> Hapus</button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* PAGINATION CONTROLS */}
                {!loading && totalPages > 1 && (
                    <div className="p-4 border-t border-gray-100 flex items-center justify-between bg-white">
                        <span className="text-sm text-gray-500">
                            Halaman <span className="font-bold text-gray-800">{page}</span> dari <span className="font-bold text-gray-800">{totalPages}</span> 
                            <span className="hidden sm:inline"> (Total {totalData} Agenda)</span>
                        </span>
                        <div className="flex gap-2">
                            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-4 py-2 border border-gray-200 hover:bg-gray-50 rounded-lg text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed flex items-center transition"><ChevronLeft className="w-4 h-4 mr-1"/> Prev</button>
                            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="px-4 py-2 border border-gray-200 hover:bg-gray-50 rounded-lg text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed flex items-center transition">Next <ChevronRight className="w-4 h-4 ml-1"/></button>
                        </div>
                    </div>
                )}
            </div>

            {/* Modal Tambah / Edit */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="p-5 border-b bg-gray-50 flex justify-between items-center">
                            <h3 className="font-bold text-xl text-gray-800">{editId ? 'Ralat Jadwal' : 'Tambah Agenda Baru'}</h3>
                            <button onClick={()=>setIsModalOpen(false)} className="text-gray-400 hover:text-gray-800 bg-gray-200 p-1.5 rounded-full transition"><X className="w-5 h-5"/></button>
                        </div>
                        
                        <div className="p-6 overflow-y-auto">
                            <form id="agendaForm" onSubmit={handleSubmit} className="space-y-4">
                                <div><label className="block text-sm font-bold text-gray-700 mb-1.5">Judul Agenda</label><input type="text" value={formData.judul} onChange={e=>setFormData({...formData, judul: e.target.value})} required placeholder="Contoh: Pengajian Rutin" className="w-full border border-gray-300 p-3 rounded-xl focus:ring-2 focus:ring-primary outline-none transition" /></div>
                                
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div><label className="block text-sm font-bold text-gray-700 mb-1.5">Waktu Mulai *</label><input type="datetime-local" value={formData.waktu_pelaksanaan} onChange={e=>setFormData({...formData, waktu_pelaksanaan: e.target.value})} required className="w-full border border-gray-300 p-3 rounded-xl focus:ring-2 focus:ring-primary outline-none text-sm transition" /></div>
                                    <div><label className="block text-sm font-bold text-gray-700 mb-1.5">Waktu Selesai <span className="font-normal text-xs text-gray-400">(Opsional)</span></label><input type="datetime-local" value={formData.waktu_selesai} onChange={e=>setFormData({...formData, waktu_selesai: e.target.value})} min={formData.waktu_pelaksanaan} className="w-full border border-gray-300 p-3 rounded-xl focus:ring-2 focus:ring-primary outline-none text-sm transition" /></div>
                                </div>

                                <div><label className="block text-sm font-bold text-gray-700 mb-1.5">Lokasi</label><input type="text" value={formData.lokasi} onChange={e=>setFormData({...formData, lokasi: e.target.value})} required className="w-full border border-gray-300 p-3 rounded-xl focus:ring-2 focus:ring-primary outline-none transition" /></div>
                                <div><label className="block text-sm font-bold text-gray-700 mb-1.5">Deskripsi</label><textarea value={formData.deskripsi} onChange={e=>setFormData({...formData, deskripsi: e.target.value})} required rows="3" placeholder="Tuliskan keterangan detail terkait agenda ini..." className="w-full border border-gray-300 p-3 rounded-xl focus:ring-2 focus:ring-primary outline-none transition"></textarea></div>

                                {!editId && (
                                    <div className="mt-5 p-5 border border-blue-200 bg-blue-50/50 rounded-2xl">
                                        <label className="flex items-center cursor-pointer mb-3">
                                            <input type="checkbox" checked={formData.is_recurring} onChange={e => setFormData({...formData, is_recurring: e.target.checked})} className="w-5 h-5 text-primary rounded border-gray-300 focus:ring-primary mr-3" />
                                            <span className="font-bold text-blue-800 flex items-center"><RefreshCw className="w-4 h-4 mr-2" /> Ulangi Agenda Ini Otomatis</span>
                                        </label>
                                        {formData.is_recurring && (
                                            <div className="space-y-4 pl-8 border-l-2 border-blue-300 mt-2">
                                                <div><label className="block text-xs font-bold text-gray-700 mb-1">Pola Pengulangan</label><select value={formData.recurrence_type} onChange={e => setFormData({...formData, recurrence_type: e.target.value})} className="w-full border border-blue-200 p-2.5 rounded-lg bg-white text-sm outline-none focus:ring-1 focus:ring-primary"><option value="daily">Setiap Hari</option><option value="weekly">Setiap Minggu</option><option value="monthly">Setiap Bulan</option><option value="custom">Kustom (Pilih Hari)</option></select></div>
                                                {formData.recurrence_type === 'custom' && (
                                                    <div><label className="block text-xs font-bold text-gray-700 mb-1">Ulangi setiap berapa hari?</label><input type="number" min="1" value={formData.recurrence_interval} onChange={e => setFormData({...formData, recurrence_interval: e.target.value})} className="w-full border border-blue-200 p-2.5 rounded-lg bg-white text-sm outline-none focus:ring-1 focus:ring-primary"/></div>
                                                )}
                                                <div>
                                                    <label className="block text-xs font-bold text-red-600 mb-1">Berhenti Diulang Pada Tanggal *</label>
                                                    <input type="date" value={formData.recurrence_end_date} onChange={e => setFormData({...formData, recurrence_end_date: e.target.value})} min={formData.waktu_pelaksanaan ? formData.waktu_pelaksanaan.split('T')[0] : ''} className="w-full border border-red-200 p-2.5 rounded-lg bg-red-50 text-sm outline-none focus:ring-1 focus:ring-red-400" />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </form>
                        </div>
                        <div className="p-5 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
                            <button type="button" onClick={()=>setIsModalOpen(false)} className="px-6 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-xl text-sm font-bold hover:bg-gray-100 transition">Batal</button>
                            <button type="submit" form="agendaForm" disabled={submitLoading} className="px-6 py-2.5 bg-primary text-white rounded-xl text-sm font-bold shadow-md hover:bg-secondary transition disabled:opacity-50 flex items-center">
                                {submitLoading ? 'Menyimpan...' : 'Simpan Jadwal'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}