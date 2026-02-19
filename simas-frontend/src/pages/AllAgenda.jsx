// src/pages/AllAgenda.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Clock, MapPin, Calendar as CalendarIcon, Filter } from 'lucide-react';
import api from '../api/axios';

export default function AllAgenda() {
    const currentYear = new Date().getFullYear();
    const [agendas, setAgendas] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Filter States
    const [filterMonth, setFilterMonth] = useState(''); // '' artinya Default (3 Bulan ke depan)
    const [filterYear, setFilterYear] = useState(currentYear.toString());

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    // Efek ini akan berjalan saat halaman dimuat ATAU saat filter diubah
    useEffect(() => {
        fetchAgendas();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filterMonth, filterYear]);

    const fetchAgendas = async () => {
        setLoading(true);
        try {
            let url = '/public/agenda';
            
            // Tambahkan parameter query jika filter spesifik dipilih
            if (filterMonth && filterYear) {
                url += `?month=${filterMonth}&year=${filterYear}`;
            }

            const res = await api.get(url);
            setAgendas(res.data.data);
        } catch (error) { 
            console.error(error); 
        } finally { 
            setLoading(false); 
        }
    };

    // LOGIKA PENGELOMPOKAN DATA (GROUPING BERDASARKAN BULAN & TAHUN)
    const groupedAgendas = agendas.reduce((groups, agenda) => {
        const date = new Date(agenda.waktu_pelaksanaan);
        const monthYearStr = date.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
        
        if (!groups[monthYearStr]) {
            groups[monthYearStr] = [];
        }
        groups[monthYearStr].push(agenda);
        return groups;
    }, {});

    // Daftar bulan untuk Dropdown
    const monthsList = [
        { val: '01', name: 'Januari' }, { val: '02', name: 'Februari' }, { val: '03', name: 'Maret' },
        { val: '04', name: 'April' }, { val: '05', name: 'Mei' }, { val: '06', name: 'Juni' },
        { val: '07', name: 'Juli' }, { val: '08', name: 'Agustus' }, { val: '09', name: 'September' },
        { val: '10', name: 'Oktober' }, { val: '11', name: 'November' }, { val: '12', name: 'Desember' }
    ];

    // Daftar 3 tahun (Sekarang dan 2 tahun ke depan)
    const yearsList = [currentYear, currentYear + 1, currentYear + 2];

    return (
        <div className="min-h-screen bg-gray-50 font-sans pb-20">
            {/* Topbar Navigasi */}
            <nav className="bg-white shadow-sm sticky top-0 z-50 p-4 border-b border-gray-100">
                <div className="max-w-4xl mx-auto flex items-center">
                    <Link to="/" className="flex items-center text-gray-600 hover:text-primary transition font-bold">
                        <ArrowLeft className="w-5 h-5 mr-2" /> Kembali ke Beranda
                    </Link>
                </div>
            </nav>

            <div className="max-w-4xl mx-auto px-4 pt-10">
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-extrabold text-gray-800 mb-2">Semua Agenda Masjid</h1>
                        <p className="text-gray-500">Jadwal kegiatan dan kajian di Masjid An-Nur Puloniti.</p>
                    </div>

                    {/* FITUR FILTER BULAN & TAHUN */}
                    <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-sm flex items-center gap-3 w-full md:w-auto">
                        <Filter className="w-5 h-5 text-gray-400 ml-1 hidden sm:block" />
                        <select 
                            value={filterMonth} 
                            onChange={(e) => setFilterMonth(e.target.value)}
                            className="bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-lg focus:ring-primary focus:border-primary block w-full p-2.5 outline-none cursor-pointer font-medium"
                        >
                            <option value="">Tampilkan 3 Bulan Ke Depan</option>
                            <option value="disabled" disabled>──────────</option>
                            {monthsList.map(m => (
                                <option key={m.val} value={m.val}>Bulan {m.name}</option>
                            ))}
                        </select>
                        
                        <select 
                            value={filterYear} 
                            onChange={(e) => setFilterYear(e.target.value)}
                            disabled={!filterMonth} // Hanya bisa ubah tahun jika bulan spesifik dipilih
                            className={`border border-gray-200 text-sm rounded-lg focus:ring-primary focus:border-primary block p-2.5 outline-none font-medium ${!filterMonth ? 'bg-gray-100 text-gray-400' : 'bg-gray-50 text-gray-700 cursor-pointer'}`}
                        >
                            {yearsList.map(y => (
                                <option key={y} value={y}>{y}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* AREA DAFTAR AGENDA */}
                {loading ? (
                    <div className="flex items-center justify-center py-20"><div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div></div>
                ) : agendas.length === 0 ? (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10 text-center">
                        <CalendarIcon className="w-16 h-16 text-gray-300 mx-auto mb-3"/>
                        <h3 className="text-lg font-bold text-gray-700 mb-1">Tidak Ada Jadwal</h3>
                        <p className="text-gray-500">Belum ada agenda yang dijadwalkan pada waktu tersebut.</p>
                    </div>
                ) : (
                    <div className="space-y-8">
                        {/* ITERASI GROUPING BULAN-TAHUN */}
                        {Object.keys(groupedAgendas).map((monthYear, index) => (
                            <div key={index} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                                
                                {/* Header Grup (Contoh: "Februari 2026") */}
                                <div className="bg-primary/5 border-b border-primary/10 p-4">
                                    <h2 className="text-xl font-black text-primary flex items-center">
                                        <CalendarIcon className="w-5 h-5 mr-2" /> {monthYear}
                                    </h2>
                                </div>

                                {/* Isi Daftar Agenda di bulan tersebut */}
                                <div className="divide-y divide-gray-100">
                                    {groupedAgendas[monthYear].map(item => (
                                        <div key={item.id} className="flex gap-4 sm:gap-6 items-start p-5 hover:bg-gray-50 transition">
                                            
                                            {/* Kotak Tanggal */}
                                            <div className="bg-blue-50 text-blue-700 w-16 h-16 rounded-xl flex flex-col items-center justify-center flex-shrink-0 border border-blue-100/50">
                                                <span className="text-xs font-bold uppercase tracking-wide">
                                                    {new Date(item.waktu_pelaksanaan).toLocaleString('id', {weekday: 'short'})}
                                                </span>
                                                <span className="text-2xl font-black leading-none mt-0.5">
                                                    {new Date(item.waktu_pelaksanaan).getDate()}
                                                </span>
                                            </div>
                                            
                                            {/* Info Agenda */}
                                            <div className="flex-1">
                                                <h4 className="font-bold text-gray-800 text-lg mb-1">{item.judul}</h4>
                                                <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm font-medium text-gray-500 mb-2">
                                                    <span className="flex items-center text-primary bg-blue-50/50 px-2 py-0.5 rounded">
                                                        <Clock className="w-3.5 h-3.5 mr-1.5"/> 
                                                        {new Date(item.waktu_pelaksanaan).toLocaleTimeString('id-ID', {hour: '2-digit', minute: '2-digit'})}
                                                        {item.waktu_selesai ? ` - ${new Date(item.waktu_selesai).toLocaleTimeString('id-ID', {hour: '2-digit', minute: '2-digit'})}` : ''} WIB
                                                    </span>
                                                    <span className="flex items-center text-red-500">
                                                        <MapPin className="w-3.5 h-3.5 mr-1"/> {item.lokasi}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-gray-600 leading-relaxed">{item.deskripsi}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}