// src/pages/LandingPage.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
    ArrowRight, Wallet, TrendingUp, TrendingDown, Target, 
    Heart, Calendar, MapPin, Phone, Info, BookOpen, Users, 
    Moon, Camera, Sparkles, Clock
} from 'lucide-react';
import api from '../api/axios';

export default function LandingPage() {
    const [data, setData] = useState({
        keuangan: { total_pemasukan: 0, total_pengeluaran: 0, saldo_akhir: 0 },
        campaigns: [],
        berita: [],
        agenda: []
    });
    const [loading, setLoading] = useState(true);

    const [timeLeft, setTimeLeft] = useState(null); // Ubah default menjadi null

    useEffect(() => {
        fetchPublicData();
    }, []);

    const fetchPublicData = async () => {
        try {
            const response = await api.get('/public/landing');
            setData(response.data.data);
        } catch (error) {
            console.error("Gagal mengambil data publik", error);
        } finally {
            setLoading(false);
        }
    };

    // Logika Countdown (Hitung Mundur) yang Diperbaiki
    useEffect(() => {
        let interval; // Deklarasikan variabel interval di luar blok if

        if (data.agenda && data.agenda.length > 0) {
            const targetDate = new Date(data.agenda[0].waktu_pelaksanaan).getTime();

            // Fungsi untuk menghitung sisa waktu
            const calculateTimeLeft = () => {
                const now = new Date().getTime();
                const distance = targetDate - now;

                if (distance < 0) {
                    clearInterval(interval);
                    setTimeLeft(null); // Acara sudah lewat atau sedang berlangsung
                } else {
                    setTimeLeft({
                        d: Math.floor(distance / (1000 * 60 * 60 * 24)),
                        h: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
                        m: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
                        s: Math.floor((distance % (1000 * 60)) / 1000)
                    });
                }
            };

            // Panggil sekali agar tidak ada jeda 1 detik saat komponen di-mount
            calculateTimeLeft(); 
            
            // Set interval untuk memperbarui setiap detik
            interval = setInterval(calculateTimeLeft, 1000); 
        }

        // Cleanup function (hanya akan menghapus interval jika interval sudah ada)
        return () => {
            if (interval) {
                clearInterval(interval);
            }
        };
    }, [data.agenda]);

    const formatRupiah = (angka) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(angka || 0);
    const formatTanggal = (tanggal) => new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(tanggal));

    if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-50"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div></div>;

    // Ambil agenda pertama (untuk countdown) dan sisanya untuk list
    const mainAgenda = data.agenda && data.agenda.length > 0 ? data.agenda[0] : null;
    const otherAgendas = data.agenda && data.agenda.length > 1 ? data.agenda.slice(1) : [];

    return (
        <div className="min-h-screen bg-gray-50 font-sans scroll-smooth">
            {/* 1. NAVBAR */}
            <nav className="bg-white shadow-sm sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16 items-center">
                        <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.scrollTo(0,0)}>
                            <div className="w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center font-bold text-xl shadow-lg">M</div>
                            <span className="font-bold text-xl text-gray-800 tracking-tight">SIMAS Puloniti</span>
                        </div>
                        <div className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-600">
                            <a href="#tentang" className="hover:text-primary transition">Tentang Kami</a>
                            <a href="#agenda" className="hover:text-primary transition">Agenda</a>
                            <a href="#transparansi" className="hover:text-primary transition">Keuangan</a>
                            <a href="#galeri" className="hover:text-primary transition">Galeri</a>
                        </div>
                        <div>
                            <Link to="/login" className="text-primary font-semibold hover:bg-green-50 px-5 py-2.5 rounded-full transition flex items-center border border-primary text-sm">
                                Masuk Pengurus <ArrowRight className="w-4 h-4 ml-2" />
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>

            {/* 2. HERO SECTION */}
            <div className="relative bg-primary overflow-hidden">
                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-32 text-center relative z-10">
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-6 leading-tight">
                        Selamat Datang di Portal Resmi <br/> Masjid An - Nur Puloniti
                    </h1>
                    <p className="text-green-100 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
                        Membangun umat yang berakhlak mulia melalui pendidikan, majelis ilmu, dan transparansi pengelolaan dana umat secara digital.
                    </p>
                    <div className="flex flex-col sm:flex-row justify-center gap-4">
                        <a href="#donasi" className="bg-white text-primary font-bold px-8 py-3.5 rounded-full shadow-xl hover:shadow-2xl hover:scale-105 transition-all">
                            Salurkan Donasi
                        </a>
                        <a href="#agenda" className="bg-transparent border border-white text-white font-bold px-8 py-3.5 rounded-full hover:bg-white/10 transition-all">
                            Lihat Jadwal Kajian
                        </a>
                    </div>
                </div>
            </div>

            {/* 3. AGENDA & COUNTDOWN SECTION */}
            <div id="agenda" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 relative z-20 mb-16">
                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden flex flex-col md:flex-row">
                    {/* Sisi Kiri: Hitung Mundur */}
                    <div className="bg-gray-900 text-white p-8 md:p-10 md:w-5/12 flex flex-col justify-center relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-40 h-40 bg-white opacity-5 rounded-full blur-2xl transform translate-x-10 -translate-y-10"></div>
                        <div className="flex items-center gap-2 text-primary font-bold text-sm tracking-widest uppercase mb-4">
                            <Clock className="w-4 h-4" /> Agenda Terdekat
                        </div>
                        
                        {mainAgenda ? (
                            <>
                                <h3 className="text-2xl md:text-3xl font-bold mb-2 leading-tight">{mainAgenda.judul}</h3>
                                <p className="text-gray-400 text-sm mb-8"><MapPin className="w-3 h-3 inline mr-1"/> {mainAgenda.lokasi}</p>
                                
                                {timeLeft ? (
                                    <div className="grid grid-cols-4 gap-2 text-center">
                                        <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm border border-white/10">
                                            <span className="block text-2xl md:text-3xl font-bold">{timeLeft.d}</span>
                                            <span className="text-[10px] text-gray-400 uppercase tracking-wide">Hari</span>
                                        </div>
                                        <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm border border-white/10">
                                            <span className="block text-2xl md:text-3xl font-bold">{timeLeft.h}</span>
                                            <span className="text-[10px] text-gray-400 uppercase tracking-wide">Jam</span>
                                        </div>
                                        <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm border border-white/10">
                                            <span className="block text-2xl md:text-3xl font-bold">{timeLeft.m}</span>
                                            <span className="text-[10px] text-gray-400 uppercase tracking-wide">Menit</span>
                                        </div>
                                        <div className="bg-primary/80 rounded-lg p-3 backdrop-blur-sm border border-primary/50 text-white">
                                            <span className="block text-2xl md:text-3xl font-bold">{timeLeft.s}</span>
                                            <span className="text-[10px] text-green-100 uppercase tracking-wide">Detik</span>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="bg-primary text-white p-4 rounded-lg font-bold text-center animate-pulse">
                                        Acara Sedang Berlangsung / Telah Selesai
                                    </div>
                                )}
                            </>
                        ) : (
                            <p className="text-gray-400">Belum ada agenda terdekat.</p>
                        )}
                    </div>

                    {/* Sisi Kanan: Daftar Agenda Lainya */}
                    <div className="p-8 md:p-10 md:w-7/12 bg-white">
                        <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
                            <h3 className="text-lg font-bold text-gray-800">Jadwal Lainnya</h3>
                            <span className="text-sm text-primary font-bold hover:underline cursor-pointer">Lihat Semua</span>
                        </div>
                        
                        <div className="space-y-4">
                            {otherAgendas.length > 0 ? otherAgendas.map(item => (
                                <div key={item.id} className="flex gap-4 items-start group">
                                    <div className="bg-blue-50 text-blue-700 w-14 h-14 rounded-xl flex flex-col items-center justify-center flex-shrink-0 group-hover:bg-primary group-hover:text-white transition">
                                        <span className="text-xs font-bold uppercase">{new Date(item.waktu_pelaksanaan).toLocaleString('id', {month: 'short'})}</span>
                                        <span className="text-xl font-black leading-none">{new Date(item.waktu_pelaksanaan).getDate()}</span>
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-800 text-base mb-1 group-hover:text-primary transition">{item.judul}</h4>
                                        <p className="text-xs text-gray-500 mb-1"><Clock className="w-3 h-3 inline mr-1"/> {new Date(item.waktu_pelaksanaan).toLocaleTimeString('id-ID', {hour: '2-digit', minute: '2-digit'})} WIB</p>
                                        <p className="text-sm text-gray-600 line-clamp-1">{item.deskripsi}</p>
                                    </div>
                                </div>
                            )) : (
                                <p className="text-gray-500 text-sm italic">Tidak ada agenda tambahan dalam waktu dekat.</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* 4. TRANSPARANSI KAS MASJID */}
            <div id="transparansi" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 relative z-20">
                <div className="bg-white rounded-2xl shadow-xl p-6 md:p-10 border border-gray-100">
                    <div className="text-center mb-8">
                        <h2 className="text-2xl font-bold text-gray-800 flex items-center justify-center gap-2">
                            <Wallet className="text-primary" /> Transparansi Kas Masjid
                        </h2>
                        <p className="text-gray-500 mt-2">Data keuangan diperbarui secara real-time oleh Bendahara.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-green-50/50 border border-green-100 p-6 rounded-xl text-center hover:shadow-md transition">
                            <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4"><TrendingUp className="w-6 h-6" /></div>
                            <p className="text-gray-500 font-medium mb-1">Total Pemasukan</p>
                            <h3 className="text-2xl font-bold text-green-600">{formatRupiah(data.keuangan.total_pemasukan)}</h3>
                        </div>
                        <div className="bg-primary shadow-lg shadow-green-200 p-6 rounded-xl text-center transform md:-translate-y-4">
                            <div className="w-12 h-12 bg-white/20 text-white rounded-full flex items-center justify-center mx-auto mb-4"><Wallet className="w-6 h-6" /></div>
                            <p className="text-green-100 font-medium mb-1">Saldo Kas Saat Ini</p>
                            <h3 className="text-3xl font-extrabold text-white">{formatRupiah(data.keuangan.saldo_akhir)}</h3>
                            <p className="text-xs text-green-200 mt-2">Dana siap digunakan untuk umat</p>
                        </div>
                        <div className="bg-red-50/50 border border-red-100 p-6 rounded-xl text-center hover:shadow-md transition">
                            <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4"><TrendingDown className="w-6 h-6" /></div>
                            <p className="text-gray-500 font-medium mb-1">Total Pengeluaran</p>
                            <h3 className="text-2xl font-bold text-red-600">{formatRupiah(data.keuangan.total_pengeluaran)}</h3>
                        </div>
                    </div>
                </div>
            </div>

            {/* 5. TENTANG KAMI */}
            <div id="tentang" className="bg-white py-20 mt-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        <div>
                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-sm font-bold mb-4">
                                <Info className="w-4 h-4" /> Profil Masjid
                            </div>
                            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-6">Mengenal Masjid Jami' Puloniti</h2>
                            <p className="text-gray-600 leading-relaxed mb-6">
                                Masjid Jami' Puloniti bukan sekadar tempat ibadah, melainkan pusat peradaban dan pemberdayaan umat di wilayah kami. Kami berkomitmen untuk menyajikan fasilitas ibadah yang nyaman, majelis ilmu yang mencerdaskan, serta sistem tata kelola keuangan yang 100% transparan dan dapat dipertanggungjawabkan kepada jamaah.
                            </p>
                            <p className="text-gray-600 leading-relaxed mb-8">
                                Dengan dukungan teknologi modern (SIMAS), seluruh donasi, infaq, dan zakat jamaah dicatat secara digital agar manfaatnya dapat tersalurkan dengan tepat sasaran kepada para mustahik dan operasional masjid.
                            </p>
                        </div>
                        <div className="relative">
                            <div className="aspect-video bg-gray-200 rounded-2xl overflow-hidden shadow-lg relative">
                                <img src="https://images.unsplash.com/photo-1564683214965-3619addd900d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80" alt="Masjid Jami Puloniti" className="w-full h-full object-cover" />
                            </div>
                            <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-xl shadow-xl border border-gray-100 hidden md:block">
                                <p className="text-3xl font-bold text-primary mb-1">100%</p>
                                <p className="text-sm font-medium text-gray-500">Transparan & Amanah</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* 6. PROGRAM & KEGIATAN RUTIN */}
            <div id="program" className="bg-gray-50 py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-gray-800">Program & Kegiatan Unggulan</h2>
                        <p className="text-gray-500 mt-3 max-w-2xl mx-auto">Kami senantiasa menghidupkan masjid dengan berbagai kegiatan positif untuk semua kalangan usia.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Card Pendidikan */}
                        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:-translate-y-1 hover:shadow-lg transition">
                            <div className="w-14 h-14 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center mb-6">
                                <BookOpen className="w-7 h-7" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-800 mb-3">Pendidikan Islam</h3>
                            <p className="text-gray-600 leading-relaxed mb-4">
                                Membangun generasi Qur'ani sejak dini melalui program baca tulis Al-Quran dan perbaikan tajwid.
                            </p>
                            <ul className="text-sm text-gray-500 space-y-2">
                                <li className="flex items-center"><Sparkles className="w-4 h-4 mr-2 text-indigo-400" /> TPQ Anak-anak</li>
                                <li className="flex items-center"><Sparkles className="w-4 h-4 mr-2 text-indigo-400" /> Tahsin (Perbaikan Bacaan)</li>
                                <li className="flex items-center font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded w-fit mt-2">Setiap Rabu, Pukul 15:30 WIB</li>
                            </ul>
                        </div>

                        {/* Card Majelis Ilmu */}
                        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:-translate-y-1 hover:shadow-lg transition">
                            <div className="w-14 h-14 bg-teal-100 text-teal-600 rounded-xl flex items-center justify-center mb-6">
                                <Users className="w-7 h-7" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-800 mb-3">Majelis Ilmu & Dzikir</h3>
                            <p className="text-gray-600 leading-relaxed mb-4">
                                Wadah silaturahmi jamaah untuk menuntut ilmu agama dan memperkuat keimanan bersama.
                            </p>
                            <ul className="text-sm text-gray-500 space-y-2">
                                <li className="flex items-center"><Sparkles className="w-4 h-4 mr-2 text-teal-400" /> Kajian Rutin (Setiap Selasa)</li>
                                <li className="flex items-center"><Sparkles className="w-4 h-4 mr-2 text-teal-400" /> Yasinan (Setiap Kamis Malam)</li>
                                <li className="flex items-center"><Sparkles className="w-4 h-4 mr-2 text-teal-400" /> Istighosah (Rutin Bulanan)</li>
                            </ul>
                        </div>

                        {/* Card Ramadhan & Hari Besar */}
                        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:-translate-y-1 hover:shadow-lg transition relative overflow-hidden">
                            <div className="w-14 h-14 bg-orange-100 text-orange-600 rounded-xl flex items-center justify-center mb-6">
                                <Moon className="w-7 h-7" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-800 mb-3">Ramadhan & Hari Besar</h3>
                            <p className="text-gray-600 leading-relaxed mb-4">
                                Pengelolaan momen hari besar Islam secara terorganisir, transparan, dan penuh keberkahan.
                            </p>
                            <ul className="text-sm text-gray-500 space-y-2">
                                <li className="flex items-start">
                                    <Sparkles className="w-4 h-4 mr-2 mt-0.5 text-orange-400 flex-shrink-0" /> 
                                    <div>
                                        I'tikaf Sepuluh Malam Terakhir
                                        <span className="block mt-1 bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-0.5 rounded animate-pulse w-fit">
                                            Disediakan Makan Sahur Gratis!
                                        </span>
                                    </div>
                                </li>
                                <li className="flex items-center mt-3"><Sparkles className="w-4 h-4 mr-2 text-orange-400" /> Manajemen Penyaluran Qurban</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            {/* 7. GALERI & DOKUMENTASI */}
            <div id="galeri" className="bg-white py-20 border-t border-gray-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between mb-10">
                        <div>
                            <h2 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
                                <Camera className="text-primary" /> Galeri Kegiatan
                            </h2>
                            <p className="text-gray-500 mt-2">Potret kebersamaan jamaah Masjid Jami' Puloniti.</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="relative group overflow-hidden rounded-xl aspect-square">
                            <img src="https://images.unsplash.com/photo-1604868187858-8686d1494eb7?auto=format&fit=crop&w=500&q=80" alt="Pengajian" className="w-full h-full object-cover group-hover:scale-110 transition duration-500" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-end p-4"><span className="text-white font-bold text-sm">Kajian Jamaah</span></div>
                        </div>
                        <div className="relative group overflow-hidden rounded-xl aspect-square md:col-span-2">
                            <img src="https://images.unsplash.com/photo-1590076214871-3312a0237da0?auto=format&fit=crop&w=800&q=80" alt="TPQ Anak" className="w-full h-full object-cover group-hover:scale-110 transition duration-500" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-end p-4"><span className="text-white font-bold text-sm">Kegiatan Belajar TPQ</span></div>
                        </div>
                        <div className="relative group overflow-hidden rounded-xl aspect-square">
                            <img src="https://images.unsplash.com/photo-1584553421528-7690327f29f0?auto=format&fit=crop&w=500&q=80" alt="Ibadah" className="w-full h-full object-cover group-hover:scale-110 transition duration-500" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-end p-4"><span className="text-white font-bold text-sm">Ibadah Shalat</span></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* 8. PROGRAM WAKAF & DONASI */}
            <div id="donasi" className="bg-gray-50 py-20 border-t border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-gray-800 flex items-center justify-center gap-2">
                            <Target className="text-red-500" /> Target Pengadaan & Wakaf
                        </h2>
                        <p className="text-gray-500 mt-2">Salurkan infaq dan sedekah Anda untuk mendukung fasilitas masjid.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {data.campaigns.length === 0 ? (
                            <div className="col-span-full text-center text-gray-500 py-10 bg-white rounded-xl border border-gray-100">Belum ada program donasi aktif saat ini.</div>
                        ) : (
                            data.campaigns.map(cam => {
                                const persen = Math.min((cam.terkumpul_nominal / cam.target_nominal) * 100, 100).toFixed(1);
                                return (
                                    <div key={cam.id} className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-shadow border border-gray-100 overflow-hidden group">
                                        <div className="p-6">
                                            <h3 className="text-xl font-bold text-gray-800 mb-2 line-clamp-2">{cam.judul}</h3>
                                            <p className="text-gray-500 text-sm mb-6 line-clamp-3 leading-relaxed">{cam.deskripsi}</p>
                                            
                                            <div className="mb-2 flex justify-between text-sm font-bold">
                                                <span className="text-primary">{formatRupiah(cam.terkumpul_nominal)}</span>
                                                <span className="text-gray-400">/ {formatRupiah(cam.target_nominal)}</span>
                                            </div>
                                            <div className="w-full bg-gray-100 rounded-full h-2.5 mb-2 overflow-hidden">
                                                <div className="bg-primary h-2.5 rounded-full" style={{ width: `${persen}%` }}></div>
                                            </div>
                                            <p className="text-xs text-gray-500 text-right mb-6">{persen}% Terkumpul</p>
                                            
                                            <div className="bg-gray-50 p-4 rounded-xl border border-dashed border-gray-300 text-center">
                                                <p className="text-xs text-gray-500 mb-1">Transfer Rekening BSI</p>
                                                <p className="font-bold text-gray-800 tracking-wider text-lg">7123 4567 890</p>
                                                <p className="text-xs text-gray-500 mt-1">a.n Masjid Jami' Puloniti</p>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            </div>

            {/* 9. BERITA TERKINI */}
            <div className="bg-white py-20 border-t border-gray-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-gray-800">Berita Terkini</h2>
                        <p className="text-gray-500 mt-2">Update informasi dan laporan kegiatan dari Jurnalis Masjid.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {data.berita.length === 0 ? (
                            <div className="col-span-full text-center text-gray-500">Belum ada berita dipublikasikan.</div>
                        ) : (
                            data.berita.map(b => (
                                <div key={b.id} className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-lg transition group cursor-pointer flex flex-col">
                                    <div className="h-48 bg-gray-200 overflow-hidden relative">
                                        {b.thumbnail ? (
                                            <img src={`http://localhost:8000/storage/${b.thumbnail}`} alt={b.judul} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-gray-100"><Calendar className="w-10 h-10 text-gray-300" /></div>
                                        )}
                                    </div>
                                    <div className="p-6 flex-1 flex flex-col">
                                        <p className="text-xs text-primary font-bold mb-2">{formatTanggal(b.created_at)}</p>
                                        <h3 className="text-lg font-bold text-gray-800 mb-3 line-clamp-2 group-hover:text-primary transition">{b.judul}</h3>
                                        <p className="text-gray-500 text-sm line-clamp-3 mb-4">{b.konten}</p>
                                        <div className="mt-auto pt-4 border-t border-gray-50 text-xs text-gray-400">
                                            Penulis: {b.penulis?.name || 'Admin'}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* 10. FOOTER */}
            <footer className="bg-gray-900 text-gray-300 py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center font-bold">M</div>
                            <span className="font-bold text-xl text-white">SIMAS Puloniti</span>
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
                    &copy; {new Date().getFullYear()} Masjid An-Nur Puloniti. Dirancang menggunakan React & Laravel.
                </div>
            </footer>
        </div>
    );
}