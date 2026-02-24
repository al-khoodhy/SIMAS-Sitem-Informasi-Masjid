// src/pages/VerifikasiDonasi.jsx
import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Clock, Eye, Edit, FileText } from 'lucide-react';
import api from '../api/axios';

export default function VerifikasiDonasi() {
    const [donasi, setDonasi] = useState([]);
    const [loading, setLoading] = useState(true);
    const [previewImage, setPreviewImage] = useState(null);

    // Edit State
    const [editData, setEditData] = useState(null);
    const [campaigns, setCampaigns] = useState([]);

    useEffect(() => {
        fetchDonasi();
        fetchCampaigns();
    }, []);

    const fetchDonasi = async () => {
        setLoading(true);
        try { const res = await api.get('/donasi'); setDonasi(res.data.data); } 
        catch (err) { console.error(err); } finally { setLoading(false); }
    };

    const fetchCampaigns = async () => {
        try { const res = await api.get('/campaign-donasi'); setCampaigns(res.data.data); } 
        catch (err) {}
    };

    const handleApprove = async (id) => {
        if (!window.confirm("Setujui donasi? Dana akan langsung masuk ke Laporan Keuangan dan target program.")) return;
        try { await api.post(`/donasi/${id}/approve`); fetchDonasi(); alert("Donasi berhasil disetujui!"); } 
        catch (err) { alert(err.response?.data?.message || "Gagal"); }
    };

    const handleReject = async (id) => {
        if (!window.confirm("Tolak donasi ini? (Struk tidak valid)")) return;
        try { await api.post(`/donasi/${id}/reject`); fetchDonasi(); } 
        catch (err) {}
    };

    const handleSaveEdit = async (e) => {
        e.preventDefault();
        try {
            await api.put(`/donasi/${editData.id}`, editData);
            setEditData(null); fetchDonasi(); alert("Data diperbarui");
        } catch (err) { alert("Gagal update"); }
    };

    const formatRupiah = (angka) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(angka || 0);
    const formatTanggal = (tanggal) => new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute:'2-digit' }).format(new Date(tanggal));

    return (
        <div>
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Verifikasi Donasi Masuk</h1>
                <p className="text-sm text-gray-500">Periksa bukti transfer warga sebelum memasukkannya ke pembukuan kas.</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto p-4">
                    <table className="w-full text-sm text-left text-gray-600">
                        <thead className="bg-gray-50 text-gray-700 uppercase font-medium text-xs">
                            <tr>
                                <th className="px-4 py-3">Tanggal</th>
                                <th className="px-4 py-3">Donatur</th>
                                <th className="px-4 py-3">Target Program</th>
                                <th className="px-4 py-3 text-right">Nominal</th>
                                <th className="px-4 py-3 text-center">Status</th>
                                <th className="px-4 py-3 text-center">Bukti</th>
                                <th className="px-4 py-3 text-center">Aksi (Review)</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? <tr><td colSpan="7" className="text-center py-10">Memuat...</td></tr> : 
                             donasi.length === 0 ? <tr><td colSpan="7" className="text-center py-10">Belum ada donasi masuk.</td></tr> :
                             donasi.map(d => (
                                <tr key={d.id} className="hover:bg-gray-50 transition">
                                    <td className="px-4 py-3 whitespace-nowrap">{formatTanggal(d.created_at)}</td>
                                    <td className="px-4 py-3 font-bold text-gray-800">
                                        {d.nama_donatur}
                                        {d.pesan && <div className="text-[10px] text-gray-500 font-normal italic leading-tight mt-1 line-clamp-2">"{d.pesan}"</div>}
                                    </td>
                                    <td className="px-4 py-3">{d.campaign_id == 0 || !d.campaign ? 'Infaq Kas Umum' : d.campaign.judul}</td>
                                    <td className="px-4 py-3 text-right font-bold text-primary">{formatRupiah(d.nominal)}</td>
                                    <td className="px-4 py-3 text-center">
                                        {d.status === 'disetujui' ? <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-bold"><CheckCircle className="w-3 h-3 mr-1 inline"/> Disetujui</span> :
                                         d.status === 'ditolak' ? <span className="bg-red-100 text-red-700 px-2 py-1 rounded text-xs font-bold"><XCircle className="w-3 h-3 mr-1 inline"/> Ditolak</span> :
                                         <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded text-xs font-bold animate-pulse"><Clock className="w-3 h-3 mr-1 inline"/> Menunggu</span>}
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        <button onClick={() => setPreviewImage(`http://47.236.145.121/storage/${d.bukti_transfer}`)} className="text-blue-600 hover:text-blue-800 hover:underline flex items-center justify-center w-full">
                                            <FileText className="w-4 h-4 mr-1"/> Cek Struk
                                        </button>
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        {d.status === 'menunggu' ? (
                                            <div className="flex gap-1 justify-center">
                                                <button onClick={() => setEditData(d)} className="bg-gray-100 text-gray-700 p-1.5 rounded hover:bg-gray-200" title="Edit Nominal/Nama"><Edit className="w-4 h-4"/></button>
                                                <button onClick={() => handleApprove(d.id)} className="bg-green-100 text-green-700 p-1.5 rounded hover:bg-green-500 hover:text-white" title="Setujui (Masuk Buku Kas)"><CheckCircle className="w-4 h-4"/></button>
                                                <button onClick={() => handleReject(d.id)} className="bg-red-100 text-red-700 p-1.5 rounded hover:bg-red-500 hover:text-white" title="Tolak Struk"><XCircle className="w-4 h-4"/></button>
                                            </div>
                                        ) : (
                                            <span className="text-xs text-gray-400">Oleh: {d.verifikator?.name}</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* MODAL PREVIEW STRUK */}
            {previewImage && (
                <div className="fixed inset-0 bg-black/80 z-[60] flex items-center justify-center p-4" onClick={() => setPreviewImage(null)}>
                    <img src={previewImage} alt="Bukti Transfer" className="max-w-full max-h-[90vh] rounded-lg shadow-2xl object-contain" />
                </div>
            )}

            {/* MODAL EDIT DATA DONASI (Meralat Nominal dsb) */}
            {editData && (
                <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
                        <div className="p-4 border-b bg-gray-50 flex justify-between"><h3 className="font-bold text-lg">Ralat Data Donasi</h3></div>
                        <div className="p-6">
                            <form id="editForm" onSubmit={handleSaveEdit} className="space-y-4">
                                <div><label className="block text-sm font-bold text-gray-700 mb-1">Nama Donatur</label><input type="text" value={editData.nama_donatur} onChange={e=>setEditData({...editData, nama_donatur: e.target.value})} className="w-full border p-2 rounded" /></div>
                                <div><label className="block text-sm font-bold text-gray-700 mb-1">Nominal Valid (Rp)</label><input type="number" value={editData.nominal} onChange={e=>setEditData({...editData, nominal: e.target.value})} className="w-full border p-2 rounded" /></div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Program</label>
                                    <select value={editData.campaign_id || 0} onChange={e=>setEditData({...editData, campaign_id: e.target.value})} className="w-full border p-2 rounded">
                                        <option value="0">Infaq Kas Umum</option>
                                        {campaigns.map(c => <option key={c.id} value={c.id}>{c.judul}</option>)}
                                    </select>
                                </div>
                            </form>
                        </div>
                        <div className="p-4 border-t bg-gray-50 flex justify-end gap-2">
                            <button onClick={() => setEditData(null)} className="px-4 py-2 bg-white border rounded">Batal</button>
                            <button type="submit" form="editForm" className="px-4 py-2 bg-blue-600 text-white rounded">Simpan Ralat</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}