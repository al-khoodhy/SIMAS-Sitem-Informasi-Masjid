import { useState, useEffect } from 'react';
import { Image as ImageIcon, Edit, Save, X, Loader } from 'lucide-react';
import api from '../api/axios';

export default function ManajemenGaleri() {
    const [galleries, setGalleries] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // State Modal Edit
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editData, setEditData] = useState(null);
    const [previewImage, setPreviewImage] = useState(null);
    const [newImageFile, setNewImageFile] = useState(null);
    const [submitLoading, setSubmitLoading] = useState(false);

    useEffect(() => {
        fetchGallery();
    }, []);

    const fetchGallery = async () => {
        try {
            const res = await api.get('/public/gallery');
            setGalleries(res.data.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const getImageUrl = (url) => {
        if (!url) return '';
        if (url.startsWith('http')) return url;
        // Ganti localhost:8000 dengan URL backend Anda
        return `http://localhost:8000/storage/${url}`;
    };

    const handleEdit = (item) => {
        setEditData(item);
        setPreviewImage(getImageUrl(item.image_url));
        setNewImageFile(null);
        setIsModalOpen(true);
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setNewImageFile(file);
            setPreviewImage(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitLoading(true);

        const formData = new FormData();
        formData.append('title', editData.title);
        formData.append('category', editData.category || '');
        if (newImageFile) {
            formData.append('image', newImageFile);
        }

        try {
            await api.post(`/gallery/${editData.id}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            alert('Slot Galeri Berhasil Diupdate!');
            setIsModalOpen(false);
            fetchGallery();
        } catch (error) {
            alert('Gagal mengupdate galeri.');
        } finally {
            setSubmitLoading(false);
        }
    };

    return (
        <div>
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Manajemen Tampilan Galeri</h1>
                <p className="text-sm text-gray-500">Ubah foto dan judul untuk 7 slot galeri yang tampil di halaman depan.</p>
            </div>

            {loading ? (
                <div className="text-center py-10">Memuat data...</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {galleries.map((item) => (
                        <div key={item.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col group hover:shadow-md transition">
                            <div className="relative h-48 bg-gray-100 overflow-hidden">
                                <img src={getImageUrl(item.image_url)} alt={item.title} className="w-full h-full object-cover" />
                                <div className="absolute top-2 left-2 bg-black/60 text-white text-xs font-bold px-2 py-1 rounded">
                                    Slot {item.slot_number}
                                </div>
                            </div>
                            <div className="p-4 flex-1 flex flex-col">
                                <span className="text-xs font-bold text-primary mb-1 uppercase">{item.category || 'Tanpa Kategori'}</span>
                                <h3 className="font-bold text-gray-800 mb-4">{item.title}</h3>
                                <button 
                                    onClick={() => handleEdit(item)}
                                    className="mt-auto w-full flex items-center justify-center gap-2 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white py-2 rounded-lg font-bold transition text-sm"
                                >
                                    <Edit className="w-4 h-4" /> Edit Tampilan
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* MODAL EDIT */}
            {isModalOpen && editData && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden">
                        <div className="p-4 border-b flex justify-between items-center bg-gray-50">
                            <h3 className="font-bold text-lg">Edit Slot {editData.slot_number}</h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-800"><X className="w-5 h-5"/></button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Judul Kegiatan</label>
                                <input 
                                    type="text" 
                                    required 
                                    value={editData.title} 
                                    onChange={(e) => setEditData({...editData, title: e.target.value})}
                                    className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-primary outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Kategori (Opsional)</label>
                                <input 
                                    type="text" 
                                    value={editData.category || ''} 
                                    onChange={(e) => setEditData({...editData, category: e.target.value})}
                                    placeholder="Contoh: SOSIAL, PENDIDIKAN"
                                    className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-primary outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Foto Tampilan</label>
                                <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 text-center hover:bg-gray-50 transition cursor-pointer relative" onClick={() => document.getElementById('fileUpload').click()}>
                                    {previewImage ? (
                                        <img src={previewImage} alt="Preview" className="h-40 mx-auto object-contain rounded-md" />
                                    ) : (
                                        <div className="py-8 text-gray-400">
                                            <ImageIcon className="w-10 h-10 mx-auto mb-2" />
                                            <span className="text-sm">Klik untuk ganti foto</span>
                                        </div>
                                    )}
                                    <input type="file" id="fileUpload" accept="image/*" className="hidden" onChange={handleFileChange} />
                                </div>
                            </div>
                            <div className="pt-4 flex justify-end gap-2">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border rounded-lg font-bold hover:bg-gray-50">Batal</button>
                                <button type="submit" disabled={submitLoading} className="px-4 py-2 bg-primary text-white rounded-lg font-bold flex items-center hover:bg-secondary">
                                    {submitLoading ? <Loader className="w-4 h-4 animate-spin mr-2"/> : <Save className="w-4 h-4 mr-2"/>} Simpan
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}