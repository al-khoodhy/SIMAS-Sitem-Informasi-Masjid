import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, X, Megaphone, Info } from 'lucide-react';
import api from '../api/axios';

export default function ManajemenPengumuman() {
    const [pengumuman, setPengumuman] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editId, setEditId] = useState(null);
    const [submitLoading, setSubmitLoading] = useState(false);
    
    const [formData, setFormData] = useState({ judul: '', konten: '', tanggal_publish: new Date().toISOString().split('T')[0] });

    useEffect(() => { fetchPengumuman(); }, []);

    const fetchPengumuman = async () => {
        setLoading(true);
        try { const res = await api.get('/pengumuman'); setPengumuman(res.data.data); } 
        catch (err) { console.error(err); } finally { setLoading(false); }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitLoading(true);
        try {
            if (editId) await api.put(`/pengumuman/${editId}`, formData);
            else await api.post('/pengumuman', formData);
            setIsModalOpen(false); fetchPengumuman(); alert("Pengumuman berhasil disimpan!");
        } catch (error) { alert("Gagal menyimpan data."); } finally { setSubmitLoading(false); }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Hapus pengumuman ini?")) return;
        try { await api.delete(`/pengumuman/${id}`); fetchPengumuman(); } catch (err) { alert("Gagal hapus"); }
    };

    return (
        <div className="pb-10">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Manajemen Pengumuman</h1>
                    <p className="text-sm text-gray-500">Buat rilis daftar donatur, takjil, atau pemberitahuan umum.</p>
                </div>
                <button onClick={() => { setEditId(null); setFormData({ judul:'', konten:'', tanggal_publish: new Date().toISOString().split('T')[0] }); setIsModalOpen(true); }} className="bg-primary text-white px-4 py-2.5 rounded-xl font-bold flex items-center shadow-md">
                    <Plus className="w-5 h-5 mr-2" /> Buat Baru
                </button>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-sm text-left text-gray-600">
                    <thead className="bg-gray-50 text-gray-700 uppercase font-bold text-xs">
                        <tr><th className="px-6 py-4">Tgl Publish</th><th className="px-6 py-4">Judul Pengumuman</th><th className="px-6 py-4 text-center">Aksi</th></tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {loading ? <tr><td colSpan="3" className="text-center py-10">Memuat...</td></tr> : 
                         pengumuman.map(p => (
                            <tr key={p.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 font-bold text-primary">{p.tanggal_publish}</td>
                                <td className="px-6 py-4 font-bold text-gray-800">{p.judul}</td>
                                <td className="px-6 py-4 text-center flex justify-center gap-2">
                                    <button onClick={() => { setEditId(p.id); setFormData({judul: p.judul, konten: p.konten, tanggal_publish: p.tanggal_publish}); setIsModalOpen(true); }} className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-600 hover:text-white transition"><Edit className="w-4 h-4"/></button>
                                    <button onClick={() => handleDelete(p.id)} className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-600 hover:text-white transition"><Trash2 className="w-4 h-4"/></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="p-5 border-b bg-gray-50 flex justify-between items-center">
                            <h3 className="font-bold text-xl">{editId ? 'Edit Pengumuman' : 'Tulis Pengumuman'}</h3>
                            <button onClick={()=>setIsModalOpen(false)} className="text-gray-400 hover:text-gray-800 bg-gray-200 p-1.5 rounded-full"><X className="w-5 h-5"/></button>
                        </div>
                        <div className="p-6 overflow-y-auto">
                            <div className="bg-blue-50 border border-blue-100 p-3 rounded-xl mb-4 flex gap-3 text-sm text-blue-800">
                                <Info className="w-5 h-5 flex-shrink-0" />
                                <p><strong>Tips Format List:</strong> Gunakan tanda strip (-) di awal baris jika Anda ingin membuat daftar nama orang agar terlihat rapi.<br/>Contoh:<br/>- Bpk. Fulan (Rp 100.000)<br/>- Ibu Fulanah (Takjil 50 Box)</p>
                            </div>
                            <form id="pengumumanForm" onSubmit={handleSubmit} className="space-y-4">
                                <div><label className="block text-sm font-bold mb-1">Tgl Tampil di Web</label><input type="date" required value={formData.tanggal_publish} onChange={e=>setFormData({...formData, tanggal_publish: e.target.value})} className="w-full border p-3 rounded-xl outline-none focus:ring-2 focus:ring-primary" /></div>
                                <div><label className="block text-sm font-bold mb-1">Judul Utama</label><input type="text" required placeholder="Cth: Daftar Donatur Pembangunan Atap" value={formData.judul} onChange={e=>setFormData({...formData, judul: e.target.value})} className="w-full border p-3 rounded-xl outline-none focus:ring-2 focus:ring-primary" /></div>
                                <div><label className="block text-sm font-bold mb-1">Isi & Daftar Nama</label><textarea required rows="8" placeholder="Tulis rincian di sini..." value={formData.konten} onChange={e=>setFormData({...formData, konten: e.target.value})} className="w-full border p-3 rounded-xl outline-none focus:ring-2 focus:ring-primary"></textarea></div>
                            </form>
                        </div>
                        <div className="p-5 border-t flex justify-end gap-3 bg-gray-50">
                            <button type="button" onClick={()=>setIsModalOpen(false)} className="px-6 py-2.5 border rounded-xl font-bold bg-white text-gray-700">Batal</button>
                            <button type="submit" form="pengumumanForm" disabled={submitLoading} className="px-6 py-2.5 bg-primary text-white rounded-xl font-bold shadow-md disabled:opacity-50">{submitLoading ? 'Menyimpan...' : 'Terbitkan'}</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}