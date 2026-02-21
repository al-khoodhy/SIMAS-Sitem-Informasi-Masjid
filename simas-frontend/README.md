# 🕌 SIMAS (Sistem Informasi Manajemen Masjid) - Frontend

![React](https://img.shields.io/badge/React-18.x-61DAFB?style=for-the-badge&logo=react&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-5.x-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.x-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Axios](https://img.shields.io/badge/Axios-1.x-5A29E4?style=for-the-badge&logo=axios&logoColor=white)

Repositori ini berisi kode sumber untuk bagian **Frontend** dari aplikasi SIMAS (Sistem Informasi Manajemen Masjid). Aplikasi ini dibangun menggunakan **React** dengan build tool **Vite**, serta styling menggunakan **Tailwind CSS**.

SIMAS dirancang untuk memudahkan tata kelola masjid secara digital, meliputi manajemen keuangan transparan, penyaluran zakat massal, penjadwalan agenda, crowdfunding (donasi), hingga publikasi kegiatan masjid.

---

## ✨ Fitur Utama

### 🌍 Portal Publik (Landing Page)

- **Company Profile** — Visi, misi, dan profil masjid
- **Transparansi Keuangan Real-time** — Total saldo, pemasukan, dan pengeluaran langsung dari buku kas
- **Crowdfunding & Donasi** — Katalog target pengadaan masjid + form konfirmasi transfer
- **Jadwal Kegiatan (Agenda)** — Countdown timer untuk agenda terdekat
- **Portal Berita & Galeri** — Artikel dengan View Count dan layout dokumentasi foto Bento Grid

---

### 🔐 Dasbor Pengurus (Private Admin Area)

- **Role-Based Access Control (RBAC)** untuk `Developer`, `Panitia`, dan `Remaja`
- **Manajemen Keuangan Terpusat** dengan debounced search dan server-side pagination
- **Manajemen Penyaluran Zakat** dengan upload foto terkompresi
- **Validasi Donasi Warga** (Auto-posting ke pembukuan saat disetujui)
- **Workflow Redaksi Berita**: Draft → Review → Publish
- **Statistik Analitik** menggunakan Recharts (Bar Chart & Area Chart)

---

## 🛠️ Teknologi & Library

- **Framework**: React 18  
- **Build Tool**: Vite  
- **Styling**: Tailwind CSS  
- **Routing**: react-router-dom  
- **HTTP Client**: axios  
- **Ikonografi**: lucide-react  
- **Grafik**: recharts  
- **Kompresi Gambar**: browser-image-compression  

---

## 🚀 Panduan Memulai (Getting Started)

Ikuti langkah-langkah berikut untuk menjalankan frontend SIMAS di komputer lokal Anda.

---

### Prasyarat

Pastikan telah menginstal:

- Node.js (disarankan v18+)
- npm
- Backend SIMAS (Laravel) yang sudah berjalan

---

### 1. Kloning Repositori

```bash
git clone https://github.com/username/simas-frontend.git
cd simas-frontend
```

---

### 2. Instalasi Dependensi

```bash
npm install
```

---

### 3. Konfigurasi Environment

Salin file `.env.example` menjadi `.env`:

```bash
cp .env.example .env
```

Edit file `.env` dan sesuaikan URL backend:

```env
VITE_API_BASE_URL=http://localhost:8000/api
```

---

### 4. Jalankan Mode Development

```bash
npm run dev
```

Akses melalui browser:

```
http://localhost:5173
```

---

## 📁 Struktur Folder

```text
simas-frontend/
├── public/
│   └── (aset statis: favicon, logo, dll)
├── src/
│   ├── api/
│   │   └── axios.js
│   ├── components/
│   ├── pages/
│   │   ├── LandingPage.jsx
│   │   ├── Dashboard.jsx
│   │   ├── Keuangan.jsx
│   │   ├── Zakat.jsx
│   │   ├── Berita.jsx
│   │   ├── Agenda.jsx
│   │   └── VerifikasiDonasi.jsx
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── .env.example
├── package.json
├── tailwind.config.js
└── vite.config.js
```

---

## 🔐 Akun Uji Coba (Dummy Roles)

> Pastikan Seeder telah dijalankan pada backend Laravel.

| Role | Email | Password | Hak Akses |
|------|--------|----------|-----------|
| Developer | dev@simas.com | password | Akses penuh semua modul |
| Panitia | panitia@simas.com | password | Keuangan, zakat, agenda, approval berita |
| Remaja | remaja@simas.com | password | Draft berita & verifikasi zakat |

---

## 💡 Standar Pemrograman (Best Practices)

### Server-Side Pagination
Semua tabel besar (Keuangan, Zakat, Agenda) menggunakan pagination sisi server untuk mencegah overload memori browser.

### Debounced Search
Input pencarian menunggu jeda 500ms sebelum memanggil API untuk efisiensi bandwidth.

### Atomic Image Compression
Upload bukti donasi dikompresi otomatis (maks. 500KB) sebelum dikirim ke server.

### Graceful Degradation
Penggunaan Optional Chaining (`?.`) untuk mencegah crash ketika respons API tidak sesuai struktur.

---

## 📜 Lisensi

Aplikasi SIMAS didistribusikan di bawah lisensi MIT License.  
Anda bebas menggunakan, memodifikasi, dan mendistribusikan perangkat lunak ini.