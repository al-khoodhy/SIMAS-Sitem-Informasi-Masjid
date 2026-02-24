// src/pages/ManajemenBuku.jsx
import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, X, Book, Link as LinkIcon, Image as ImageIcon } from 'lucide-react';
import api from '../api/axios';

export default function ManajemenBuku() {
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [submitLoading, setSubmitLoading] = useState(false);
    const [editId, setEditId] = useState(null);

    const [formData, setFormData] = useState({ judul: '', kategori: '', penulis: '', link_gdrive: '', cover_image: null });

    useEffect(() => { fetchBooks(); }, []);

    const fetchBooks = async () => {
        setLoading(true);
        try { const res = await api.get('/buku'); setBooks(res.data.data); } catch (error) { console.error(error); } finally { setLoading(false); }
    };

    const handleFileChange = (e) => setFormData({ ...formData, cover_image: e.target.files[0] });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitLoading(true);
        
        // Gunakan FormData karena kita mengirim File (Image)
        const data = new FormData();
        data.append('judul', formData.judul);
        data.append('kategori', formData.kategori);
        data.append('penulis', formData.penulis);
        data.append('link_gdrive', formData.link_gdrive);
        
        if (formData.cover_image instanceof File) {
            data.append('cover_image', formData.cover_image);
        }
    
        try {
            if (editId) {
                // Laravel butuh spoofing method PUT jika menggunakan FormData
                data.append('_method', 'PUT'); 
                await api.post(`/buku/${editId}`, data, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                alert("Buku berhasil diperbarui!");
            } else {
                await api.post('/buku', data, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                alert("Buku berhasil ditambahkan!");
            }
            setIsModalOpen(false);
            fetchBooks();
        } catch (error) {
            // Tampilkan pesan error spesifik dari Laravel 422
            if (error.response && error.response.status === 422) {
                const errors = error.response.data.errors;
                const firstError = Object.values(errors)[0][0];
                alert("Gagal: " + firstError);
            } else {
                alert("Terjadi kesalahan pada server.");
            }
            console.error("Detail Error:", error.response?.data);
        } finally {
            setSubmitLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Hapus buku ini dari perpustakaan?")) return;
        try { await api.delete(`/buku/${id}`); fetchBooks(); } catch (err) { alert("Gagal menghapus"); }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Manajemen E-Library</h1>
                    <p className="text-sm text-gray-500">Kelola buku, kitab, dan materi pembelajaran digital.</p>
                </div>
                <button onClick={() => { setEditId(null); setFormData({judul:'', kategori:'', penulis:'', link_gdrive:'', cover_image:null}); setIsModalOpen(true); }} className="bg-primary text-white px-4 py-2 rounded-lg font-bold flex items-center shadow-sm">
                    <Plus className="w-5 h-5 mr-1" /> Tambah Buku
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-sm text-left text-gray-600">
                    <thead className="bg-gray-50 text-gray-700 uppercase font-bold text-xs">
                        <tr><th className="px-6 py-4">Buku</th><th className="px-6 py-4">Kategori & Penulis</th><th className="px-6 py-4 text-center">Link Unduh</th><th className="px-6 py-4 text-center">Aksi</th></tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {loading ? <tr><td colSpan="4" className="text-center py-10">Memuat...</td></tr> : 
                         books.map(b => (
                            <tr key={b.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 flex items-center gap-4">
                                    <div className="w-10 h-14 bg-gray-200 rounded object-cover overflow-hidden flex-shrink-0">
                                        {b.cover_image ? <img src={`http://47.236.145.121/storage/${b.cover_image}`} className="w-full h-full object-cover"/> : <Book className="w-6 h-6 mx-auto mt-4 text-gray-400"/>}
                                    </div>
                                    <span className="font-bold text-gray-800">{b.judul}</span>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs font-bold mr-2">{b.kategori}</span>
                                    <span className="text-sm text-gray-600">{b.penulis}</span>
                                </td>
                                <td className="px-6 py-4 text-center"><a href={b.link_gdrive} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline inline-flex items-center font-bold"><LinkIcon className="w-4 h-4 mr-1"/> Akses Drive</a></td>
                                <td className="px-6 py-4 text-center">
                                    <div className="flex justify-center gap-2">
                                        <button onClick={() => { setEditId(b.id); setFormData({...b, cover_image:null}); setIsModalOpen(true); }} className="p-1.5 bg-blue-50 text-blue-600 rounded"><Edit className="w-4 h-4"/></button>
                                        <button onClick={() => handleDelete(b.id)} className="p-1.5 bg-red-50 text-red-600 rounded"><Trash2 className="w-4 h-4"/></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Modal Form */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden">
                        <div className="p-4 border-b bg-gray-50 flex justify-between"><h3 className="font-bold text-lg">Form Buku</h3><X onClick={()=>setIsModalOpen(false)} className="cursor-pointer"/></div>
                        <div className="p-6">
                            <form id="bukuForm" onSubmit={handleSubmit} className="space-y-4">
                                <div><label className="block text-sm font-bold mb-1">Judul Buku</label><input type="text" value={formData.judul} onChange={e=>setFormData({...formData, judul: e.target.value})} required className="w-full border p-2.5 rounded-lg outline-none" /></div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div><label className="block text-sm font-bold mb-1">Kategori Baru/Ada</label><input type="text" placeholder="Misal: Fiqih" value={formData.kategori} onChange={e=>setFormData({...formData, kategori: e.target.value})} required className="w-full border p-2.5 rounded-lg outline-none" /></div>
                                    <div><label className="block text-sm font-bold mb-1">Penulis Asli</label><input type="text" placeholder="Misal: Ust Adi Hidayat" value={formData.penulis} onChange={e=>setFormData({...formData, penulis: e.target.value})} required className="w-full border p-2.5 rounded-lg outline-none" /></div>
                                </div>
                                <div><label className="block text-sm font-bold mb-1">Tautan Google Drive Download</label><input type="url" placeholder="https://drive.google.com/..." value={formData.link_gdrive} onChange={e=>setFormData({...formData, link_gdrive: e.target.value})} required className="w-full border p-2.5 rounded-lg outline-none" /></div>
                                <div><label className="block text-sm font-bold mb-1">Upload Cover (Opsional)</label><input type="file" accept="image/*" onChange={handleFileChange} className="w-full border p-2 rounded-lg text-sm bg-gray-50" /></div>
                            </form>
                        </div>
                        <div className="p-4 border-t flex justify-end gap-2"><button type="button" onClick={()=>setIsModalOpen(false)} className="px-5 py-2.5 border rounded-lg font-bold">Batal</button><button type="submit" form="bukuForm" disabled={submitLoading} className="px-5 py-2.5 bg-primary text-white rounded-lg font-bold disabled:opacity-50">{submitLoading ? 'Menyimpan...' : 'Simpan Buku'}</button></div>
                    </div>
                </div>
            )}
        </div>
    );
}