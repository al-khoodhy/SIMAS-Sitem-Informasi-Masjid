// src/pages/PengaturanKeuangan.jsx
import { useState, useEffect } from 'react';
import { Target, Tags, Plus, Edit, Trash2, X } from 'lucide-react';
import api from '../api/axios';

export default function PengaturanKeuangan() {
    const [activeTab, setActiveTab] = useState('kategori');
    const [dataKategori, setDataKategori] = useState([]);
    const [dataCampaign, setDataCampaign] = useState([]);
    
    // PERBAIKAN 1: Deklarasi state loading hanya 1 kali
    const [loading, setLoading] = useState(false); 

    // State Modal
    const [isModalKatOpen, setIsModalKatOpen] = useState(false);
    const [isModalCamOpen, setIsModalCamOpen] = useState(false);
    const [editId, setEditId] = useState(null);

    // Form States
    const [formKat, setFormKat] = useState({ nama_kategori: '', jenis: 'pemasukan' });
    const [formCam, setFormCam] = useState({ judul: '', deskripsi: '', target_nominal: '', tanggal_selesai: '', status: 'aktif' });

    useEffect(() => {
        if (activeTab === 'kategori') fetchKategori();
        else fetchCampaign();
    }, [activeTab]);

    const fetchKategori = async () => {
        setLoading(true);
        try { 
            const res = await api.get('/kategori-keuangan'); 
            setDataKategori(res.data.data); 
        } catch (err) { 
            // PERBAIKAN 2: Gunakan variabel err agar ESLint tidak protes
            console.error("Gagal fetch kategori:", err); 
        } finally { 
            setLoading(false); 
        }
    };

    const fetchCampaign = async () => {
        setLoading(true);
        try { 
            const res = await api.get('/campaign-donasi'); 
            setDataCampaign(res.data.data); 
        } catch (err) { 
            console.error("Gagal fetch campaign:", err); 
        } finally { 
            setLoading(false); 
        }
    };

    const handleDeleteKat = async (id) => {
        if (!window.confirm("Yakin hapus kategori ini?")) return;
        try { 
            await api.delete(`/kategori-keuangan/${id}`); 
            fetchKategori(); 
        } catch (err) { 
            console.error(err);
            alert(err.response?.data?.message || "Gagal menghapus kategori."); 
        }
    };

    const handleDeleteCam = async (id) => {
        if (!window.confirm("Yakin hapus target dana ini?")) return;
        try { 
            await api.delete(`/campaign-donasi/${id}`); 
            fetchCampaign(); 
        } catch (err) { 
            console.error(err);
            alert(err.response?.data?.message || "Gagal menghapus pengadaan."); 
        }
    };

    const submitKategori = async (e) => {
        e.preventDefault();
        try {
            if (editId) await api.put(`/kategori-keuangan/${editId}`, formKat);
            else await api.post('/kategori-keuangan', formKat);
            setIsModalKatOpen(false); 
            fetchKategori();
        } catch (err) { 
            console.error(err);
            alert(err.response?.data?.message || "Gagal menyimpan kategori"); 
        }
    };

    const submitCampaign = async (e) => {
        e.preventDefault();
        try {
            if (editId) await api.put(`/campaign-donasi/${editId}`, formCam);
            else await api.post('/campaign-donasi', formCam);
            setIsModalCamOpen(false); 
            fetchCampaign();
        } catch (err) { 
            console.error(err);
            alert(err.response?.data?.message || "Gagal menyimpan pengadaan"); 
        }
    };

    const formatRupiah = (angka) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(angka);

    return (
        <div>
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Pengaturan Keuangan</h1>
                <p className="text-sm text-gray-500">Kelola Kategori Transaksi dan Target Pengadaan/Crowdfunding.</p>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-200 mb-6">
                <button onClick={() => setActiveTab('kategori')} className={`flex items-center pb-3 px-4 font-medium text-sm transition ${activeTab === 'kategori' ? 'border-b-2 border-primary text-primary' : 'text-gray-500 hover:text-gray-700'}`}>
                    <Tags className="w-4 h-4 mr-2" /> Kategori Transaksi
                </button>
                <button onClick={() => setActiveTab('campaign')} className={`flex items-center pb-3 px-4 font-medium text-sm transition ${activeTab === 'campaign' ? 'border-b-2 border-primary text-primary' : 'text-gray-500 hover:text-gray-700'}`}>
                    <Target className="w-4 h-4 mr-2" /> Target Dana (Pengadaan)
                </button>
            </div>

            {/* TAB KATEGORI */}
            {activeTab === 'kategori' && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-4 border-b">
                        <button onClick={() => { setEditId(null); setFormKat({nama_kategori:'', jenis:'pemasukan'}); setIsModalKatOpen(true); }} className="bg-primary hover:bg-secondary transition text-white px-4 py-2 rounded-lg flex items-center text-sm font-medium">
                            <Plus className="w-4 h-4 mr-2" /> Tambah Kategori
                        </button>
                    </div>
                    
                    {loading ? (
                        <div className="p-6 text-center text-gray-500">Memuat data...</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left text-gray-600">
                                <thead className="bg-gray-50 text-gray-700 uppercase font-medium text-xs">
                                    <tr>
                                        <th className="px-6 py-3">Nama Kategori</th>
                                        <th className="px-6 py-3">Jenis Arus Kas</th>
                                        <th className="px-6 py-3 text-center">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {dataKategori.length === 0 ? (
                                        <tr><td colSpan="3" className="px-6 py-4 text-center text-gray-500">Belum ada kategori.</td></tr>
                                    ) : (
                                        dataKategori.map(kat => (
                                            <tr key={kat.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 font-bold text-gray-800">{kat.nama_kategori}</td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-2.5 py-1 rounded text-xs font-bold ${kat.jenis === 'pemasukan' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                        {kat.jenis === 'pemasukan' ? 'Pemasukan (+)' : 'Pengeluaran (-)'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-center flex justify-center space-x-2">
                                                    <button onClick={() => { setEditId(kat.id); setFormKat({nama_kategori: kat.nama_kategori, jenis: kat.jenis}); setIsModalKatOpen(true); }} className="p-1.5 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition"><Edit className="w-4 h-4" /></button>
                                                    <button onClick={() => handleDeleteKat(kat.id)} className="p-1.5 bg-red-50 text-red-600 rounded hover:bg-red-100 transition"><Trash2 className="w-4 h-4" /></button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {/* TAB CAMPAIGN / PENGADAAN */}
            {activeTab === 'campaign' && (
                <div>
                    <div className="mb-4">
                        <button onClick={() => { setEditId(null); setFormCam({judul:'', deskripsi:'', target_nominal:'', tanggal_selesai:'', status:'aktif'}); setIsModalCamOpen(true); }} className="bg-primary hover:bg-secondary transition text-white px-4 py-2 rounded-lg flex items-center text-sm font-medium">
                            <Plus className="w-4 h-4 mr-2" /> Buat Target Baru
                        </button>
                    </div>

                    {loading ? (
                        <div className="p-6 text-center text-gray-500 bg-white rounded-xl">Memuat data...</div>
                    ) : dataCampaign.length === 0 ? (
                        <div className="p-10 text-center text-gray-500 bg-white rounded-xl border border-gray-100 shadow-sm">Belum ada target pengadaan.</div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {dataCampaign.map(cam => {
                                const persen = Math.min((cam.terkumpul_nominal / cam.target_nominal) * 100, 100).toFixed(1);
                                return (
                                    <div key={cam.id} className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition">
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className="font-bold text-lg text-gray-800">{cam.judul}</h3>
                                            <span className={`px-2.5 py-1 text-xs rounded-full font-bold capitalize ${cam.status==='aktif'?'bg-green-100 text-green-700':cam.status==='terpenuhi'?'bg-blue-100 text-blue-700':'bg-gray-100 text-gray-700'}`}>
                                                {cam.status}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-500 mb-6 line-clamp-2">{cam.deskripsi}</p>
                                        
                                        <div className="mb-2 flex justify-between text-sm font-bold">
                                            <span className="text-primary">{formatRupiah(cam.terkumpul_nominal)}</span>
                                            <span className="text-gray-400">Target: {formatRupiah(cam.target_nominal)}</span>
                                        </div>
                                        <div className="w-full bg-gray-100 rounded-full h-2.5 mb-6 overflow-hidden">
                                            <div className="bg-primary h-2.5 rounded-full transition-all duration-1000" style={{ width: `${persen}%` }}></div>
                                        </div>
                                        
                                        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-50">
                                            <button onClick={() => { setEditId(cam.id); setFormCam(cam); setIsModalCamOpen(true); }} className="px-3 py-1.5 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-md text-sm font-medium flex items-center transition"><Edit className="w-4 h-4 mr-1.5"/> Edit</button>
                                            <button onClick={() => handleDeleteCam(cam.id)} className="px-3 py-1.5 text-red-600 bg-red-50 hover:bg-red-100 rounded-md text-sm font-medium flex items-center transition"><Trash2 className="w-4 h-4 mr-1.5"/> Hapus</button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}

            {/* MODAL KATEGORI */}
            {isModalKatOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl w-full max-w-sm overflow-hidden">
                        <div className="flex justify-between items-center p-4 border-b bg-gray-50">
                            <h3 className="font-bold text-lg text-gray-800">{editId ? 'Edit Kategori' : 'Tambah Kategori'}</h3>
                            <button onClick={() => setIsModalKatOpen(false)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
                        </div>
                        <div className="p-6">
                            <form id="katForm" onSubmit={submitKategori} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Nama Kategori</label>
                                    <input type="text" value={formKat.nama_kategori} onChange={e => setFormKat({...formKat, nama_kategori: e.target.value})} placeholder="Contoh: Zakat Fitrah" className="w-full border rounded-lg p-2.5 focus:ring-primary outline-none text-sm" required />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Jenis Arus Kas</label>
                                    <select value={formKat.jenis} onChange={e => setFormKat({...formKat, jenis: e.target.value})} className="w-full border rounded-lg p-2.5 focus:ring-primary outline-none text-sm bg-white">
                                        <option value="pemasukan">Pemasukan (+)</option>
                                        <option value="pengeluaran">Pengeluaran (-)</option>
                                    </select>
                                </div>
                            </form>
                        </div>
                        <div className="p-4 border-t bg-gray-50 flex justify-end gap-2">
                            <button type="button" onClick={()=>setIsModalKatOpen(false)} className="px-4 py-2 bg-white border text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50">Batal</button>
                            <button type="submit" form="katForm" className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-secondary">Simpan</button>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL CAMPAIGN */}
            {isModalCamOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl w-full max-w-md overflow-hidden max-h-[90vh] flex flex-col">
                        <div className="flex justify-between items-center p-4 border-b bg-gray-50">
                            <h3 className="font-bold text-lg text-gray-800">{editId ? 'Edit Target Dana' : 'Buat Target Pengadaan'}</h3>
                            <button onClick={() => setIsModalCamOpen(false)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
                        </div>
                        <div className="p-6 overflow-y-auto">
                            <form id="camForm" onSubmit={submitCampaign} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Judul Pengadaan</label>
                                    <input type="text" value={formCam.judul} onChange={e => setFormCam({...formCam, judul: e.target.value})} placeholder="Contoh: Beli AC Baru" className="w-full border rounded-lg p-2.5 focus:ring-primary outline-none text-sm" required />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi & Tujuan</label>
                                    <textarea value={formCam.deskripsi} onChange={e => setFormCam({...formCam, deskripsi: e.target.value})} placeholder="Penjelasan singkat tujuan dana..." className="w-full border rounded-lg p-2.5 focus:ring-primary outline-none text-sm" required rows="3"></textarea>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Target Nominal (Rp)</label>
                                    <input type="number" value={formCam.target_nominal} onChange={e => setFormCam({...formCam, target_nominal: e.target.value})} placeholder="Contoh: 5000000" min="1" className="w-full border rounded-lg p-2.5 focus:ring-primary outline-none text-sm" required />
                                </div>
                                
                                {/* Status hanya bisa diubah jika sedang Edit */}
                                {editId && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Status Penggalangan Dana</label>
                                        <select value={formCam.status} onChange={e => setFormCam({...formCam, status: e.target.value})} className="w-full border rounded-lg p-2.5 focus:ring-primary outline-none text-sm bg-white">
                                            <option value="aktif">Masih Aktif (Menerima Donasi)</option>
                                            <option value="terpenuhi">Target Terpenuhi</option>
                                            <option value="ditutup">Ditutup / Dibatalkan</option>
                                        </select>
                                    </div>
                                )}
                            </form>
                        </div>
                        <div className="p-4 border-t bg-gray-50 flex justify-end gap-2">
                            <button type="button" onClick={()=>setIsModalCamOpen(false)} className="px-4 py-2 bg-white border text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50">Batal</button>
                            <button type="submit" form="camForm" className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-secondary">Simpan Target</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}