// src/pages/NewsDetail.jsx
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Calendar, User } from 'lucide-react';
import api from '../api/axios';

export default function NewsDetail() {
    const { id } = useParams(); // Mengambil ID dari URL
    const [berita, setBerita] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        window.scrollTo(0, 0);
        fetchBeritaDetail();
    }, [id]);

    const fetchBeritaDetail = async () => {
        try {
            const res = await api.get(`/public/berita/${id}`);
            setBerita(res.data.data);
        } catch (error) { console.error(error); } finally { setLoading(false); }
    };

    const formatTanggal = (tanggal) => new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(tanggal));

    if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-50"><div className="animate-spin rounded-full h-12 w-12 border-t-primary"></div></div>;
    if (!berita) return <div className="min-h-screen flex items-center justify-center"><p>Berita tidak ditemukan.</p></div>;

    return (
        <div className="min-h-screen bg-white font-sans pb-20">
            <nav className="bg-white shadow-sm sticky top-0 z-50 p-4 border-b border-gray-100">
                <div className="max-w-3xl mx-auto flex items-center">
                    <Link to="/" className="flex items-center text-gray-600 hover:text-primary transition font-bold">
                        <ArrowLeft className="w-5 h-5 mr-2" /> Kembali ke Beranda
                    </Link>
                </div>
            </nav>

            <article className="max-w-3xl mx-auto px-4 pt-10">
                <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 leading-tight mb-6">{berita.judul}</h1>
                
                <div className="flex items-center gap-4 text-sm text-gray-500 mb-8 pb-6 border-b border-gray-100">
                    <span className="flex items-center"><Calendar className="w-4 h-4 mr-1.5"/> {formatTanggal(berita.created_at)}</span>
                    <span className="flex items-center"><User className="w-4 h-4 mr-1.5"/> Ditulis oleh: {berita.penulis?.name || 'Admin'}</span>
                </div>

                {berita.thumbnail && (
                    <div className="w-full h-64 md:h-96 rounded-2xl overflow-hidden mb-8 shadow-md">
                        <img src={`http://localhost:8000/storage/${berita.thumbnail}`} alt={berita.judul} className="w-full h-full object-cover" />
                    </div>
                )}

                {/* whitespace-pre-wrap membuat enter/paragraf dari database terbaca dengan baik */}
                <div className="text-lg text-gray-700 leading-relaxed whitespace-pre-wrap mb-10">
                    {berita.konten}
                </div>

                {berita.link_youtube && (
                    <div className="bg-red-50 border border-red-100 p-6 rounded-2xl text-center">
                        <p className="text-gray-700 font-bold mb-3">Tonton Video Dokumentasi:</p>
                        <a href={berita.link_youtube} target="_blank" rel="noreferrer" className="inline-block bg-red-600 text-white font-bold px-6 py-3 rounded-full hover:bg-red-700 transition">
                            Buka di YouTube
                        </a>
                    </div>
                )}
            </article>
        </div>
    );
}