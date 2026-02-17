<!DOCTYPE html>
<html lang="id" class="scroll-smooth">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Masjid An-Nur Puloniti - Transparan & Amanah</title>
    
    <script src="https://cdn.tailwindcss.com"></script>
    
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">

    <script>
        tailwind.config = {
            theme: {
                extend: {
                    colors: {
                        primary: '#059669', // Emerald 600
                        secondary: '#065f46', // Emerald 800
                        accent: '#fbbf24', // Amber 400
                    }
                }
            }
        }
    </script>
    <style>
        /* Animasi Running Text */
        .marquee-container { overflow: hidden; white-space: nowrap; }
        .marquee-content { display: inline-block; animation: marquee 20s linear infinite; }
        @keyframes marquee { 0% { transform: translateX(100%); } 100% { transform: translateX(-100%); } }
    </style>
</head>
<body class="bg-gray-50 text-gray-800 font-sans">

    <div class="bg-secondary text-white text-sm py-2 px-4 marquee-container">
        <div class="marquee-content font-medium">
            <i class="fas fa-info-circle mr-2"></i> UPDATE ZAKAT: Total Penyaluran Zakat ke RT 10: Rp 5.000.000 | RT 11: Rp 4.500.000 | RT 12: Rp 6.200.000 (Desa Puloniti). Terima kasih para Muzakki.
        </div>
    </div>

    <nav class="bg-white shadow-md sticky top-0 z-50">
        <div class="container mx-auto px-4 py-3 flex justify-between items-center">
            <a href="#" class="text-2xl font-bold text-primary flex items-center">
                <i class="fas fa-mosque mr-2"></i> Masjid Puloniti
            </a>
            <button id="mobile-menu-btn" class="md:hidden text-gray-600 focus:outline-none">
                <i class="fas fa-bars text-2xl"></i>
            </button>
            <div class="hidden md:flex space-x-6 font-medium">
                <a href="#home" class="hover:text-primary transition">Beranda</a>
                <a href="#profil" class="hover:text-primary transition">Profil</a>
                <a href="#program" class="hover:text-primary transition">Program</a>
                <a href="#transparansi" class="hover:text-primary transition">Transparansi</a>
                <a href="#donasi" class="px-4 py-2 bg-primary text-white rounded-full hover:bg-secondary transition shadow-lg pulse-anim">Infaq Sekarang</a>
            </div>
        </div>
        <div id="mobile-menu" class="hidden md:hidden bg-white border-t p-4">
            <a href="#home" class="block py-2 hover:text-primary">Beranda</a>
            <a href="#profil" class="block py-2 hover:text-primary">Profil</a>
            <a href="#program" class="block py-2 hover:text-primary">Program</a>
            <a href="#transparansi" class="block py-2 hover:text-primary">Transparansi</a>
            <a href="#donasi" class="block py-2 mt-2 text-center bg-primary text-white rounded hover:bg-secondary">Infaq Sekarang</a>
        </div>
    </nav>

    <section id="home" class="relative bg-gray-900 text-white py-24">
        <div class="absolute inset-0 overflow-hidden">
            <img src="https://images.unsplash.com/photo-1564123223035-7c2715694262?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80" alt="Masjid Background" class="w-full h-full object-cover opacity-30">
        </div>
        <div class="container mx-auto px-4 relative z-10 text-center">
            <h1 class="text-4xl md:text-6xl font-bold mb-4">Pusat Ibadah & Kemaslahatan Umat</h1>
            <p class="text-xl md:text-2xl mb-8 max-w-2xl mx-auto">Membangun peradaban dari Desa Puloniti. Transparan, Amanah, dan Melayani.</p>
            <div class="flex flex-col md:flex-row justify-center gap-4">
                <a href="#donasi" class="px-8 py-3 bg-accent text-gray-900 font-bold rounded-lg hover:bg-yellow-300 transition shadow-lg">
                    <i class="fas fa-hand-holding-heart mr-2"></i> Infaq Sekarang
                </a>
                <a href="#transparansi" class="px-8 py-3 bg-white/10 backdrop-blur border border-white text-white font-bold rounded-lg hover:bg-white/20 transition">
                    Lihat Laporan Keuangan
                </a>
            </div>
        </div>
    </section>

    <section class="py-10 -mt-10 relative z-20">
        <div class="container mx-auto px-4">
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div class="bg-white rounded-xl shadow-xl p-6 border-l-4 border-primary">
                    <h3 class="text-gray-500 font-semibold mb-1">Saldo Kas Masjid (Real-time)</h3>
                    <p class="text-3xl font-bold text-gray-800">Rp 45.250.000</p>
                    <div class="text-sm text-green-600 mt-2"><i class="fas fa-arrow-up"></i> +Rp 1.2jt minggu ini</div>
                </div>
                <div class="bg-white rounded-xl shadow-xl p-6 border-l-4 border-accent">
                    <h3 class="text-gray-500 font-semibold mb-1">Kajian Rutin Selasa</h3>
                    <div id="countdown" class="text-2xl font-bold text-gray-800 flex space-x-2">
                        Loading...
                    </div>
                    <p class="text-sm text-gray-500 mt-2">Tema: "Keutamaan Shadaqah"</p>
                </div>
                <div class="bg-white rounded-xl shadow-xl p-6 border-l-4 border-blue-500">
                    <h3 class="text-gray-500 font-semibold mb-1">Fokus Penyaluran Zakat</h3>
                    <p class="font-bold text-gray-800">RT 10, 11, & 12 Puloniti</p>
                    <div class="flex items-center mt-2">
                        <span class="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">85 Mustahik Terdata</span>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <section class="py-12 bg-gray-50">
        <div class="container mx-auto px-4">
            <div class="max-w-3xl mx-auto bg-white rounded-2xl shadow-lg p-8">
                <div class="flex items-center mb-4">
                    <div class="bg-red-100 p-3 rounded-full text-red-600 mr-4">
                        <i class="fas fa-camera text-2xl"></i>
                    </div>
                    <div>
                        <h2 class="text-2xl font-bold text-gray-800">Wakaf Pengadaan Alat Multimedia</h2>
                        <p class="text-gray-600">Untuk HP Recording & Editing Kajian agar bisa diakses online.</p>
                    </div>
                </div>
                
                <div class="mb-2 flex justify-between font-bold text-sm">
                    <span class="text-primary">Terkumpul: Rp 1.500.000</span>
                    <span class="text-gray-500">Target: Rp 4.000.000</span>
                </div>
                <div class="w-full bg-gray-200 rounded-full h-4 mb-6">
                    <div class="bg-primary h-4 rounded-full transition-all duration-1000" style="width: 37.5%"></div>
                </div>
                
                <a href="#donasi" class="block text-center bg-gray-900 text-white py-2 rounded-lg hover:bg-gray-800">
                    Bantu Wujudkan <i class="fas fa-arrow-right ml-2"></i>
                </a>
            </div>
        </div>
    </section>

    <section id="profil" class="py-16 bg-white">
        <div class="container mx-auto px-4">
            <div class="text-center mb-12">
                <h2 class="text-3xl font-bold text-primary mb-2">Tentang Kami</h2>
                <div class="h-1 w-20 bg-accent mx-auto"></div>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                <div>
                    <img src="https://images.unsplash.com/photo-1542308801-72f534123533?auto=format&fit=crop&q=80&w=800" alt="Kegiatan Masjid" class="rounded-lg shadow-lg">
                </div>
                <div>
                    <h3 class="text-2xl font-bold mb-4">Visi & Misi</h3>
                    <p class="text-gray-600 mb-6 leading-relaxed">
                        Menjadi pusat peradaban yang berfokus pada kemaslahatan warga Puloniti. Kami berkomitmen untuk tidak hanya menjadi tempat ibadah, namun juga solusi sosial bagi warga sekitar.
                    </p>
                    
                    <h3 class="text-xl font-bold mb-3">Struktur Pengelola</h3>
                    <ul class="space-y-2 text-gray-700">
                        <li><i class="fas fa-user-tie text-primary w-6"></i> <strong>Ketua Takmir:</strong> H. Ahmad S.</li>
                        <li><i class="fas fa-user-edit text-primary w-6"></i> <strong>Sekretaris:</strong> Bpk. Budi</li>
                        <li><i class="fas fa-broom text-primary w-6"></i> <strong>Marbot:</strong> Mas Joko (Pahlawan Kebersihan Kami)</li>
                    </ul>
                </div>
            </div>
        </div>
    </section>

    <section id="program" class="py-16 bg-gray-50">
        <div class="container mx-auto px-4">
            <div class="text-center mb-12">
                <h2 class="text-3xl font-bold text-primary mb-2">Program Unggulan</h2>
                <p class="text-gray-600">Ikuti kegiatan rutin untuk menyuburkan iman.</p>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div class="bg-white rounded-xl shadow hover:shadow-xl transition overflow-hidden">
                    <div class="h-48 bg-blue-600 flex items-center justify-center text-white">
                        <i class="fas fa-book-quran text-6xl"></i>
                    </div>
                    <div class="p-6">
                        <h3 class="text-xl font-bold mb-2">Pendidikan (TPQ)</h3>
                        <p class="text-gray-600 text-sm mb-4">Membina generasi Qur'ani setiap hari Rabu & Jumat sore.</p>
                        <span class="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">Pendidikan</span>
                    </div>
                </div>
                <div class="bg-white rounded-xl shadow hover:shadow-xl transition overflow-hidden">
                    <div class="h-48 bg-primary flex items-center justify-center text-white">
                        <i class="fas fa-users text-6xl"></i>
                    </div>
                    <div class="p-6">
                        <h3 class="text-xl font-bold mb-2">Majelis Ilmu</h3>
                        <p class="text-gray-600 text-sm mb-4">Kajian Selasa, Yasinan Kamis, & Istighosah Bulanan.</p>
                        <span class="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Rutin</span>
                    </div>
                </div>
                <div class="bg-white rounded-xl shadow hover:shadow-xl transition overflow-hidden">
                    <div class="h-48 bg-accent flex items-center justify-center text-white">
                        <i class="fas fa-utensils text-6xl"></i>
                    </div>
                    <div class="p-6">
                        <h3 class="text-xl font-bold mb-2">Jumat Berkah & I'tikaf</h3>
                        <p class="text-gray-600 text-sm mb-4">Program makan gratis saat I'tikaf & sedekah Jumat.</p>
                        <span class="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">Sosial</span>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <section id="transparansi" class="py-16 bg-white">
        <div class="container mx-auto px-4">
            <div class="text-center mb-12">
                <h2 class="text-3xl font-bold text-primary mb-2">Transparansi Keuangan</h2>
                <p class="text-gray-600">Setiap Rupiah dipertanggungjawabkan dunia & akhirat.</p>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-2 gap-12">
                <div class="bg-white p-4 rounded-xl shadow-lg border">
                    <h3 class="text-lg font-bold mb-4 text-center">Statistik Pemasukan vs Pengeluaran (2025)</h3>
                    <canvas id="financeChart"></canvas>
                </div>

                <div class="space-y-8">
                    <div class="bg-white rounded-xl shadow-lg overflow-hidden border">
                        <div class="bg-gray-100 px-6 py-3 border-b flex justify-between items-center">
                            <h3 class="font-bold text-gray-700">Mutasi Terakhir</h3>
                            <button class="text-xs bg-primary text-white px-3 py-1 rounded hover:bg-secondary"><i class="fas fa-file-pdf"></i> Audit PDF</button>
                        </div>
                        <table class="w-full text-sm text-left">
                            <thead class="bg-gray-50 text-gray-600">
                                <tr>
                                    <th class="px-6 py-3">Tanggal</th>
                                    <th class="px-6 py-3">Keterangan</th>
                                    <th class="px-6 py-3 text-right">Jumlah</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y">
                                <tr>
                                    <td class="px-6 py-3">10 Feb</td>
                                    <td class="px-6 py-3">Infaq Kotak Jumat</td>
                                    <td class="px-6 py-3 text-right text-green-600 font-bold">+ Rp 1.200.000</td>
                                </tr>
                                <tr>
                                    <td class="px-6 py-3">08 Feb</td>
                                    <td class="px-6 py-3">Bayar Listrik Masjid</td>
                                    <td class="px-6 py-3 text-right text-red-600 font-bold">- Rp 450.000</td>
                                </tr>
                                <tr>
                                    <td class="px-6 py-3">05 Feb</td>
                                    <td class="px-6 py-3">Bisyaorh Guru TPQ</td>
                                    <td class="px-6 py-3 text-right text-red-600 font-bold">- Rp 1.000.000</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <div class="bg-yellow-50 p-6 rounded-xl border border-yellow-200">
                        <h3 class="font-bold text-yellow-800 mb-3"><i class="fas fa-clipboard-list"></i> Kebutuhan Mendesak (Budgeting)</h3>
                        <ul class="list-disc list-inside text-sm text-gray-700 space-y-2">
                            <li>Pelunasan HP Dokumentasi (Kurang Rp 2.5jt)</li>
                            <li>Perbaikan Sound System Sayap Kiri</li>
                            <li>Operasional Makan Gratis Ramadhan</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <section id="donasi" class="py-16 bg-gradient-to-br from-primary to-secondary text-white">
        <div class="container mx-auto px-4 text-center">
            <h2 class="text-3xl font-bold mb-8">Salurkan Infaq & Zakat</h2>
            
            <div class="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-center bg-white text-gray-800 rounded-2xl p-8 shadow-2xl">
                <div class="text-left">
                    <h3 class="text-xl font-bold mb-4 border-b pb-2">Metode Transfer</h3>
                    <div class="space-y-4">
                        <div class="flex items-center p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition">
                            <i class="fas fa-qrcode text-3xl mr-4"></i>
                            <div>
                                <p class="font-bold">QRIS (GoPay, OVO, Shopee)</p>
                                <p class="text-xs text-gray-500">Scan Otomatis</p>
                            </div>
                        </div>
                        <div class="flex items-center p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition">
                            <i class="fas fa-university text-3xl mr-4"></i>
                            <div>
                                <p class="font-bold">Bank Syariah Indonesia (BSI)</p>
                                <p class="text-sm font-mono bg-gray-100 px-2 inline-block rounded mt-1">1234-5678-90 a.n Masjid Puloniti</p>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="bg-gray-50 p-6 rounded-xl">
                    <h3 class="font-bold mb-3">Konfirmasi Donasi</h3>
                    <p class="text-sm text-gray-600 mb-4">Sudah transfer? Kirim bukti untuk pencatatan transparan.</p>
                    <a href="https://wa.me/?text=Assalamualaikum,%20Saya%20mau%20konfirmasi%20donasi..." class="block w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 rounded-lg transition">
                        <i class="fab fa-whatsapp text-xl mr-2"></i> Konfirmasi via WhatsApp
                    </a>
                    <p class="text-xs text-gray-400 mt-4 text-center">Dana akan langsung tampil di grafik setelah verifikasi.</p>
                </div>
            </div>
        </div>
    </section>

    <footer class="bg-gray-900 text-gray-400 py-12">
        <div class="container mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
                <h4 class="text-white text-lg font-bold mb-4">Masjid An-Nur Puloniti</h4>
                <p class="text-sm mb-4">Menghadirkan ketenangan dan solusi bagi umat.</p>
                <div class="flex space-x-4">
                    <a href="#" class="text-2xl hover:text-white"><i class="fab fa-youtube"></i></a>
                    <a href="#" class="text-2xl hover:text-white"><i class="fab fa-facebook"></i></a>
                    <a href="#" class="text-2xl hover:text-white"><i class="fab fa-instagram"></i></a>
                </div>
            </div>
            <div>
                <h4 class="text-white text-lg font-bold mb-4">Lokasi</h4>
                <p class="text-sm mb-2"><i class="fas fa-map-marker-alt mr-2"></i> Desa Puloniti, RT 10-12</p>
                <div class="w-full h-32 bg-gray-800 rounded mt-2 flex items-center justify-center">
                    <span class="text-xs">[Google Maps Embed]</span>
                </div>
            </div>
            <div>
                <h4 class="text-white text-lg font-bold mb-4">Kontak</h4>
                <p class="text-sm"><i class="fas fa-phone mr-2"></i> 0812-3456-7890 (Takmir)</p>
                <p class="text-sm mt-2"><i class="fas fa-envelope mr-2"></i> info@masjidpuloniti.com</p>
            </div>
        </div>
        <div class="text-center mt-12 border-t border-gray-800 pt-8 text-sm">
            &copy; 2024 Masjid Puloniti. All rights reserved.
        </div>
    </footer>

    <script>
        // 1. Mobile Menu Toggle
        const btn = document.getElementById('mobile-menu-btn');
        const menu = document.getElementById('mobile-menu');

        btn.addEventListener('click', () => {
            menu.classList.toggle('hidden');
        });

        // 2. Countdown Timer (Target: Next Tuesday)
        function updateCountdown() {
            const now = new Date();
            const nextTuesday = new Date();
            nextTuesday.setDate(now.getDate() + ((2 + 7 - now.getDay()) % 7));
            nextTuesday.setHours(19, 30, 0, 0); // 19:30 Kajian

            if (now > nextTuesday) {
                nextTuesday.setDate(nextTuesday.getDate() + 7);
            }

            const diff = nextTuesday - now;
            
            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

            document.getElementById('countdown').innerHTML = 
                `<span class="bg-gray-200 px-2 rounded">${days}H</span> : 
                 <span class="bg-gray-200 px-2 rounded">${hours}J</span> : 
                 <span class="bg-gray-200 px-2 rounded">${minutes}M</span>`;
        }
        setInterval(updateCountdown, 1000);
        updateCountdown();

        // 3. Chart.js Implementation (Grafik Keuangan)
        const ctx = document.getElementById('financeChart').getContext('2d');
        const financeChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun'],
                datasets: [
                    {
                        label: 'Pemasukan (Infaq/Zakat)',
                        data: [12000000, 15000000, 10000000, 18000000, 14000000, 16000000],
                        backgroundColor: 'rgba(5, 150, 105, 0.7)', // Emerald
                        borderColor: 'rgba(5, 150, 105, 1)',
                        borderWidth: 1
                    },
                    {
                        label: 'Pengeluaran',
                        data: [8000000, 9000000, 8500000, 12000000, 9500000, 10000000],
                        backgroundColor: 'rgba(220, 38, 38, 0.7)', // Red
                        borderColor: 'rgba(220, 38, 38, 1)',
                        borderWidth: 1
                    }
                ]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    </script>
</body>
</html>