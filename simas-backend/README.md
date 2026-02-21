# 🕌 SIMAS (Sistem Informasi Manajemen Masjid) - Backend

Repositori ini berisi kode sumber backend (API) untuk **SIMAS An-Nur Puloniti**, sebuah aplikasi web berbasis Laravel 11 untuk manajemen masjid, meliputi pencatatan kas, penyaluran zakat, program *crowdfunding* (donasi), hingga publikasi kegiatan (agenda & berita).

---

## 🚀 Persyaratan Sistem

Sebelum menjalankan aplikasi ini, pastikan sistem Anda telah memenuhi persyaratan berikut:

- **PHP** >= 8.2  
- **Composer** (Package Manager untuk PHP)  
- **MySQL** atau **MariaDB**  
- Ekstensi PHP:
  - OpenSSL
  - PDO
  - Mbstring
  - Tokenizer
  - XML
  - Ctype
  - JSON

---

## 🛠️ Panduan Instalasi (Lokal)

Ikuti langkah-langkah berikut untuk menjalankan backend SIMAS di komputer lokal Anda.

### 1. Kloning Repositori

```bash
git clone <url-repositori-anda>
cd simas-backend
```

### 2. Install Dependensi PHP

```bash
composer install
```

### 3. Konfigurasi Environment

Salin file `.env.example` menjadi `.env`:

```bash
cp .env.example .env
```

Kemudian buka file `.env` dan sesuaikan konfigurasi database:

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=simas_db
DB_USERNAME=root
DB_PASSWORD=
```

> Pastikan database `simas_db` sudah dibuat terlebih dahulu di MySQL.

---

### 4. Generate Application Key

```bash
php artisan key:generate
```

---

### 5. Jalankan Migrasi dan Seeder

Perintah berikut akan membuat seluruh tabel database sekaligus mengisi data awal:

```bash
php artisan migrate --seed
```

---

### 6. Buat Storage Link

Digunakan agar file upload (gambar donasi, berita, kegiatan) dapat diakses publik.

```bash
php artisan storage:link
```

---

### 7. Jalankan Server Lokal

```bash
php artisan serve
```

Backend API akan berjalan di:

```
http://127.0.0.1:8000
```

---

## 🗄️ Struktur Database Utama

Berikut tabel utama dalam sistem:

- **users**  
  Menyimpan akun pengurus masjid (Role: `developer`, `panitia`, `remaja`)

- **transaksi_keuangans**  
  Mencatat arus kas (pemasukan dan pengeluaran)

- **agendas**  
  Jadwal kegiatan masjid (kajian, rapat, dll)

- **beritas**  
  Artikel atau berita dengan relasi ke `users` sebagai penulis dan sistem approval

- **mustahiks**  
  Data warga penerima zakat

- **penyaluran_zakats**  
  Riwayat distribusi zakat beserta dokumentasi

- **campaign_donasis**  
  Program penggalangan dana atau wakaf

- **donasis**  
  Donasi jamaah yang masuk melalui landing page dan menunggu verifikasi

---

## 📡 Dokumentasi API

Backend berjalan sebagai RESTful API dengan format respons JSON.

---

## 🌐 Public Routes (Tanpa Token)

Digunakan oleh pengunjung umum (Landing Page).

| Method | Endpoint | Deskripsi |
|--------|----------|------------|
| GET | /api/public/landing | Data ringkasan beranda |
| GET | /api/public/berita-semua | Semua berita yang dipublikasi |
| GET | /api/public/berita/{id} | Detail berita + tambah view count |
| GET | /api/public/agenda | Jadwal kegiatan (filter `month`, `year`) |
| POST | /api/public/donasi | Kirim bukti transfer donasi |
| POST | /api/login | Login pengurus (menghasilkan Bearer Token) |

---

## 🔐 Protected Routes (Memerlukan Bearer Token)

Tambahkan header berikut pada setiap request:

```
Authorization: Bearer <token_anda>
```

---

### 👥 Rute Umum (Semua Role Login)

| Method | Endpoint | Deskripsi |
|--------|----------|------------|
| POST | /api/logout | Logout & revoke token |
| GET | /api/me | Data profil user aktif |
| PUT | /api/profile | Update nama/password |
| GET | /api/dashboard-stats | Statistik dashboard |

---

### 🧑‍🎓 Modul Berita & Inventaris  
(Akses: Remaja, Panitia, Developer)

| Method | Endpoint | Deskripsi |
|--------|----------|------------|
| GET | /api/berita | List berita |
| POST | /api/berita | Buat draft berita |
| PUT | /api/berita/{id} | Update berita |
| DELETE | /api/berita/{id} | Hapus berita |
| GET | /api/inventaris | Data inventaris |
| POST | /api/penyaluran-zakat/{id}/konfirmasi | Upload bukti distribusi zakat |

---

### 👳‍♂️ Modul Manajemen Inti  
(Akses: Panitia & Developer)

#### 💰 Keuangan & Donasi

| Method | Endpoint | Deskripsi |
|--------|----------|------------|
| GET | /api/keuangan | Buku kas (pagination, search, tipe) |
| POST | /api/keuangan | Tambah transaksi |
| GET | /api/donasi | List donasi masuk |
| POST | /api/donasi/{id}/approve | Approve & otomatis masuk buku kas |
| POST | /api/donasi/{id}/reject | Tolak donasi |

#### 🕌 Zakat & Mustahik

| Method | Endpoint | Deskripsi |
|--------|----------|------------|
| GET | /api/mustahik | List penerima zakat |
| POST | /api/mustahik/mass-destroy | Hapus banyak data |
| POST | /api/penyaluran-zakat/mass-update | Update massal |
| GET | /api/zakat/export-pdf | Export laporan PDF |

#### 🗓️ Agenda & Approval Berita

| Method | Endpoint | Deskripsi |
|--------|----------|------------|
| POST | /api/agenda/mass-destroy | Hapus agenda massal |
| POST | /api/berita/{id}/approve | Approve berita |
| POST | /api/berita/{id}/reject | Reject berita |

---

### 👑 Modul Super Admin (Developer)

| Method | Endpoint | Deskripsi |
|--------|----------|------------|
| GET | /api/users | CRUD akun pengurus |

---

## 🛡️ Keamanan & Hak Akses

Sistem menggunakan **Laravel Sanctum** untuk otentikasi berbasis token dan menerapkan Role-Based Access Control (RBAC) melalui middleware.

### 1️⃣ Developer (Super Admin)
- Akses penuh sistem
- CRUD akun pengurus
- Penghapusan data massal

### 2️⃣ Panitia (Manajer)
- Kelola keuangan & zakat
- Validasi donasi
- Approval berita
- Kelola mustahik

### 3️⃣ Remaja (Relawan)
- Menulis & edit draft berita
- Upload bukti distribusi zakat
- Akses terbatas tanpa hak manajemen inti

---

## 📌 Catatan Tambahan

- Backend ini dirancang sebagai API murni (tanpa blade template).
- Direkomendasikan menggunakan Postman atau Insomnia untuk pengujian endpoint.
- Gunakan HTTPS di lingkungan produksi.
- Selalu backup database secara berkala.

---

**SIMAS — Transparansi, Akuntabilitas, dan Profesionalitas Manajemen Masjid.**