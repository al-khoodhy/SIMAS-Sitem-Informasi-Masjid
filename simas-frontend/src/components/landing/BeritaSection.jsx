import { Link } from 'react-router-dom';
import { ArrowRight, Eye, Calendar } from 'lucide-react';
import { formatTanggal } from '../../utils/formatters';

export default function BeritaSection({ beritaData }) {
    return (
        <section id="berita" className="bg-gray-50 py-20 border-t border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-4">
                    <div>
                        <h2 className="text-3xl font-bold text-gray-800">Berita Terkini</h2>
                        <p className="text-gray-500 mt-2">Update informasi dan laporan kegiatan dari Jurnalis Masjid.</p>
                    </div>
                    <Link to="/berita-lengkap" className="text-primary font-bold hover:underline flex items-center bg-blue-50/80 border border-blue-100 px-5 py-2.5 rounded-xl transition hover:bg-blue-100 shadow-sm">
                        Lihat Semua Berita <ArrowRight className="w-4 h-4 ml-2" aria-hidden="true" />
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {beritaData.length === 0 ? (
                        <div className="col-span-full text-center text-gray-500 bg-white p-8 rounded-xl border border-gray-100">Belum ada berita dipublikasikan.</div>
                    ) : (
                        beritaData.map(b => (
                            <Link to={`/berita/${b.id}`} key={b.id} className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-lg transition group flex flex-col">
                                <div className="h-48 bg-gray-200 overflow-hidden relative">
                                    {b.thumbnail ? (
                                        <img src={`http://localhost:8000/storage/${b.thumbnail}`} alt={b.judul} loading="lazy" decoding="async" className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-gray-100"><Calendar className="w-10 h-10 text-gray-300" /></div>
                                    )}
                                </div>
                                <article className="p-6 flex-1 flex flex-col">
                                    <div className="flex justify-between items-center mb-2">
                                        <p className="text-xs text-primary font-bold">{formatTanggal(b.created_at)}</p>
                                        <p className="text-[10px] text-gray-400 font-bold flex items-center bg-gray-50 px-2 py-0.5 rounded-full border border-gray-100"><Eye className="w-3 h-3 mr-1"/> {b.views || 0} kali dibaca</p>
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-800 mb-3 line-clamp-2 group-hover:text-primary transition">{b.judul}</h3>
                                    <p className="text-gray-500 text-sm line-clamp-3 mb-4">{b.konten}</p>
                                    <div className="mt-auto pt-4 border-t border-gray-50 text-xs text-gray-400 flex justify-between items-center">
                                        <span>Oleh: {b.penulis?.name || 'Admin'}</span>
                                        <span className="text-primary font-bold">Baca <ArrowRight className="w-3 h-3 inline"/></span>
                                    </div>
                                </article>
                            </Link>
                        ))
                    )}
                </div>
            </div>
        </section>
    );
}