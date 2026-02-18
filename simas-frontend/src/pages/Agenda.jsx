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

    // State Form ditambahkan fitur Recurrence
    const [formData, setFormData] = useState({
        judul: '', deskripsi: '', waktu_pelaksanaan: '', lokasi: "Masjid Jami' Puloniti",
        is_recurring: false,
        recurrence_type: 'weekly',
        recurrence_interval: 2,
        recurrence_end_date: ''
    });

    useEffect(() => { fetchAgendas(); }, []);

    const fetchAgendas = async () => {
        setLoading(true);
        try {
            const res = await api.get('/agenda');
            setAgendas(res.data.data);
        } catch (error) { console.error(error); } finally { setLoading(false); }
    };

    const handleAdd = () => {
        setEditId(null);
        setFormData({ 
            judul: '', deskripsi: '', waktu_pelaksanaan: '', lokasi: "Masjid Jami' Puloniti",
            is_recurring: false, recurrence_type: 'weekly', recurrence_interval: 2, recurrence_end_date: ''
        });
        setIsModalOpen(true);
    };

    const handleEdit = (item) => {
        setEditId(item.id);
        const dateFormatted = new Date(item.waktu_pelaksanaan).toISOString().slice(0, 16);
        // Saat Edit, fitur recurring dinonaktifkan (hanya edit 1 jadwal spesifik)
        setFormData({ 
            judul: item.judul, deskripsi: item.deskripsi, waktu_pelaksanaan: dateFormatted, lokasi: item.lokasi,
            is_recurring: false 
        });
        setIsModalOpen(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Hapus agenda ini?")) return;
        try { await api.delete(`/agenda/${id}`); fetchAgendas(); } catch (err) { alert("Gagal hapus"); }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validasi jika diulang, tanggal akhir wajib diisi
        if (formData.is_recurring && !formData.recurrence_end_date) {
            alert("Silakan tentukan Tanggal Batas Akhir Pengulangan!");
            return;
        }

        setSubmitLoading(true);
        try {
            const payload = { ...formData, waktu_pelaksanaan: formData.waktu_pelaksanaan.replace('T', ' ') };
            
            if (editId) {
                await api.put(`/agenda/${editId}`, payload);
                alert("Agenda berhasil diperbarui.");
            } else {
                const res = await api.post('/agenda', payload);
                alert(res.data.message || "Agenda berhasil dibuat.");
            }
            
            setIsModalOpen(false); fetchAgendas();
        } catch (err) { 
            alert("Gagal menyimpan data"); 
        } finally { 
            setSubmitLoading(false); 
        }
    };

    const formatDate = (dateString) => {
        const options = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' };
        return new Date(dateString).toLocaleDateString('id-ID', options);
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Manajemen Agenda</h1>
                    <p className="text-sm text-gray-500">Jadwalkan kajian rutin dengan fitur pengulangan otomatis.</p>
                </div>
                <button onClick={handleAdd} className="bg-primary text-white px-4 py-2 rounded-lg flex items-center shadow-sm hover:bg-secondary transition">
                    <Plus className="w-5 h-5 mr-2" /> Tambah Agenda
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                {loading ? <p className="text-center py-10 text-gray-500">Memuat...</p> : agendas.length === 0 ? (
                    <div className="text-center py-10"><Calendar className="w-12 h-12 text-gray-300 mx-auto mb-2"/><p className="text-gray-500">Belum ada agenda terjadwal.</p></div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {agendas.map(item => {
                            const isPassed = new Date(item.waktu_pelaksanaan) < new Date();
                            return (
                                <div key={item.id} className={`p-5 rounded-xl border transition ${isPassed ? 'bg-gray-50 border-gray-200 opacity-60' : 'bg-white border-blue-100 shadow-sm hover:shadow-md'}`}>
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="font-bold text-lg text-gray-800">{item.judul}</h3>
                                        {isPassed ? <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded font-bold">Selesai</span> : <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded font-bold">Akan Datang</span>}
                                    </div>
                                    <div className="flex items-center text-sm text-gray-500 mb-1"><Clock className="w-4 h-4 mr-2 text-primary"/> {formatDate(item.waktu_pelaksanaan)} WIB</div>
                                    <div className="flex items-center text-sm text-gray-500 mb-3"><MapPin className="w-4 h-4 mr-2 text-red-500"/> {item.lokasi}</div>
                                    <p className="text-sm text-gray-600 line-clamp-2 mb-4">{item.deskripsi}</p>
                                    
                                    <div className="flex gap-2 border-t pt-3">
                                        <button onClick={() => handleEdit(item)} className="text-blue-600 text-sm font-bold bg-blue-50 px-3 py-1.5 rounded hover:bg-blue-100 transition">Edit</button>
                                        {(user.role === 'developer' || user.role === 'panitia') && (
                                            <button onClick={() => handleDelete(item.id)} className="text-red-600 text-sm font-bold bg-red-50 px-3 py-1.5 rounded hover:bg-red-100 transition">Hapus</button>
                                        )}
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
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Judul Agenda</label>
                                    <input type="text" value={formData.judul} onChange={e=>setFormData({...formData, judul: e.target.value})} required className="w-full border p-2.5 rounded-lg focus:ring-primary outline-none" placeholder="Contoh: Kajian Fiqih Sunnah" />
                                </div>
                                
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1">Waktu Mulai</label>
                                        <input type="datetime-local" value={formData.waktu_pelaksanaan} onChange={e=>setFormData({...formData, waktu_pelaksanaan: e.target.value})} required className="w-full border p-2.5 rounded-lg focus:ring-primary outline-none" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1">Lokasi</label>
                                        <input type="text" value={formData.lokasi} onChange={e=>setFormData({...formData, lokasi: e.target.value})} required className="w-full border p-2.5 rounded-lg focus:ring-primary outline-none" />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Deskripsi & Pembicara</label>
                                    <textarea value={formData.deskripsi} onChange={e=>setFormData({...formData, deskripsi: e.target.value})} required rows="3" className="w-full border p-2.5 rounded-lg focus:ring-primary outline-none" placeholder="Contoh: Bersama Ustadz Fulan..."></textarea>
                                </div>

                                {/* FITUR PENGULANGAN (HANYA MUNCUL SAAT TAMBAH BARU) */}
                                {!editId && (
                                    <div className="mt-4 p-4 border border-blue-100 bg-blue-50/50 rounded-xl">
                                        <label className="flex items-center cursor-pointer mb-3">
                                            <input 
                                                type="checkbox" 
                                                checked={formData.is_recurring} 
                                                onChange={e => setFormData({...formData, is_recurring: e.target.checked})}
                                                className="w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary mr-2" 
                                            />
                                            <span className="font-bold text-blue-800 flex items-center">
                                                <RefreshCw className="w-4 h-4 mr-1" /> Ulangi Agenda Ini Otomatis
                                            </span>
                                        </label>

                                        {formData.is_recurring && (
                                            <div className="space-y-3 pl-6 border-l-2 border-blue-200">
                                                <div>
                                                    <label className="block text-xs font-bold text-gray-600 mb-1">Pola Pengulangan</label>
                                                    <select 
                                                        value={formData.recurrence_type} 
                                                        onChange={e => setFormData({...formData, recurrence_type: e.target.value})}
                                                        className="w-full border p-2 rounded-lg bg-white text-sm outline-none"
                                                    >
                                                        <option value="daily">Setiap Hari</option>
                                                        <option value="weekly">Setiap Minggu</option>
                                                        <option value="monthly">Setiap Bulan</option>
                                                        <option value="custom">Kustom (Pilih Hari)</option>
                                                    </select>
                                                </div>

                                                {formData.recurrence_type === 'custom' && (
                                                    <div>
                                                        <label className="block text-xs font-bold text-gray-600 mb-1">Ulangi setiap berapa hari?</label>
                                                        <input 
                                                            type="number" min="1"
                                                            value={formData.recurrence_interval} 
                                                            onChange={e => setFormData({...formData, recurrence_interval: e.target.value})}
                                                            className="w-full border p-2 rounded-lg bg-white text-sm outline-none"
                                                        />
                                                    </div>
                                                )}

                                                <div>
                                                    <label className="block text-xs font-bold text-red-500 mb-1">Berhenti Diulang Pada Tanggal *</label>
                                                    <input 
                                                        type="date" 
                                                        value={formData.recurrence_end_date} 
                                                        onChange={e => setFormData({...formData, recurrence_end_date: e.target.value})}
                                                        min={formData.waktu_pelaksanaan ? formData.waktu_pelaksanaan.split('T')[0] : ''}
                                                        className="w-full border p-2 rounded-lg bg-white text-sm outline-none border-red-200"
                                                    />
                                                    <p className="text-[10px] text-gray-500 mt-1">Sistem akan membuat jadwal otomatis sampai tanggal ini.</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </form>
                        </div>
                        
                        <div className="p-4 border-t bg-gray-50 flex justify-end gap-2">
                            <button type="button" onClick={()=>setIsModalOpen(false)} className="px-5 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg text-sm font-bold">Batal</button>
                            <button type="submit" form="agendaForm" disabled={submitLoading} className="px-5 py-2.5 bg-primary text-white rounded-lg text-sm font-bold shadow-md disabled:opacity-50">
                                {submitLoading ? 'Menyimpan...' : 'Simpan Agenda'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}