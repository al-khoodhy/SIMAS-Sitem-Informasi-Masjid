import { Link } from 'react-router-dom';
import { MapPin, Phone } from 'lucide-react';

export default function Footer() {
    return (
        <footer className="bg-gray-900 text-gray-300 py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-8">
                <div>
                    <div className="flex items-center gap-2 mb-4">
                        <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center font-bold">A</div>
                        <span className="font-bold text-xl text-white">SIMAS An-Nur</span>
                    </div>
                    <p className="text-sm text-gray-400 leading-relaxed">Sistem Informasi Manajemen Masjid. Membangun umat melalui transparansi digital, pendidikan, dan manajemen yang terintegrasi.</p>
                </div>
                <div>
                    <h4 className="text-white font-bold mb-4">Hubungi Kami</h4>
                    <ul className="space-y-3 text-sm">
                        <li className="flex items-start gap-3"><MapPin className="w-5 h-5 text-primary flex-shrink-0" /> Desa Puloniti, Kecamatan Bangsal, Kabupaten Mojokerto, Jawa Timur</li>
                        <li className="flex items-center gap-3"><Phone className="w-5 h-5 text-primary flex-shrink-0" /> +62 812 3456 7890 (Takmir)</li>
                    </ul>
                </div>
                <div>
                    <h4 className="text-white font-bold mb-4">Akses Cepat</h4>
                    <ul className="space-y-2 text-sm">
                        <li><a href="#donasi" className="hover:text-primary transition">Salurkan Wakaf / Donasi</a></li>
                        <li><a href="#program" className="hover:text-primary transition">Jadwal Kegiatan</a></li>
                        <li><Link to="/login" className="hover:text-primary transition">Masuk Dasbor Pengurus (Login)</Link></li>
                    </ul>
                </div>
            </div>
            <div className="border-t border-gray-800 mt-10 pt-8 text-center text-sm text-gray-500">
                &copy; {new Date().getFullYear()} Masjid An-Nur Puloniti. by Abdurrahman Al Khoodhy'.
            </div>
        </footer>
    );
}