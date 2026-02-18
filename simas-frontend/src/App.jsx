// src/App.jsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import AdminLayout from './components/AdminLayout';
import Dashboard from './pages/Dashboard';
// Tambahkan import ini di bagian atas file
import Keuangan from './pages/Keuangan';
import Berita from './pages/Berita';
import Zakat from './pages/Zakat';
import Inventaris from './pages/Inventaris';
import PengaturanKeuangan from './pages/PengaturanKeuangan';
import ManajemenPengguna from './pages/ManajemenPengguna';
import LandingPage from './pages/LandingPage';
import Agenda from './pages/Agenda';



function App() {
  return (
    <Router>
      <Routes>
        {/* Rute Publik */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />

        {/* Rute Terproteksi (Admin Layout) */}
        <Route element={<AdminLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/pengguna" element={<ManajemenPengguna />} />
          <Route path="/keuangan" element={<Keuangan />} />
          <Route path="/Agenda" element={<Agenda />} />
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