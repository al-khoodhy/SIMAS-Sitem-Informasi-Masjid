// src/pages/Agenda.jsx
import { useState, useEffect } from 'react';
import { Calendar, Plus, Edit, Trash2, X, Clock, MapPin, RefreshCw } from 'lucide-react';
import api from '../api/axios';

export default function Agenda() {
    const user = JSON.parse(localStorage.getItem('user'));
    const [agendas, setAgendas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editId, setEditId] = useState(null);
    const [submitLoading, setSubmitLoading] = useState(false);
    const [selectedIds, setSelectedIds] = useState([]);

    const [formData, setFormData] = useState({
        judul: '', deskripsi: '', waktu_pelaksanaan: '', waktu_selesai: '', lokasi: "Masjid An-Nur Puloniti",
        is_recurring: false, recurrence_type: 'weekly', recurrence_interval: 2, recurrence_end_date: ''
    });

    useEffect(() => { fetchAgendas(); }, []);

    const fetchAgendas = async () => {
        setLoading(true);
        try {
            const res = await api.get('/agenda');
            setAgendas(res.data.data);
            setSelectedIds([]);
        } catch (error) { console.error(error); } finally { setLoading(false); }
    };

    // FUNGSI KONVERSI STRING TANGGAL KE FORMAT INPUT DATETIME-LOCAL
    const formatForInput = (dateStr) => {
        if (!dateStr) return '';
        // Ubah format MySQL (YYYY-MM-DD HH:mm:ss) menjadi format HTML (YYYY-MM-DDTHH:mm)
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
        // PERBAIKAN: Set nilai waktu_selesai jika ada
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
            setIsModalOpen(false); fetchAgendas();
        } catch (err) { alert("Gagal menyimpan data"); } finally { setSubmitLoading(false); }
    };

    // RENDER STATUS CERDAS
    const renderStatusBadge = (startStr, endStr) => {
        const now = new Date().getTime();
        const start = new Date(startStr).getTime();
        // Asumsi durasi 2 jam jika waktu selesai tidak diisi
        const end = endStr ? new Date(endStr).getTime() : start + (2 * 60 * 60 * 1000); 

        if (now < start) {
            return <span className="text-[10px] bg-green-100 text-green-700 px-2 py-1 rounded font-bold whitespace-nowrap ml-2">Akan Datang</span>;
        } else if (now >= start && now <= end) {
            return <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-1 rounded font-bold whitespace-nowrap ml-2 animate-pulse">Berlangsung</span>;
        } else {
            return <span className="text-[10px] bg-gray-200 text-gray-600 px-2 py-1 rounded font-bold whitespace-nowrap ml-2">Selesai</span>;
        }
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
        <div>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Manajemen Agenda</h1>
                    <p className="text-sm text-gray-500">Kelola seluruh jadwal kegiatan dengan rentang waktu lengkap.</p>
                </div>
                <button onClick={handleAdd} className="bg-primary text-white px-4 py-2 rounded-lg flex items-center shadow-sm hover:bg-secondary transition whitespace-nowrap">
                    <Plus className="w-5 h-5 mr-2" /> Tambah Agenda
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 md:p-6">
                
                {agendas.length > 0 && (
                    <div className="flex flex-col sm:flex-row justify-between items-center bg-blue-50/50 p-3 rounded-lg border border-blue-100 mb-4 gap-3">
                        <label className="flex items-center cursor-pointer select-none">
                            <input type="checkbox" checked={selectedIds.length === agendas.length && agendas.length > 0} onChange={handleSelectAll} className="w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary mr-3 cursor-pointer" />
                            <span className="font-bold text-sm text-blue-800">Pilih Semua ({agendas.length})</span>
                        </label>
                        {selectedIds.length > 0 && (user.role === 'developer' || user.role === 'panitia') && (
                            <button onClick={handleMassDelete} className="bg-red-100 text-red-600 hover:bg-red-500 hover:text-white px-4 py-1.5 rounded-lg text-sm font-bold transition flex items-center shadow-sm">
                                <Trash2 className="w-4 h-4 mr-2" /> Hapus {selectedIds.length} Terpilih
                            </button>
                        )}
                    </div>
                )}

                {loading ? <p className="text-center py-10 text-gray-500">Memuat...</p> : agendas.length === 0 ? (
                    <div className="text-center py-10"><Calendar className="w-12 h-12 text-gray-300 mx-auto mb-2"/><p className="text-gray-500">Belum ada agenda terjadwal.</p></div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {agendas.map(item => {
                            const isSelected = selectedIds.includes(item.id);
                            // Cek apakah sudah selesai untuk memberi efek transparan
                            const isPassed = new Date(item.waktu_selesai || new Date(item.waktu_pelaksanaan).getTime() + 7200000).getTime() < new Date().getTime();

                            return (
                                <div key={item.id} className={`p-4 rounded-xl border transition flex gap-3 
                                    ${isSelected ? 'border-primary bg-green-50/30' : isPassed ? 'bg-gray-50 border-gray-200 opacity-60' : 'bg-white border-blue-100 hover:border-blue-300 shadow-sm'}
                                `}>
                                    <div className="pt-1">
                                        <input type="checkbox" checked={isSelected} onChange={() => handleSelectOne(item.id)} className="w-5 h-5 text-primary rounded cursor-pointer" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className={`font-bold text-lg leading-tight ${isSelected ? 'text-primary' : 'text-gray-800'}`}>{item.judul}</h3>
                                            {renderStatusBadge(item.waktu_pelaksanaan, item.waktu_selesai)}
                                        </div>
                                        <div className="flex items-center text-xs font-medium text-primary mb-1 bg-blue-50 w-fit px-2 py-1 rounded">
                                            <Clock className="w-3.5 h-3.5 mr-1.5"/> {formatTimeDisplay(item.waktu_pelaksanaan, item.waktu_selesai)}
                                        </div>
                                        <div className="flex items-center text-sm text-gray-500 mb-3 mt-2"><MapPin className="w-4 h-4 mr-2 text-red-500"/> {item.lokasi}</div>
                                        <p className="text-sm text-gray-600 line-clamp-2 mb-4">{item.deskripsi}</p>
                                        
                                        <div className="flex gap-2 border-t border-gray-100 pt-3">
                                            <button onClick={() => handleEdit(item)} className="text-blue-600 text-xs font-bold bg-blue-50 px-3 py-1.5 rounded hover:bg-blue-100 transition">Edit</button>
                                            {(user.role === 'developer' || user.role === 'panitia') && (
                                                <button onClick={() => handleDelete(item.id)} className="text-red-600 text-xs font-bold bg-red-50 px-3 py-1.5 rounded hover:bg-red-100 transition">Hapus</button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Modal Tambah / Edit */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
                            <h3 className="font-bold text-lg">{editId ? 'Edit Jadwal' : 'Tambah Agenda Baru'}</h3>
                            <X onClick={()=>setIsModalOpen(false)} className="cursor-pointer text-gray-500 hover:text-gray-800"/>
                        </div>
                        
                        <div className="p-6 overflow-y-auto">
                            <form id="agendaForm" onSubmit={handleSubmit} className="space-y-4">
                                <div><label className="block text-sm font-bold text-gray-700 mb-1">Judul Agenda</label><input type="text" value={formData.judul} onChange={e=>setFormData({...formData, judul: e.target.value})} required className="w-full border p-2.5 rounded-lg focus:ring-primary outline-none" /></div>
                                
                                <div className="grid grid-cols-2 gap-4">
                                    <div><label className="block text-sm font-bold text-gray-700 mb-1">Waktu Mulai *</label><input type="datetime-local" value={formData.waktu_pelaksanaan} onChange={e=>setFormData({...formData, waktu_pelaksanaan: e.target.value})} required className="w-full border p-2.5 rounded-lg focus:ring-primary outline-none text-sm" /></div>
                                    <div><label className="block text-sm font-bold text-gray-700 mb-1">Waktu Selesai <span className="font-normal text-xs text-gray-400">(Opsional)</span></label><input type="datetime-local" value={formData.waktu_selesai} onChange={e=>setFormData({...formData, waktu_selesai: e.target.value})} min={formData.waktu_pelaksanaan} className="w-full border p-2.5 rounded-lg focus:ring-primary outline-none text-sm" /></div>
                                </div>

                                <div><label className="block text-sm font-bold text-gray-700 mb-1">Lokasi</label><input type="text" value={formData.lokasi} onChange={e=>setFormData({...formData, lokasi: e.target.value})} required className="w-full border p-2.5 rounded-lg focus:ring-primary outline-none" /></div>
                                <div><label className="block text-sm font-bold text-gray-700 mb-1">Deskripsi</label><textarea value={formData.deskripsi} onChange={e=>setFormData({...formData, deskripsi: e.target.value})} required rows="2" className="w-full border p-2.5 rounded-lg focus:ring-primary outline-none"></textarea></div>

                                {!editId && (
                                    <div className="mt-4 p-4 border border-blue-100 bg-blue-50/50 rounded-xl">
                                        <label className="flex items-center cursor-pointer mb-3">
                                            <input type="checkbox" checked={formData.is_recurring} onChange={e => setFormData({...formData, is_recurring: e.target.checked})} className="w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary mr-2" />
                                            <span className="font-bold text-blue-800 flex items-center"><RefreshCw className="w-4 h-4 mr-1" /> Ulangi Agenda Ini Otomatis</span>
                                        </label>
                                        {formData.is_recurring && (
                                            <div className="space-y-3 pl-6 border-l-2 border-blue-200">
                                                <div><label className="block text-xs font-bold text-gray-600 mb-1">Pola Pengulangan</label><select value={formData.recurrence_type} onChange={e => setFormData({...formData, recurrence_type: e.target.value})} className="w-full border p-2 rounded-lg bg-white text-sm outline-none"><option value="daily">Setiap Hari</option><option value="weekly">Setiap Minggu</option><option value="monthly">Setiap Bulan</option><option value="custom">Kustom (Pilih Hari)</option></select></div>
                                                {formData.recurrence_type === 'custom' && (
                                                    <div><label className="block text-xs font-bold text-gray-600 mb-1">Ulangi setiap berapa hari?</label><input type="number" min="1" value={formData.recurrence_interval} onChange={e => setFormData({...formData, recurrence_interval: e.target.value})} className="w-full border p-2 rounded-lg bg-white text-sm outline-none"/></div>
                                                )}
                                                <div>
                                                    <label className="block text-xs font-bold text-red-500 mb-1">Berhenti Diulang Pada Tanggal *</label>
                                                    <input type="date" value={formData.recurrence_end_date} onChange={e => setFormData({...formData, recurrence_end_date: e.target.value})} min={formData.waktu_pelaksanaan ? formData.waktu_pelaksanaan.split('T')[0] : ''} className="w-full border p-2 rounded-lg bg-white text-sm outline-none border-red-200" />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </form>
                        </div>
                        <div className="p-4 border-t bg-gray-50 flex justify-end gap-2"><button type="button" onClick={()=>setIsModalOpen(false)} className="px-5 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg text-sm font-bold">Batal</button><button type="submit" form="agendaForm" disabled={submitLoading} className="px-5 py-2.5 bg-primary text-white rounded-lg text-sm font-bold shadow-md disabled:opacity-50">{submitLoading ? 'Menyimpan...' : 'Simpan Agenda'}</button></div>
                    </div>
                </div>
            )}
        </div>
    );
}