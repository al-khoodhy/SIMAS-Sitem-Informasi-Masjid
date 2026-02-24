// src/pages/AllNews.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Calendar, ArrowRight, Eye } from 'lucide-react';
import api from '../api/axios';

export default function AllNews() {
    const [berita, setBerita] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        window.scrollTo(0, 0);
        fetchSemuaBerita();
    }, []);

    const fetchSemuaBerita = async () => {
        try {
            const res = await api.get('/public/berita-semua');
            setBerita(res.data.data);
        } catch (error) { console.error(error); } finally { setLoading(false); }
    };

    const formatTanggal = (tanggal) => new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(tanggal));

    if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-50"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div></div>;

    return (
        <div className="min-h-screen bg-gray-50 font-sans pb-20">
            <nav className="bg-white shadow-sm sticky top-0 z-50 p-4">
                <div className="max-w-7xl mx-auto flex items-center">
                    <Link to="/" className="flex items-center text-gray-600 hover:text-primary transition font-bold">
                        <ArrowLeft className="w-5 h-5 mr-2" /> Kembali ke Beranda
                    </Link>
                </div>
            </nav>

            <div className="max-w-7xl mx-auto px-4 pt-10">
                <div className="mb-10">
                    <h1 className="text-3xl font-extrabold text-gray-800 mb-2">Semua Berita & Laporan</h1>
                    <p className="text-gray-500">Arsip seluruh kegiatan dan kabar terbaru dari Masjid An-Nur Puloniti.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {berita.length === 0 ? (
                        <div className="col-span-full text-center text-gray-500 bg-white p-10 rounded-xl border border-gray-100">Belum ada berita dipublikasikan.</div>
                    ) : (
                        berita.map(b => (
                            <Link to={`/berita/${b.id}`} key={b.id} className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-lg transition group flex flex-col">
                                <div className="h-48 bg-gray-200 overflow-hidden relative">
                                    {b.thumbnail ? (
                                        <img src={`http://47.236.145.121/storage/${b.thumbnail}`} alt={b.judul} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-gray-100"><Calendar className="w-10 h-10 text-gray-300" /></div>
                                    )}
                                </div>
                                <div className="p-6 flex-1 flex flex-col">
                                    <div className="flex justify-between items-center mb-2">
                                        <p className="text-xs text-primary font-bold">{formatTanggal(b.created_at)}</p>
                                        <p className="text-xs text-gray-400 font-bold flex items-center bg-gray-100 px-2 py-0.5 rounded-full"><Eye className="w-3 h-3 mr-1"/> {b.views}x</p>
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-800 mb-3 line-clamp-2 group-hover:text-primary transition">{b.judul}</h3>
                                    <p className="text-gray-500 text-sm line-clamp-3 mb-4">{b.konten}</p>
                                    <div className="mt-auto pt-4 border-t border-gray-50 text-xs text-gray-400 flex justify-between items-center">
                                        <span>Oleh: {b.penulis?.name || 'Admin'}</span>
                                        <span className="text-primary font-bold">Baca <ArrowRight className="w-3 h-3 inline"/></span>
                                    </div>
                                </div>
                            </Link>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}