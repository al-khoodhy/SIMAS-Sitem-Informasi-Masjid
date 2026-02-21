// src/pages/Dashboard.jsx
import { useState, useEffect } from 'react';
import {
    Wallet, TrendingUp, TrendingDown, Users, Activity
} from 'lucide-react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area
} from 'recharts';
import api from '../api/axios';

export default function Dashboard() {
    const user = JSON.parse(localStorage.getItem('user'));
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    // Solusi ampuh pencegah warning recharts
    const [isMounted, setIsMounted] = useState(false); 

    useEffect(() => {
        setIsMounted(true);
        fetchDashboardStats();
    }, []);

    const fetchDashboardStats = async () => {
        try {
            const res = await api.get('/dashboard-stats');
            setStats(res.data.data);
        } catch (error) {
            console.error("Gagal mengambil statistik dashboard. Error: ", error);
        } finally {
            setLoading(false);
        }
    };

    const formatRupiah = (angka) =>
        new Intl.NumberFormat('id-ID', {
            style: 'currency', currency: 'IDR', minimumFractionDigits: 0
        }).format(angka || 0);

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-100 text-sm">
                    <p className="font-bold text-gray-800 mb-2">
                        {label} {stats?.tahun}
                    </p>
                    {payload.map((entry, index) => (
                        <p key={index} style={{ color: entry.color }} className="font-semibold">
                            {entry.name}: {formatRupiah(entry.value)}
                        </p>
                    ))}
                </div>
            );
        }
        return null;
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[70vh]">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div>
            {/* Header */}
            <div className="mb-8 bg-gradient-to-r from-primary to-secondary p-8 rounded-2xl text-white shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl transform translate-x-10 -translate-y-10"></div>
                <div className="relative z-10">
                    <h1 className="text-3xl font-extrabold mb-2">
                        Assalamu'alaikum, {user?.name}!
                    </h1>
                    <p className="text-green-100 opacity-90 text-lg">
                        Selamat datang di Dasbor Utama SIMAS An-Nur Puloniti.
                        Anda login sebagai{' '}
                        <span className="font-bold uppercase underline decoration-2 underline-offset-4">
                            {user?.role}
                        </span>.
                    </p>
                </div>
            </div>

            {/* Summary Cards (Semua Role Bisa Lihat) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 min-w-0">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center hover:shadow-md transition">
                    <div className="w-14 h-14 bg-green-100 text-green-600 rounded-xl flex items-center justify-center mr-4">
                        <Wallet className="w-7 h-7" />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 font-medium">Saldo Kas Masjid</p>
                        <h3 className="text-2xl font-bold text-gray-800">
                            {formatRupiah(stats?.summary?.saldo)}
                        </h3>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center hover:shadow-md transition">
                    <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mr-4">
                        <TrendingUp className="w-7 h-7" />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 font-medium">Total Pemasukan</p>
                        <h3 className="text-2xl font-bold text-gray-800">
                            {formatRupiah(stats?.summary?.pemasukan)}
                        </h3>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center hover:shadow-md transition">
                    <div className="w-14 h-14 bg-red-100 text-red-600 rounded-xl flex items-center justify-center mr-4">
                        <TrendingDown className="w-7 h-7" />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 font-medium">Total Pengeluaran</p>
                        <h3 className="text-2xl font-bold text-gray-800">
                            {formatRupiah(stats?.summary?.pengeluaran)}
                        </h3>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center hover:shadow-md transition">
                    <div className="w-14 h-14 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center mr-4">
                        <Users className="w-7 h-7" />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 font-medium">Total Visibilitas Web</p>
                        <h3 className="text-2xl font-bold text-gray-800">
                            {stats?.summary?.visitors}{' '}
                            <span className="text-sm font-normal text-gray-500">Klik</span>
                        </h3>
                    </div>
                </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8 min-w-0">
                {/* Bar Chart Keuangan */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 min-w-0 flex flex-col">
                    <div className="mb-6">
                        <h3 className="text-lg font-bold text-gray-800 flex items-center">
                            <Activity className="w-5 h-5 mr-2 text-primary" />
                            Arus Kas Tahun {stats?.tahun}
                        </h3>
                        <p className="text-sm text-gray-500">Perbandingan Pemasukan & Pengeluaran</p>
                    </div>

                    <div className="w-full flex-1" style={{ minHeight: '300px' }}>
                        {isMounted && (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={stats?.chart_keuangan || []} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                                    <YAxis tickFormatter={(val) => `Rp${val / 1000000}M`} axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Legend wrapperStyle={{ paddingTop: '20px' }} />
                                    <Bar dataKey="Pemasukan" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={40} />
                                    <Bar dataKey="Pengeluaran" fill="#ef4444" radius={[4, 4, 0, 0]} maxBarSize={40} />
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </div>

                {/* Area Chart Pengunjung */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 min-w-0 flex flex-col">
                    <div className="mb-6">
                        <h3 className="text-lg font-bold text-gray-800 flex items-center">
                            <Users className="w-5 h-5 mr-2 text-purple-500" />
                            Trafik Pengunjung Web {stats?.tahun}
                        </h3>
                        <p className="text-sm text-gray-500">Jumlah akses ke Landing Page</p>
                    </div>

                    <div className="w-full flex-1" style={{ minHeight: '300px' }}>
                        {isMounted && (
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={stats?.chart_pengunjung || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorVisits" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3}/>
                                            <stop offset="95%" stopColor="#a855f7" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                                    <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} cursor={{ stroke: '#a855f7', strokeWidth: 1, strokeDasharray: '5 5' }} />
                                    <Area type="monotone" dataKey="Pengunjung" stroke="#a855f7" strokeWidth={3} fillOpacity={1} fill="url(#colorVisits)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}