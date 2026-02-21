import { useState } from 'react';
import { Heart, X } from 'lucide-react';
import { formatRupiah } from '../../utils/formatters';
import api from '../../api/axios'; // Pastikan path import axios Anda benar

export default function DonasiSection({ campaignsData }) {
    // 1. STATE UNTUK FORM & MODAL DONASI
    const [isDonasiModalOpen, setIsDonasiModalOpen] = useState(false);
    const [donasiSubmitLoading, setDonasiSubmitLoading] = useState(false);
    const [formDonasi, setFormDonasi] = useState({ 
        campaign_id: '', 
        nama_donatur: '', 
        nominal: '', 
        pesan: '', 
        bukti_transfer: null 
    });

    // 2. FUNGSI SUBMIT DONASI
    const handleDonasiSubmit = async (e) => {
        e.preventDefault();
        setDonasiSubmitLoading(true);

        const formData = new FormData();
        formData.append('campaign_id', formDonasi.campaign_id);
        formData.append('nama_donatur', formDonasi.nama_donatur);
        formData.append('nominal', formDonasi.nominal);
        formData.append('pesan', formDonasi.pesan);
        if (formDonasi.bukti_transfer) {
            formData.append('bukti_transfer', formDonasi.bukti_transfer);
        }

        try {
            const res = await api.post('/public/donasi', formData, { 
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            alert(res.data.message || "Bukti transfer berhasil dikirim. Terima kasih atas donasi Anda.");
            setIsDonasiModalOpen(false);
            setFormDonasi({ campaign_id: '', nama_donatur: '', nominal: '', pesan: '', bukti_transfer: null });
        } catch (error) {
            alert(error.response?.data?.message || "Terjadi kesalahan. Pastikan file gambar berukuran max 2MB.");
        } finally {
            setDonasiSubmitLoading(false);
        }
    };

    return (
        <section id="donasi" className="bg-white py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">Target Pengadaan & Wakaf</h2>
                    <p className="text-gray-500 max-w-2xl mx-auto">Mari bersama-sama mewujudkan fasilitas ibadah yang nyaman bagi seluruh jamaah Masjid An-Nur Puloniti.</p>
                    
                    {/* 3. TOMBOL TRIGGER MODAL */}
                    <div className="mt-6">
                        <button 
                            onClick={() => setIsDonasiModalOpen(true)} 
                            className="bg-primary text-white font-bold px-8 py-3 rounded-full hover:bg-secondary hover:shadow-lg transition-all shadow-md animate-bounce"
                        >
                            Konfirmasi Transfer Donasi
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {!campaignsData || campaignsData.length === 0 ? (
                        <div className="col-span-full text-center text-gray-500 py-10 bg-gray-50 rounded-xl border border-gray-100">Belum ada program donasi aktif saat ini.</div>
                    ) : (
                        campaignsData.map(cam => {
                            const persen = Math.min((cam.terkumpul_nominal / cam.target_nominal) * 100, 100).toFixed(1);
                            return (
                                <article key={cam.id} className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-shadow border border-gray-100 overflow-hidden group">
                                    <div className="p-6">
                                        <h3 className="text-xl font-bold text-gray-800 mb-2 line-clamp-2">{cam.judul}</h3>
                                        <p className="text-gray-500 text-sm mb-6 line-clamp-3 leading-relaxed">{cam.deskripsi}</p>
                                        <div className="mb-2 flex justify-between text-sm font-bold"><span className="text-primary">{formatRupiah(cam.terkumpul_nominal)}</span><span className="text-gray-400">/ {formatRupiah(cam.target_nominal)}</span></div>
                                        <div className="w-full bg-gray-100 rounded-full h-2.5 mb-2 overflow-hidden"><div className="bg-primary h-2.5 rounded-full" style={{ width: `${persen}%` }}></div></div>
                                        <p className="text-xs text-gray-500 text-right mb-6">{persen}% Terkumpul</p>
                                        <div className="bg-gray-50 p-4 rounded-xl border border-dashed border-gray-300 text-center">
                                            <p className="text-xs text-gray-500 mb-1">Transfer Rekening BSI</p>
                                            <p className="font-bold text-gray-800 tracking-wider text-lg">7123 4567 890</p>
                                            <p className="text-xs text-gray-500 mt-1">a.n Masjid An-Nur Puloniti</p>
                                        </div>
                                    </div>
                                </article>
                            );
                        })
                    )}
                </div>
            </div>

            {/* 4. MODAL KONFIRMASI DONASI */}
            {isDonasiModalOpen && (
                <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="p-5 border-b bg-gray-50 flex justify-between items-center">
                            <h3 className="font-bold text-xl text-gray-800 flex items-center">
                                <Heart className="w-5 h-5 mr-2 text-red-500 fill-current"/> Konfirmasi Transfer
                            </h3>
                            <button onClick={() => setIsDonasiModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <X className="w-6 h-6"/>
                            </button>
                        </div>
                        
                        <div className="p-6 overflow-y-auto flex-1">
                            <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl mb-6 text-sm text-blue-800">
                                Silakan transfer ke rekening <strong>BSI 7123 4567 890 a.n Masjid An-Nur</strong>, lalu unggah bukti transfer di bawah ini.
                            </div>
                            <form id="formDonasi" onSubmit={handleDonasiSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Pilih Program / Target Donasi *</label>
                                    <select required value={formDonasi.campaign_id} onChange={e=>setFormDonasi({...formDonasi, campaign_id: e.target.value})} className="w-full border p-3 rounded-lg outline-none bg-white focus:ring-2 focus:ring-primary">
                                        <option value="" disabled>-- Pilih Program --</option>
                                        <option value="0">💰 Infaq Kas Umum Masjid</option>
                                        {/* OPTIMASI: Pastikan campaignsData dirender dengan aman */}
                                        {campaignsData && campaignsData.map(c => <option key={c.id} value={c.id}>🎯 {c.judul}</option>)}
                                    </select>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1">Nama Donatur</label>
                                        <input type="text" placeholder="Kosongkan jika Hamba Allah" value={formDonasi.nama_donatur} onChange={e=>setFormDonasi({...formDonasi, nama_donatur: e.target.value})} className="w-full border p-3 rounded-lg outline-none focus:ring-2 focus:ring-primary" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1">Nominal Transfer (Rp) *</label>
                                        <input type="number" required min="10000" placeholder="Contoh: 50000" value={formDonasi.nominal} onChange={e=>setFormDonasi({...formDonasi, nominal: e.target.value})} className="w-full border p-3 rounded-lg outline-none focus:ring-2 focus:ring-primary" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Pesan / Doa (Opsional)</label>
                                    <textarea rows="2" placeholder="Tuliskan doa agar diaminkan jamaah..." value={formDonasi.pesan} onChange={e=>setFormDonasi({...formDonasi, pesan: e.target.value})} className="w-full border p-3 rounded-lg outline-none focus:ring-2 focus:ring-primary"></textarea>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Upload Bukti Transfer / Struk *</label>
                                    <input type="file" required accept="image/*" onChange={e => setFormDonasi({...formDonasi, bukti_transfer: e.target.files[0]})} className="w-full border p-2 rounded-lg text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-primary/10 file:text-primary" />
                                </div>
                            </form>
                        </div>

                        <div className="p-4 border-t bg-gray-50 flex justify-end gap-3">
                            <button type="button" onClick={() => setIsDonasiModalOpen(false)} className="px-5 py-2.5 bg-white border border-gray-300 rounded-lg font-bold text-gray-600 hover:bg-gray-100 transition">Batal</button>
                            <button type="submit" form="formDonasi" disabled={donasiSubmitLoading} className="px-6 py-2.5 bg-primary hover:bg-secondary text-white rounded-lg font-bold shadow-md flex items-center disabled:opacity-50 transition">
                                {donasiSubmitLoading ? 'Mengirim...' : 'Kirim Bukti'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
}