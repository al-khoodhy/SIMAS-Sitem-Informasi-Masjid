import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Megaphone, ArrowLeft, CalendarDays } from 'lucide-react';
import api from '../api/axios';

export default function PengumumanPage() {
    const [groupedData, setGroupedData] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        window.scrollTo(0, 0);
        fetchPengumuman();
    }, []);

    const fetchPengumuman = async () => {
        try {
            const res = await api.get('/public/pengumuman');
            // Mengelompokkan data berdasarkan "Bulan Tahun" (Contoh: Maret 2026)
            const grouped = res.data.data.reduce((acc, curr) => {
                const date = new Date(curr.tanggal_publish);
                const monthYear = date.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
                if (!acc[monthYear]) acc[monthYear] = [];
                acc[monthYear].push(curr);
                return acc;
            }, {});
            setGroupedData(grouped);
        } catch (error) {
            console.error("Gagal memuat pengumuman", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            <nav className="bg-white shadow-sm sticky top-0 z-50 p-4 border-b border-gray-100">
                <div className="max-w-4xl mx-auto flex items-center justify-between">
                    <Link to="/" className="flex items-center text-gray-600 hover:text-primary transition font-bold"><ArrowLeft className="w-5 h-5 mr-2" /> Kembali</Link>
                    <div className="flex items-center font-bold text-primary gap-2"><Megaphone className="w-5 h-5" /> Pengumuman Masjid</div>
                </div>
            </nav>

            <div className="max-w-4xl mx-auto px-4 pt-10">
                <div className="mb-10 text-center">
                    <h1 className="text-3xl font-extrabold text-gray-800 mb-2">Pusat Informasi & Pengumuman</h1>
                    <p className="text-gray-500">Daftar donatur, laporan kegiatan, dan informasi resmi takmir masjid.</p>
                </div>

                {loading ? (
                    <div className="text-center py-10"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary mx-auto"></div></div>
                ) : Object.keys(groupedData).length === 0 ? (
                    <div className="text-center py-10 text-gray-400">Belum ada pengumuman saat ini.</div>
                ) : (
                    Object.entries(groupedData).map(([monthYear, items]) => (
                        <div key={monthYear} className="mb-10">
                            <div className="flex items-center gap-3 mb-4">
                                <CalendarDays className="w-5 h-5 text-primary" />
                                <h2 className="text-xl font-bold text-gray-800 border-b-2 border-primary/30 pb-1">{monthYear}</h2>
                            </div>
                            <div className="space-y-4">
                                {items.map((item) => (
                                    <Link key={item.id} to={`/pengumuman/${item.slug}`} className="block bg-white p-5 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md hover:border-primary/50 transition group">
                                        <h3 className="font-bold text-lg text-gray-800 group-hover:text-primary transition">{item.judul}</h3>
                                        <p className="text-sm text-gray-500 mt-2 line-clamp-2">{item.konten}</p>
                                        <div className="text-xs font-bold text-primary mt-4 flex items-center">Baca Selengkapnya &rarr;</div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}