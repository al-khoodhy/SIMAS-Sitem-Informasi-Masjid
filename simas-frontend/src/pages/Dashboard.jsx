// src/pages/Dashboard.jsx
import { useEffect, useState } from 'react';
import { ArrowUpCircle, ArrowDownCircle, Wallet } from 'lucide-react';
import api from '../api/axios';


export default function Dashboard() {
    const [summary, setSummary] = useState({ total_pemasukan: 0, total_pengeluaran: 0, saldo_akhir: 0 });
    const user = JSON.parse(localStorage.getItem('user'));

    useEffect(() => {
        const fetchSummary = async () => {
            try {
                const response = await api.get('/summary'); // Sesuaikan dengan route API Anda
                setSummary(response.data.data);
            } catch (error) {
                console.error("Gagal mengambil data keuangan", error);
            }
        };
    
        // Hanya Panitia dan Developer yang boleh narik data keuangan
        if (user.role === 'panitia' || user.role === 'developer') {
            fetchSummary();
        }
    }, [user.role]);

    const formatRupiah = (angka) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(angka);
    };

    return (
        <div>
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Selamat Datang, {user.name}!</h1>

            {/* Jika role panitia, tampilkan Widget Keuangan */}
            {(user.role === 'panitia' || user.role === 'developer') ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-green-500 flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500 font-medium mb-1">Total Pemasukan</p>
                            <h3 className="text-2xl font-bold text-gray-800">{formatRupiah(summary.total_pemasukan)}</h3>
                        </div>
                        <ArrowUpCircle className="w-10 h-10 text-green-500 opacity-20" />
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-red-500 flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500 font-medium mb-1">Total Pengeluaran</p>
                            <h3 className="text-2xl font-bold text-gray-800">{formatRupiah(summary.total_pengeluaran)}</h3>
                        </div>
                        <ArrowDownCircle className="w-10 h-10 text-red-500 opacity-20" />
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-primary flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500 font-medium mb-1">Saldo Kas Saat Ini</p>
                            <h3 className="text-2xl font-bold text-primary">{formatRupiah(summary.saldo_akhir)}</h3>
                        </div>
                        <Wallet className="w-10 h-10 text-primary opacity-20" />
                    </div>
                </div>
            ) : (
                <div className="bg-blue-50 text-blue-800 p-4 rounded-lg">
                    <p>Halo Remaja Masjid! Silahkan akses menu Manajemen Berita dan Inventaris di sebelah kiri.</p>
                </div>
            )}
            
            {/* Nanti di bawah sini bisa ditambahkan Tabel Transaksi Terakhir atau Berita Menunggu Persetujuan */}
        </div>
    );
}