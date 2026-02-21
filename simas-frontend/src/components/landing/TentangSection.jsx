import { Info } from 'lucide-react';

export default function TentangSection() {
    return (
        <section id="tentang" className="bg-grey-50 py-20 mt-10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-sm font-bold mb-4">
                            <Info className="w-4 h-4" /> Profil Masjid
                        </div>
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-6">Mengenal Masjid An-Nur Puloniti</h2>
                        
                        <div className="text-gray-600 leading-relaxed mb-8">
                            <h3 className="text-xl font-bold mb-3 text-gray-800">Visi & Misi</h3>
                            <ul className="space-y-2 text-gray-700 list-disc list-inside mb-4">
                                <li>Mewujudkan masjid sebagai pusat peribadatan yang khusyuk.</li>
                                <li>Membangun generasi Qur'ani melalui pendidikan yang berkelanjutan.</li>
                                <li>Mengelola dana umat secara transparan, profesional, dan amanah.</li>
                            </ul>
                            Masjid An-Nur Puloniti berkomitmen menyajikan fasilitas ibadah yang nyaman, majelis ilmu yang mencerdaskan, serta sistem tata kelola keuangan yang 100% transparan dengan dukungan teknologi modern.
                        </div>
                    </div>
                    <div className="relative">
                        <div className="aspect-video bg-gray-200 rounded-2xl overflow-hidden shadow-lg relative">
                            <img src="https://images.unsplash.com/photo-1564683214965-3619addd900d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80&fm=webp" alt="Masjid An-Nur Puloniti" loading="lazy" decoding="async" className="w-full h-full object-cover" />
                        </div>
                        <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-xl shadow-xl border border-gray-100 hidden md:block">
                            <p className="text-3xl font-bold text-primary mb-1">100%</p>
                            <p className="text-sm font-medium text-gray-500">Transparan & Amanah</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}