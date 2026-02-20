import { BookOpen, Users, Moon, Sparkles } from 'lucide-react';

export default function ProgramSection() {
    return (
        <section id="program" className="bg-white py-20 border-t border-gray-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-3xl font-bold text-gray-800">Program & Kegiatan Unggulan</h2>
                    <p className="text-gray-500 mt-3 max-w-2xl mx-auto">Kami senantiasa menghidupkan masjid dengan berbagai kegiatan positif untuk semua kalangan usia.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <article className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:-translate-y-1 hover:shadow-lg transition">
                        <div className="w-14 h-14 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center mb-6"><BookOpen className="w-7 h-7" /></div>
                        <h3 className="text-xl font-bold text-gray-800 mb-3">Pendidikan Islam</h3>
                        <p className="text-gray-600 leading-relaxed mb-4">Membangun generasi Qur'ani sejak dini melalui program baca tulis Al-Quran dan perbaikan tajwid.</p>
                        <ul className="text-sm text-gray-500 space-y-2">
                            <li className="flex items-center"><Sparkles className="w-4 h-4 mr-2 text-indigo-400" /> TPQ Anak-anak</li>
                            <li className="flex items-center"><Sparkles className="w-4 h-4 mr-2 text-indigo-400" /> Tahsin (Perbaikan Bacaan)</li>
                            <li className="flex items-center font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded w-fit mt-2">Setiap Rabu, Pukul 15:30 WIB</li>
                        </ul>
                    </article>
                    <article className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:-translate-y-1 hover:shadow-lg transition">
                        <div className="w-14 h-14 bg-teal-100 text-teal-600 rounded-xl flex items-center justify-center mb-6"><Users className="w-7 h-7" /></div>
                        <h3 className="text-xl font-bold text-gray-800 mb-3">Majelis Ilmu & Dzikir</h3>
                        <p className="text-gray-600 leading-relaxed mb-4">Wadah silaturahmi jamaah untuk menuntut ilmu agama dan memperkuat keimanan bersama.</p>
                        <ul className="text-sm text-gray-500 space-y-2">
                            <li className="flex items-center"><Sparkles className="w-4 h-4 mr-2 text-teal-400" /> Kajian Rutin (Setiap Selasa)</li>
                            <li className="flex items-center"><Sparkles className="w-4 h-4 mr-2 text-teal-400" /> Yasinan (Setiap Kamis Malam)</li>
                            <li className="flex items-center"><Sparkles className="w-4 h-4 mr-2 text-teal-400" /> Istighosah (Rutin Bulanan)</li>
                        </ul>
                    </article>
                    <article className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:-translate-y-1 hover:shadow-lg transition relative overflow-hidden">
                        <div className="w-14 h-14 bg-orange-100 text-orange-600 rounded-xl flex items-center justify-center mb-6"><Moon className="w-7 h-7" /></div>
                        <h3 className="text-xl font-bold text-gray-800 mb-3">Ramadhan & Hari Besar</h3>
                        <p className="text-gray-600 leading-relaxed mb-4">Pengelolaan momen hari besar Islam secara terorganisir, transparan, dan penuh keberkahan.</p>
                        <ul className="text-sm text-gray-500 space-y-2">
                            <li className="flex items-start">
                                <Sparkles className="w-4 h-4 mr-2 mt-0.5 text-orange-400 flex-shrink-0" /> 
                                <div>I'tikaf Sepuluh Malam Terakhir<span className="block mt-1 bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-0.5 rounded animate-pulse w-fit">Disediakan Makan Sahur Gratis!</span></div>
                            </li>
                            <li className="flex items-center mt-3"><Sparkles className="w-4 h-4 mr-2 text-orange-400" /> Manajemen Penyaluran Qurban</li>
                        </ul>
                    </article>
                </div>
            </div>
        </section>
    );
}