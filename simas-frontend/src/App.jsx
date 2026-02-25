// src/App.jsx
import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// 1. OPTIMASI CODE SPLITTING: Semua Halaman Dibuat Lazy
// Komponen Layout tetap di-import biasa karena digunakan langsung di App.jsx
import AdminLayout from './components/AdminLayout';
import Profile from './pages/Profile';
import PengumumanPage from './pages/PengumumanPage';
import ManajemenPengumuman from './pages/ManajemenPengumuman';
import PengumumanDetail from './pages/PengumumanDetail';
import DatabaseBackup from './pages/DatabaseBackup';

// Halaman Publik (Di-lazy load)
const ManajemenGaleri = React.lazy(() => import('./pages/ManajemenGaleri'));
const LandingPage = React.lazy(() => import('./pages/LandingPage'));
const AllAgenda = React.lazy(() => import('./pages/AllAgenda'));
const AllNews = React.lazy(() => import('./pages/AllNews'));
const NewsDetail = React.lazy(() => import('./pages/NewsDetail'));
const Login = React.lazy(() => import('./pages/Login'));
const Perpustakaan = React.lazy(() => import('./pages/Perpustakaan'));

// Halaman Admin (Di-lazy load)
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const ManajemenPengguna = React.lazy(() => import('./pages/ManajemenPengguna'));
const Keuangan = React.lazy(() => import('./pages/Keuangan'));
const Agenda = React.lazy(() => import('./pages/Agenda'));
const Zakat = React.lazy(() => import('./pages/Zakat'));
const Muzakki = React.lazy(() => import('./pages/Muzakki'));
const Berita = React.lazy(() => import('./pages/Berita'));
const Inventaris = React.lazy(() => import('./pages/Inventaris'));
const ManajemenBuku = React.lazy(() => import('./pages/ManajemenBuku'));
const VerifikasiDonasi = React.lazy(() => import('./pages/VerifikasiDonasi'));
const PengaturanKeuangan = React.lazy(() => import('./pages/PengaturanKeuangan'));

// Komponen Fallback untuk Loading
const SuspenseFallback = () => (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
    </div>
);

function App() {
  return (
    <Router>
      <Suspense fallback={<SuspenseFallback />}>
        <Routes>
          {/* =========================
              PUBLIC ROUTES
          ========================== */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/pengumuman" element={<PengumumanPage />} />
          <Route path="/pengumuman/:slug" element={<PengumumanDetail />} />
          <Route path="/agenda-lengkap" element={<AllAgenda />} />
          <Route path="/berita-lengkap" element={<AllNews />} />
          <Route path="/berita/:id" element={<NewsDetail />} />
          <Route path="/login" element={<Login />} />
          
          {/* OPTIMASI: Rute Perpustakaan */}
          <Route path="/perpustakaan" element={<Perpustakaan />} />
          
          {/* =========================
              ADMIN / PROTECTED ROUTES
          ========================== */}
          <Route element={<AdminLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/pengguna" element={<ManajemenPengguna />} />
            <Route path="/keuangan" element={<Keuangan />} />
            <Route path="/agenda" element={<Agenda />} />
            <Route path="/muzakki" element={<Muzakki />} /> 
            <Route path="/zakat" element={<Zakat />} />        
            <Route path="/berita" element={<Berita />} />
            <Route path="/inventaris" element={<Inventaris />} />
            <Route path="/manajemen-galeri" element={<ManajemenGaleri />} />

            {/* OPTIMASI: Rute E-Library / Manajemen Buku Admin */}
            <Route path="/manajemen-buku" element={<ManajemenBuku />} />
            <Route path="/manajemen-pengumuman" element={<ManajemenPengumuman />} />
            <Route path="/verifikasi-donasi" element={<VerifikasiDonasi />} />
            <Route path="/backup-database" element={<DatabaseBackup />} />
            <Route path="/pengaturan-keuangan" element={<PengaturanKeuangan />} />
          </Route>
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;