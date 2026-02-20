import { useMemo, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Clock, ArrowRight } from 'lucide-react';

// Sub-komponen countdown ditempatkan langsung di file ini karena hanya relevan untuk Agenda
const AgendaCountdown = ({ mainAgenda }) => {
    const [timeLeft, setTimeLeft] = useState(null);
    const [eventStatus, setEventStatus] = useState('upcoming');

    useEffect(() => {
        let interval;
        if (mainAgenda) {
            const startDate = new Date(mainAgenda.waktu_pelaksanaan).getTime();
            const endDate = mainAgenda.waktu_selesai ? new Date(mainAgenda.waktu_selesai).getTime() : startDate + (2 * 60 * 60 * 1000);

            const calculateTimeLeft = () => {
                const now = new Date().getTime();
                const distanceToStart = startDate - now;
                const distanceToEnd = endDate - now;

                if (distanceToStart > 0) {
                    setEventStatus('upcoming');
                    setTimeLeft({
                        d: Math.floor(distanceToStart / (1000 * 60 * 60 * 24)),
                        h: Math.floor((distanceToStart % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
                        m: Math.floor((distanceToStart % (1000 * 60 * 60)) / (1000 * 60)),
                        s: Math.floor((distanceToStart % (1000 * 60)) / 1000)
                    });
                } else if (distanceToStart <= 0 && distanceToEnd > 0) {
                    setEventStatus('ongoing');
                    setTimeLeft(null);
                } else {
                    setEventStatus('finished');
                    setTimeLeft(null);
                    clearInterval(interval);
                }
            };
            calculateTimeLeft(); 
            interval = setInterval(calculateTimeLeft, 1000); 
        }
        return () => { if (interval) clearInterval(interval); };
    }, [mainAgenda]);

    if (!mainAgenda) return <p className="text-gray-400">Belum ada agenda terdekat.</p>;

    return (
        <>
            <h3 className="text-2xl md:text-3xl font-bold mb-2 leading-tight">{mainAgenda.judul}</h3>
            <p className="text-gray-400 text-sm mb-8"><MapPin className="w-3 h-3 inline mr-1"/> {mainAgenda.lokasi}</p>
            
            {eventStatus === 'upcoming' && timeLeft && (
                <div className="grid grid-cols-4 gap-2 text-center" aria-label="Waktu menuju acara">
                    <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm border border-white/10"><span className="block text-2xl md:text-3xl font-bold">{timeLeft.d}</span><span className="text-[10px] text-gray-400 uppercase tracking-wide">Hari</span></div>
                    <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm border border-white/10"><span className="block text-2xl md:text-3xl font-bold">{timeLeft.h}</span><span className="text-[10px] text-gray-400 uppercase tracking-wide">Jam</span></div>
                    <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm border border-white/10"><span className="block text-2xl md:text-3xl font-bold">{timeLeft.m}</span><span className="text-[10px] text-gray-400 uppercase tracking-wide">Menit</span></div>
                    <div className="bg-primary/80 rounded-lg p-3 backdrop-blur-sm border border-primary/50 text-white"><span className="block text-2xl md:text-3xl font-bold">{timeLeft.s}</span><span className="text-[10px] text-green-100 uppercase tracking-wide">Detik</span></div>
                </div>
            )}
            
            {eventStatus === 'ongoing' && (
                <div className="bg-blue-600 text-white p-4 rounded-lg font-bold text-center animate-pulse shadow-lg border border-blue-400">🔴 ACARA SEDANG BERLANGSUNG</div>
            )}

            {eventStatus === 'finished' && (
                <div className="bg-gray-800 text-gray-400 p-4 rounded-lg font-bold text-center border border-gray-700">Acara Telah Selesai</div>
            )}
        </>
    );
};

export default function AgendaSection({ agendaData }) {
    const mainAgenda = useMemo(() => agendaData?.length > 0 ? agendaData[0] : null, [agendaData]);
    const otherAgendas = useMemo(() => agendaData?.length > 1 ? agendaData.slice(1) : [], [agendaData]);

    return (
        <section id="agenda" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 relative z-20 mb-12">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden flex flex-col md:flex-row">
                <div className="bg-gray-900 text-white p-8 md:p-10 md:w-5/12 flex flex-col justify-center relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-40 h-40 bg-white opacity-5 rounded-full blur-2xl transform translate-x-10 -translate-y-10"></div>
                    <div className="flex items-center gap-2 text-primary font-bold text-sm tracking-widest uppercase mb-4">
                        <Clock className="w-4 h-4" aria-hidden="true" /> Agenda Terdekat
                    </div>
                    
                    <AgendaCountdown mainAgenda={mainAgenda} />
                </div>

                <div className="p-8 md:p-10 md:w-7/12 bg-white flex flex-col">
                    <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
                        <h3 className="text-lg font-bold text-gray-800">Jadwal Lainnya</h3>
                        <Link to="/agenda-lengkap" className="text-sm text-primary font-bold hover:underline cursor-pointer flex items-center">
                            Lihat Semua <ArrowRight className="w-3 h-3 ml-1" />
                        </Link>
                    </div>
                    
                    <div className="space-y-4 max-h-[150px] overflow-y-auto pr-2" style={{ scrollbarWidth: 'thin' }}>
                        {otherAgendas.length > 0 ? otherAgendas.map(item => (
                            <article key={item.id} className="flex gap-4 items-start group">
                                <div className="bg-blue-50 text-blue-700 w-14 h-14 rounded-xl flex flex-col items-center justify-center flex-shrink-0 group-hover:bg-primary group-hover:text-white transition">
                                    <span className="text-xs font-bold uppercase">{new Date(item.waktu_pelaksanaan).toLocaleString('id', {month: 'short'})}</span>
                                    <span className="text-xl font-black leading-none">{new Date(item.waktu_pelaksanaan).getDate()}</span>
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-bold text-gray-800 text-base mb-1 group-hover:text-primary transition">{item.judul}</h4>
                                    <p className="text-xs text-gray-500 mb-1"><Clock className="w-3 h-3 inline mr-1"/> {new Date(item.waktu_pelaksanaan).toLocaleTimeString('id-ID', {hour: '2-digit', minute: '2-digit'})} WIB</p>
                                    <p className="text-sm text-gray-600 line-clamp-1">{item.deskripsi}</p>
                                </div>
                            </article>
                        )) : (
                            <p className="text-gray-500 text-sm italic">Tidak ada agenda tambahan dalam waktu dekat.</p>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
}