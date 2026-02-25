import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Megaphone, Calendar } from 'lucide-react';
import api from '../api/axios';

export default function PengumumanDetail() {
    const { slug } = useParams();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        window.scrollTo(0, 0);
        const fetchDetail = async () => {
            try {
                const res = await api.get(`/public/pengumuman/${slug}`);
                setData(res.data.data);
            } catch (err) { console.error(err); } finally { setLoading(false); }
        };
        fetchDetail();
    }, [slug]);

    // FUNGSI PINTAR: Merender enter jadi Paragraf, awalan '-' jadi List
    const renderTextWithList = (text) => {
        if (!text) return null;
        const lines = text.split('\n');
        return lines.map((line, index) => {
            if (line.trim().startsWith('-')) {
                return <li key={index} className="ml-6 list-disc text-gray-700 py-1">{line.substring(1).trim()}</li>;
            }
            if (line.trim() === '') return <br key={index} />;
            return <p key={index} className="text-gray-700 leading-relaxed mb-2">{line}</p>;
        });
    };

    if (loading) return <div className="min-h-screen flex justify-center pt-20"><div className="animate-spin rounded-full h-10 w-10 border-t-2 border-primary"></div></div>;
    if (!data) return <div className="text-center pt-20">Pengumuman tidak ditemukan.</div>;

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            <nav className="bg-white shadow-sm sticky top-0 z-50 p-4 border-b border-gray-100">
                <div className="max-w-4xl mx-auto flex items-center justify-between">
                    <Link to="/pengumuman" className="flex items-center text-gray-600 hover:text-primary transition font-bold"><ArrowLeft className="w-5 h-5 mr-2" /> Kembali ke Daftar</Link>
                </div>
            </nav>

            <div className="max-w-3xl mx-auto px-4 pt-10">
                <div className="bg-white p-6 md:p-10 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex items-center gap-2 text-sm font-bold text-primary mb-4 bg-primary/10 w-fit px-3 py-1.5 rounded-lg">
                        <Megaphone className="w-4 h-4" /> Pengumuman Resmi
                    </div>
                    <h1 className="text-2xl md:text-4xl font-extrabold text-gray-900 mb-4 leading-tight">{data.judul}</h1>
                    <div className="flex items-center text-sm text-gray-500 mb-8 border-b border-gray-100 pb-6">
                        <Calendar className="w-4 h-4 mr-2" /> 
                        Diterbitkan: {new Date(data.tanggal_publish).toLocaleDateString('id-ID', { day:'numeric', month:'long', year:'numeric' })}
                    </div>

                    {/* Render Konten Teks & List */}
                    <div className="prose max-w-none">
                        <ul className="m-0 p-0">{renderTextWithList(data.konten)}</ul>
                    </div>
                </div>
            </div>
        </div>
    );
}