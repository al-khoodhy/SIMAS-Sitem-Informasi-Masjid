// src/pages/Muzakki.jsx
import { useState, useEffect, useRef } from 'react';
import { Users, Plus, Search, Edit, Trash2, X, Scale, Banknote, Calendar } from 'lucide-react';
import api from '../api/axios';

export default function Muzakki() {
    const [muzakkiList, setMuzakkiList] = useState([]);
    const [summary, setSummary] = useState({ total_beras_kg: 0, total_uang_fitrah: 0, total_uang_mal: 0, total_muzakki: 0 });
    const [loading, setLoading] = useState(true);
    
    // Pagination & Filter
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterTahun, setFilterTahun] = useState(new Date().getFullYear().toString());
    const typingTimeoutRef = useRef(null);

    // Modal
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editId, setEditId] = useState(null);
    const [submitLoading, setSubmitLoading] = useState(false);
    
    const [formData, setFormData] = useState({
        nama_muzakki: '', jenis_zakat: 'fitrah', bentuk_pembayaran: 'beras', nominal_uang: '', berat_beras_kg: '2.5', tahun: new Date().getFullYear().toString()
    });

    useEffect(() => {
        fetchMuzakki();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page, filterTahun]);

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => { setPage(1); fetchMuzakki(1, e.target.value); }, 500);
    };

    const fetchMuzakki = async (currentPage = page, search = searchTerm) => {
        setLoading(true);
        try {
            const res = await api.get('/muzakki', { params: { page: currentPage, search, tahun: filterTahun } });
            setMuzakkiList(res.data.data);
            setSummary(res.data.summary);
            setTotalPages(res.data.pagination.last_page);
        } catch (err) { console.error(err); } finally { setLoading(false); }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitLoading(true);
        try {
            // Pastikan data nol jika bentuknya berbeda
            const payload = { ...formData };
            if (payload.bentuk_pembayaran === 'beras') payload.nominal_uang = 0;
            if (payload.bentuk_pembayaran === 'uang') payload.berat_beras_kg = 0;

            if (editId) {
                await api.put(`/muzakki/${editId}`, payload);
            } else {
                await api.post('/muzakki', payload);
            }
            setIsModalOpen(false); fetchMuzakki(); alert("Data Muzaki tersimpan!");
        } catch (error) { alert("Gagal menyimpan data."); } finally { setSubmitLoading(false); }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Hapus data Muzaki ini?")) return;
        try { await api.delete(`/muzakki/${id}`); fetchMuzakki(); } catch (err) {}
    };

    const formatRupiah = (angka) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(angka || 0);

    return (
        <div className="pb-10">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Penerimaan Zakat (Muzaki)</h1>
                    <p className="text-sm text-gray-500">Catat pembayar zakat beserta rincian bentuk pembayarannya.</p>
                </div>
                <button onClick={() => { setEditId(null); setFormData({ nama_muzakki:'', jenis_zakat:'fitrah', bentuk_pembayaran:'beras', nominal_uang:'', berat_beras_kg:'2.5', tahun: filterTahun }); setIsModalOpen(true); }} className="bg-primary hover:bg-secondary text-white px-5 py-2.5 rounded-xl font-bold flex items-center shadow-md transition">
                    <Plus className="w-5 h-5 mr-2" /> Catat Muzaki
                </button>
            </div>

            {/* RINGKASAN */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white p-5 rounded-2xl border-b-4 border-b-green-500 shadow-sm">
                    <div className="flex items-center text-green-600 mb-2"><Scale className="w-5 h-5 mr-2"/> <span className="font-bold text-sm">Beras Fitrah</span></div>
                    <h3 className="text-2xl font-black text-gray-800">{summary.total_beras_kg} <span className="text-base text-gray-500 font-normal">Kg</span></h3>
                </div>
                <div className="bg-white p-5 rounded-2xl border-b-4 border-b-blue-500 shadow-sm">
                    <div className="flex items-center text-blue-600 mb-2"><Banknote className="w-5 h-5 mr-2"/> <span className="font-bold text-sm">Uang Fitrah</span></div>
                    <h3 className="text-xl font-black text-gray-800">{formatRupiah(summary.total_uang_fitrah)}</h3>
                </div>
                <div className="bg-white p-5 rounded-2xl border-b-4 border-b-purple-500 shadow-sm">
                    <div className="flex items-center text-purple-600 mb-2"><Banknote className="w-5 h-5 mr-2"/> <span className="font-bold text-sm">Uang Mal</span></div>
                    <h3 className="text-xl font-black text-gray-800">{formatRupiah(summary.total_uang_mal)}</h3>
                </div>
                <div className="bg-white p-5 rounded-2xl border-b-4 border-b-orange-500 shadow-sm">
                    <div className="flex items-center text-orange-600 mb-2"><Users className="w-5 h-5 mr-2"/> <span className="font-bold text-sm">Total Muzaki</span></div>
                    <h3 className="text-2xl font-black text-gray-800">{summary.total_muzakki} <span className="text-base text-gray-500 font-normal">Jiwa</span></h3>
                </div>
            </div>

            {/* TABEL DATA */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-4 border-b bg-gray-50/50 flex flex-col md:flex-row gap-4 justify-between">
                    <div className="relative w-full md:w-72">
                        <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                        <input type="text" placeholder="Cari nama muzaki..." value={searchTerm} onChange={handleSearchChange} className="w-full pl-9 pr-4 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-primary outline-none" />
                    </div>
                    <div className="flex items-center bg-white border rounded-xl px-3">
                        <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                        <select value={filterTahun} onChange={e=>setFilterTahun(e.target.value)} className="py-2 bg-transparent outline-none font-bold text-gray-700 text-sm cursor-pointer">
                            <option value="2026">Tahun 2026</option><option value="2025">Tahun 2025</option>
                        </select>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-600">
                        <thead className="bg-gray-50 text-gray-700 uppercase font-bold text-xs">
                            <tr><th className="px-6 py-4">Nama Muzaki</th><th className="px-6 py-4">Jenis Zakat</th><th className="px-6 py-4">Bentuk</th><th className="px-6 py-4 text-right">Jumlah</th><th className="px-6 py-4 text-center">Aksi</th></tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? <tr><td colSpan="5" className="text-center py-10">Memuat...</td></tr> : 
                             muzakkiList.length === 0 ? <tr><td colSpan="5" className="text-center py-10">Data tidak ditemukan.</td></tr> :
                             muzakkiList.map(m => (
                                <tr key={m.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 font-bold text-gray-800">{m.nama_muzakki}</td>
                                    <td className="px-6 py-4"><span className="bg-indigo-50 text-indigo-600 px-2 py-1 rounded font-bold capitalize">{m.jenis_zakat}</span></td>
                                    <td className="px-6 py-4 capitalize font-medium">{m.bentuk_pembayaran}</td>
                                    <td className="px-6 py-4 text-right font-bold text-primary">{m.bentuk_pembayaran === 'beras' ? `${m.berat_beras_kg} Kg` : formatRupiah(m.nominal_uang)}</td>
                                    <td className="px-6 py-4 text-center">
                                        <button onClick={() => { setEditId(m.id); setFormData(m); setIsModalOpen(true); }} className="p-1.5 bg-blue-50 text-blue-600 rounded mr-2 hover:bg-blue-100"><Edit className="w-4 h-4"/></button>
                                        <button onClick={() => handleDelete(m.id)} className="p-1.5 bg-red-50 text-red-600 rounded hover:bg-red-100"><Trash2 className="w-4 h-4"/></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* MODAL FORM MUZAKI */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
                        <div className="p-4 border-b bg-gray-50 flex justify-between"><h3 className="font-bold text-lg">{editId ? 'Edit Muzaki' : 'Catat Muzaki Baru'}</h3><X onClick={()=>setIsModalOpen(false)} className="cursor-pointer text-gray-500"/></div>
                        <div className="p-6">
                            <form id="muzakkiForm" onSubmit={handleSubmit} className="space-y-4">
                                <div><label className="block text-sm font-bold mb-1">Nama Pembayar (Muzaki)</label><input type="text" required value={formData.nama_muzakki} onChange={e=>setFormData({...formData, nama_muzakki: e.target.value})} className="w-full border p-2.5 rounded-lg outline-none" /></div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div><label className="block text-sm font-bold mb-1">Jenis Zakat</label><select value={formData.jenis_zakat} onChange={e=>setFormData({...formData, jenis_zakat: e.target.value})} className="w-full border p-2.5 rounded-lg bg-white outline-none"><option value="fitrah">Zakat Fitrah</option><option value="mal">Zakat Mal</option></select></div>
                                    <div><label className="block text-sm font-bold mb-1">Tahun Pembayaran</label><input type="number" required value={formData.tahun} onChange={e=>setFormData({...formData, tahun: e.target.value})} className="w-full border p-2.5 rounded-lg outline-none" /></div>
                                </div>
                                <div><label className="block text-sm font-bold mb-1">Bentuk Pembayaran</label><select value={formData.bentuk_pembayaran} onChange={e=>setFormData({...formData, bentuk_pembayaran: e.target.value})} className="w-full border p-2.5 rounded-lg bg-white outline-none"><option value="beras">Beras (Kg)</option><option value="uang">Uang Tunai</option></select></div>
                                
                                {formData.bentuk_pembayaran === 'beras' ? (
                                    <div><label className="block text-sm font-bold mb-1">Berat Beras (Kg)</label><input type="number" step="0.1" required value={formData.berat_beras_kg} onChange={e=>setFormData({...formData, berat_beras_kg: e.target.value})} className="w-full border p-2.5 rounded-lg outline-none font-bold text-primary" /></div>
                                ) : (
                                    <div><label className="block text-sm font-bold mb-1">Nominal Uang (Rp)</label><input type="number" required value={formData.nominal_uang} onChange={e=>setFormData({...formData, nominal_uang: e.target.value})} className="w-full border p-2.5 rounded-lg outline-none font-bold text-primary" /></div>
                                )}
                            </form>
                        </div>
                        <div className="p-4 border-t flex justify-end gap-2"><button type="button" onClick={()=>setIsModalOpen(false)} className="px-5 py-2.5 border rounded-lg font-bold">Batal</button><button type="submit" form="muzakkiForm" disabled={submitLoading} className="px-5 py-2.5 bg-primary text-white rounded-lg font-bold shadow">{submitLoading ? 'Menyimpan...' : 'Simpan Data'}</button></div>
                    </div>
                </div>
            )}
        </div>
    );
}