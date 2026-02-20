import { Wallet, TrendingUp, TrendingDown } from 'lucide-react';
import { formatRupiah } from '../../utils/formatters';

export default function TransparansiSection({ keuanganData }) {
    // Memberikan nilai default yang aman jika props belum siap
    const { total_pemasukan = 0, total_pengeluaran = 0, saldo_akhir = 0 } = keuanganData || {};

    return (
        <section id="transparansi" className="bg-gray-50 py-16 border-t border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-10">
                    <h2 className="text-3xl font-bold text-gray-800 flex items-center justify-center gap-2">
                        <Wallet className="text-primary" /> Transparansi Kas Masjid
                    </h2>
                    <p className="text-gray-500 mt-3">Sebagai bentuk pertanggungjawaban, data keuangan diperbarui secara real-time.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white border border-green-100 p-8 rounded-2xl text-center shadow-sm hover:shadow-md transition">
                        <div className="w-14 h-14 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4"><TrendingUp className="w-7 h-7" /></div>
                        <p className="text-gray-500 font-medium mb-1">Total Pemasukan</p>
                        <h3 className="text-2xl font-bold text-green-600">{formatRupiah(total_pemasukan)}</h3>
                    </div>
                    <div className="bg-primary shadow-lg shadow-green-200 p-8 rounded-2xl text-center transform md:-translate-y-2">
                        <div className="w-14 h-14 bg-white/20 text-white rounded-full flex items-center justify-center mx-auto mb-4"><Wallet className="w-7 h-7" /></div>
                        <p className="text-green-100 font-medium mb-1">Saldo Kas Saat Ini</p>
                        <h3 className="text-3xl md:text-4xl font-extrabold text-white">{formatRupiah(saldo_akhir)}</h3>
                        <p className="text-xs text-green-200 mt-2">Dana siap digunakan untuk keperluan umat</p>
                    </div>
                    <div className="bg-white border border-red-100 p-8 rounded-2xl text-center shadow-sm hover:shadow-md transition">
                        <div className="w-14 h-14 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4"><TrendingDown className="w-7 h-7" /></div>
                        <p className="text-gray-500 font-medium mb-1">Total Pengeluaran</p>
                        <h3 className="text-2xl font-bold text-red-600">{formatRupiah(total_pengeluaran)}</h3>
                    </div>
                </div>
            </div>
        </section>
    );
}