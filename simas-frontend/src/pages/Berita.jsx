// src/pages/Berita.jsx
import { useState, useEffect } from 'react';
import { Plus, CheckCircle, Clock, XCircle, FileText, Image as ImageIcon, X, Youtube } from 'lucide-react';
import api from '../api/axios';

export default function Berita() {
    const [beritaList, setBeritaList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [submitLoading, setSubmitLoading] = useState(false);

    // Dapatkan data user yang sedang login dari LocalStorage
    const user = JSON.parse(localStorage.getItem('user'));

    // State untuk Form Tulis Berita
    const [formData, setFormData] = useState({
        judul: '',
        konten: '',
        link_youtube: '',
        thumbnail: null
    });

    useEffect(() => {
        fetchBerita();
    }, []);

    const fetchBerita = async () => {
        setLoading(true);
        try {
            const response = await api.get('/berita'); 
            setBeritaList(response.data.data);
        } catch (error) {
            console.error("Gagal mengambil data berita", error);
            alert("Gagal memuat daftar berita.");
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        setFormData(prev => ({ ...prev, thumbnail: e.target.files[0] }));
    };

    // Remaja submit draf berita
    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitLoading(true);

        const dataToSend = new FormData();
        dataToSend.append('judul', formData.judul);
        dataToSend.append('konten', formData.konten);
        if (formData.link_youtube) dataToSend.append('link_youtube', formData.link_youtube);
        if (formData.thumbnail) dataToSend.append('thumbnail', formData.thumbnail);

        try {
            await api.post('/berita', dataToSend, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            
            setIsModalOpen(false);
            setFormData({ judul: '', konten: '', link_youtube: '', thumbnail: null });
            fetchBerita();
            alert("Draf berita berhasil dikirim! Menunggu persetujuan panitia.");
        } catch (error) {
            console.error(error);
            alert(error.response?.data?.message || "Terjadi kesalahan saat menyimpan berita.");
        } finally {
            setSubmitLoading(false);
        }
    };

    // Panitia menyetujui berita
    const handleApprove = async (id) => {
        if (!window.confirm("Publikasikan berita ini ke Landing Page?")) return;
        
        try {
            await api.post(`/berita/${id}/approve`);
            fetchBerita(); // Muat ulang data setelah di-approve
            alert("Berita berhasil dipublikasikan!");
        } catch (error) {
            console.error(error);
            alert("Gagal mempublikasikan berita.");
        }
    };

    // Utility: Badge Status
    const getStatusBadge = (status) => {
        switch (status) {
            case 'dipublikasi':
                return <span className="flex items-center text-green-700 bg-green-100 px-2.5 py-1 rounded-full text-xs font-semibold"><CheckCircle className="w-3 h-3 mr-1"/> Dipublikasi</span>;
            case 'menunggu_persetujuan':
                return <span className="flex items-center text-yellow-700 bg-yellow-100 px-2.5 py-1 rounded-full text-xs font-semibold"><Clock className="w-3 h-3 mr-1"/> Menunggu Review</span>;
            case 'ditolak':
                return <span className="flex items-center text-red-700 bg-red-100 px-2.5 py-1 rounded-full text-xs font-semibold"><XCircle className="w-3 h-3 mr-1"/> Ditolak</span>;
            default:
                return <span className="flex items-center text-gray-700 bg-gray-100 px-2.5 py-1 rounded-full text-xs font-semibold">Draft</span>;
        }
    };

    // Utility: Format Tanggal
    const formatTanggal = (tanggal) => {
        if (!tanggal) return '-';
        return new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(tanggal));
    };

    return (
        <div>
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Publikasi & Berita</h1>
                    <p className="text-sm text-gray-500">
                        {user.role === 'remaja' 
                            ? "Tulis kegiatan masjid. Berita akan tayang setelah disetujui Panitia." 
                            : "Kelola artikel dan setujui berita yang ditulis oleh Remaja Masjid."}
                    </p>
                </div>
                
                {/* Tombol Tulis Berita (Tersedia untuk semua role) */}
                <button 
                    onClick={() => setIsModalOpen(true)}
                    className="bg-primary hover:bg-secondary text-white px-4 py-2 rounded-lg flex items-center shadow-sm transition whitespace-nowrap"
                >
                    <Plus className="w-5 h-5 mr-2" />
                    Tulis Berita
                </button>
            </div>

            {/* Grid Kartu Berita */}
            {loading ? (
                <div className="text-center py-10 text-gray-500">Memuat artikel...</div>
            ) : beritaList.length === 0 ? (
                <div className="bg-white p-10 rounded-xl shadow-sm text-center border border-gray-100">
                    <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">Belum ada berita atau artikel yang ditulis.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {beritaList.map((berita) => (
                        <div key={berita.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col hover:shadow-md transition">
                            {/* Thumbnail Placeholder */}
                            <div className="h-40 bg-gray-100 relative">
                                {berita.thumbnail ? (
                                    <img src={`http://localhost:8000/storage/${berita.thumbnail}`} alt={berita.judul} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                                        <ImageIcon className="w-10 h-10 opacity-50" />
                                    </div>
                                )}
                                <div className="absolute top-3 right-3">
                                    {getStatusBadge(berita.status)}
                                </div>
                            </div>
                            
                            {/* Konten Card */}
                            <div className="p-5 flex-1 flex flex-col">
                                <h3 className="font-bold text-gray-800 text-lg mb-2 line-clamp-2">{berita.judul}</h3>
                                <p className="text-sm text-gray-500 line-clamp-3 mb-4 flex-1">{berita.konten}</p>
                                
                                {/* Info Penulis & Tanggal */}
                                <div className="flex items-center justify-between text-xs text-gray-500 mb-4 pt-4 border-t border-gray-50">
                                    <span className="font-medium text-primary">{berita.penulis?.name || 'Anonim'}</span>
                                    <span>{formatTanggal(berita.created_at)}</span>
                                </div>

                                {/* Tombol Aksi (Khusus Panitia & Developer) */}
                                {(user.role === 'panitia' || user.role === 'developer') && berita.status === 'menunggu_persetujuan' && (
                                    <div className="mt-auto">
                                        <button 
                                            onClick={() => handleApprove(berita.id)}
                                            className="w-full bg-green-50 text-green-700 border border-green-200 hover:bg-green-500 hover:text-white py-2 rounded-lg font-bold transition flex items-center justify-center"
                                        >
                                            <CheckCircle className="w-4 h-4 mr-2" />
                                            Setujui & Publikasikan
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal Tulis Berita */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden max-h-[90vh] flex flex-col">
                        <div className="flex justify-between items-center p-4 border-b bg-gray-50">
                            <h3 className="font-bold text-lg text-gray-800">Tulis Artikel / Berita Baru</h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        
                        <div className="p-6 overflow-y-auto flex-1">
                            <form id="beritaForm" onSubmit={handleSubmit} className="space-y-5">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Judul Artikel <span className="text-red-500">*</span></label>
                                    <input 
                                        type="text" name="judul" value={formData.judul} onChange={handleInputChange} required 
                                        placeholder="Contoh: Keseruan Buka Bersama Warga RT 10" 
                                        className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition" 
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Isi Konten <span className="text-red-500">*</span></label>
                                    <textarea 
                                        name="konten" value={formData.konten} onChange={handleInputChange} required rows="6" 
                                        placeholder="Tulis detail kegiatan di sini..." 
                                        className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition"
                                    ></textarea>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    {/* Upload Gambar */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Foto Sampul (Thumbnail)</label>
                                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:bg-gray-50 transition">
                                            <ImageIcon className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                                            <input 
                                                type="file" accept="image/*" onChange={handleFileChange} 
                                                className="w-full text-xs text-gray-500 file:mr-4 file:py-1.5 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 cursor-pointer" 
                                            />
                                        </div>
                                    </div>

                                    {/* Link YouTube */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Link Video YouTube (Opsional)</label>
                                        <div className="relative">
                                            <Youtube className="w-5 h-5 absolute left-3 top-2.5 text-gray-400" />
                                            <input 
                                                type="url" name="link_youtube" value={formData.link_youtube} onChange={handleInputChange} 
                                                placeholder="https://youtube.com/watch?v=..." 
                                                className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition" 
                                            />
                                        </div>
                                        <p className="text-xs text-gray-500 mt-1">Gunakan untuk mempublikasikan rekaman kajian.</p>
                                    </div>
                                </div>
                            </form>
                        </div>

                        <div className="p-4 border-t bg-gray-50 flex gap-3 justify-end">
                            <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium">Batal</button>
                            <button type="submit" form="beritaForm" disabled={submitLoading} className="px-5 py-2.5 bg-primary text-white rounded-lg hover:bg-secondary transition font-medium flex items-center disabled:opacity-50">
                                {submitLoading ? 'Menyimpan...' : 'Kirim Draf Berita'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}