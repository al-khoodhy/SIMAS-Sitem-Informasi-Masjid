// src/pages/AllAgenda.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Clock, MapPin, Calendar } from 'lucide-react';
import api from '../api/axios';

export default function AllAgenda() {
    const [agendas, setAgendas] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        window.scrollTo(0, 0);
        fetchAgendas();
    }, []);

    const fetchAgendas = async () => {
        try {
            const res = await api.get('/public/agenda');
            setAgendas(res.data.data);
        } catch (error) { console.error(error); } finally { setLoading(false); }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-50"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div></div>;

    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            <nav className="bg-white shadow-sm sticky top-0 z-50 p-4">
                <div className="max-w-4xl mx-auto flex items-center">
                    <Link to="/" className="flex items-center text-gray-600 hover:text-primary transition font-bold">
                        <ArrowLeft className="w-5 h-5 mr-2" /> Kembali ke Beranda
                    </Link>
                </div>
            </nav>

            <div className="max-w-4xl mx-auto px-4 py-10">
                <h1 className="text-3xl font-extrabold text-gray-800 mb-2">Semua Agenda Masjid</h1>
                <p className="text-gray-500 mb-8">Jadwal kegiatan dan kajian di Masjid An-Nur Puloniti.</p>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
                    {agendas.length === 0 ? (
                        <div className="text-center py-10"><Calendar className="w-12 h-12 text-gray-300 mx-auto mb-2"/><p className="text-gray-500">Belum ada agenda terjadwal.</p></div>
                    ) : (
                        agendas.map(item => (
                            <div key={item.id} className="flex gap-6 items-start p-4 hover:bg-gray-50 rounded-xl transition border border-transparent hover:border-gray-100">
                                <div className="bg-blue-50 text-blue-700 w-16 h-16 rounded-xl flex flex-col items-center justify-center flex-shrink-0">
                                    <span className="text-xs font-bold uppercase">{new Date(item.waktu_pelaksanaan).toLocaleString('id', {month: 'short'})}</span>
                                    <span className="text-2xl font-black leading-none">{new Date(item.waktu_pelaksanaan).getDate()}</span>
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-bold text-gray-800 text-lg mb-1">{item.judul}</h4>
                                    <div className="flex flex-wrap gap-4 text-xs font-medium text-gray-500 mb-2">
                                        <span className="flex items-center"><Clock className="w-3.5 h-3.5 mr-1"/> {new Date(item.waktu_pelaksanaan).toLocaleTimeString('id-ID', {hour: '2-digit', minute: '2-digit'})} WIB</span>
                                        <span className="flex items-center text-red-500"><MapPin className="w-3.5 h-3.5 mr-1"/> {item.lokasi}</span>
                                    </div>
                                    <p className="text-sm text-gray-600 leading-relaxed">{item.deskripsi}</p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}