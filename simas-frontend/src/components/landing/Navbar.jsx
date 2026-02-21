import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export default function Navbar() {
    return (
        <nav className="bg-white shadow-sm sticky top-0 z-50" aria-label="Navigasi Utama">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16 items-center">
                    <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.scrollTo(0,0)}>
                        <div className="w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center font-bold text-xl shadow-lg">A</div>
                        <span className="font-bold text-xl text-gray-800 tracking-tight">Masjid An-Nur</span>
                    </div>
                    <div className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-600">
                        <a href="#donasi" className="hover:text-primary transition">Donasi</a>
                        <a href="#transparansi" className="hover:text-primary transition">Keuangan</a>
                        <a href="#tentang" className="hover:text-primary transition">Tentang</a>
                        <a href="#program" className="hover:text-primary transition">Program</a>
                        <a href="#galeri" className="hover:text-primary transition">Galeri</a>
                        <Link to="/perpustakaan" className="hover:text-primary transition text-primary font-bold">
                            📚 Perpustakaan
                        </Link>
                    </div>
                    <div>
                        <Link to="/login" className="text-primary font-semibold hover:bg-green-50 px-5 py-2.5 rounded-full transition flex items-center border border-primary text-sm">
                            Masuk Pengurus <ArrowRight className="w-4 h-4 ml-2" aria-hidden="true" />
                        </Link>
                    </div>
                </div>
            </div>
        </nav>
    );
}