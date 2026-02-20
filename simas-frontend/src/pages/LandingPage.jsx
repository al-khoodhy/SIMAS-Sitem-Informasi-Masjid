import React, { useState, useEffect, Suspense } from 'react';
import api from '../api/axios';

// 1. EAGER LOADING (Dimuat langsung karena berada di tampilan awal)
import Navbar from '../components/landing/Navbar';
import HeroSection from '../components/landing/HeroSection';
import AgendaSection from '../components/landing/AgendaSection';

// 2. LAZY LOADING / CODE SPLITTING (Dipecah menjadi file chunk terpisah oleh bundler)
const TransparansiSection = React.lazy(() => import('../components/landing/TransparansiSection'));
const DonasiSection = React.lazy(() => import('../components/landing/DonasiSection'));
const TentangSection = React.lazy(() => import('../components/landing/TentangSection'));
const ProgramSection = React.lazy(() => import('../components/landing/ProgramSection'));
const GaleriSection = React.lazy(() => import('../components/landing/GaleriSection'));
const BeritaSection = React.lazy(() => import('../components/landing/BeritaSection'));
const Footer = React.lazy(() => import('../components/landing/Footer'));

export default function LandingPage() {
    const [data, setData] = useState({ 
        keuangan: { total_pemasukan: 0, total_pengeluaran: 0, saldo_akhir: 0 }, 
        campaigns: [], 
        berita: [], 
        agenda: [] 
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => { 
        fetchPublicData(); 
    }, []);

    const fetchPublicData = async () => {
        try { 
            const response = await api.get('/public/landing'); 
            setData(response.data.data); 
        } 
        catch (error) { console.error("Gagal mengambil data", error); } 
        finally { setLoading(false); }
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 font-sans scroll-smooth">
            {/* OPTIMASI: NATIVE REACT 19 METADATA (Tanpa React Helmet) */}
            <title>Portal Resmi Masjid An-Nur Puloniti</title>
            <meta name="description" content="Portal resmi Masjid An-Nur Puloniti. Menampilkan jadwal kajian, transparansi keuangan, donasi, dan program kegiatan jamaah." />
            <meta name="keywords" content="Masjid An-Nur, Masjid Puloniti, Jadwal Kajian Mojokerto, Transparansi Kas Masjid, Donasi Masjid" />
            <meta property="og:title" content="Portal Resmi Masjid An-Nur Puloniti" />
            <meta property="og:description" content="Mari memakmurkan masjid dengan transparansi dan program yang bermanfaat bagi umat." />
            <meta property="og:type" content="website" />

            <Navbar />
            
            <main>
                <HeroSection />
                <AgendaSection agendaData={data.agenda} />

                {/* OPTIMASI: Suspense akan merender fallback (bisa berupa skeleton loading) 
                    sementara browser mengunduh script komponen di bawah secara asinkron */}
                <Suspense fallback={<div className="py-20 text-center text-gray-400">Memuat bagian ini...</div>}>
                    <TransparansiSection keuanganData={data.keuangan} />
                    <DonasiSection campaignsData={data.campaigns} />
                    <TentangSection />
                    <ProgramSection />
                    <GaleriSection />
                    <BeritaSection beritaData={data.berita} />
                </Suspense>
            </main>

            <Suspense fallback={null}>
                <Footer />
            </Suspense>
        </div>
    );
}