// src/App.jsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Public Pages
import LandingPage from './pages/LandingPage';
import AllAgenda from './pages/AllAgenda';
import AllNews from './pages/AllNews';
import NewsDetail from './pages/NewsDetail';
import Login from './pages/Login';

// Admin Layout & Protected Pages
import AdminLayout from './components/AdminLayout';
import Dashboard from './pages/Dashboard';
import ManajemenPengguna from './pages/ManajemenPengguna';
import Keuangan from './pages/Keuangan';
import Agenda from './pages/Agenda';
import Zakat from './pages/Zakat';
import Berita from './pages/Berita';
import Inventaris from './pages/Inventaris';
import PengaturanKeuangan from './pages/PengaturanKeuangan';

function App() {
  return (
    <Router>
      <Routes>
        {/* =========================
            PUBLIC ROUTES
        ========================== */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/agenda-lengkap" element={<AllAgenda />} />
        <Route path="/berita-lengkap" element={<AllNews />} />
        <Route path="/berita/:id" element={<NewsDetail />} />
        <Route path="/login" element={<Login />} />

        {/* =========================
            ADMIN / PROTECTED ROUTES
        ========================== */}
        <Route element={<AdminLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/pengguna" element={<ManajemenPengguna />} />
          <Route path="/keuangan" element={<Keuangan />} />
          <Route path="/agenda" element={<Agenda />} />
          <Route path="/zakat" element={<Zakat />} />
          <Route path="/berita" element={<Berita />} />
          <Route path="/inventaris" element={<Inventaris />} />
          <Route path="/pengaturan-keuangan" element={<PengaturanKeuangan />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
