<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\TransaksiKeuangan;
use App\Models\Visitor;

class DashboardController extends Controller
{
    public function getStats()
    {
        $year = now()->year;
        $months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Ags', 'Sep', 'Okt', 'Nov', 'Des'];

        $finances = [];
        $visitors = [];

        // Looping untuk merekap data dari bulan 1 sampai 12
        for ($i = 1; $i <= 12; $i++) {
            // Rekap Keuangan Bulanan
            $pemasukan = TransaksiKeuangan::whereYear('tanggal_transaksi', $year)
                            ->whereMonth('tanggal_transaksi', $i)
                            ->where('tipe', 'masuk')
                            ->sum('nominal');

            $pengeluaran = TransaksiKeuangan::whereYear('tanggal_transaksi', $year)
                            ->whereMonth('tanggal_transaksi', $i)
                            ->where('tipe', 'keluar')
                            ->sum('nominal');

            $finances[] = [
                'name' => $months[$i - 1],
                'Pemasukan' => (float) $pemasukan,
                'Pengeluaran' => (float) $pengeluaran
            ];

            // Rekap Pengunjung Landing Page Bulanan
            $hits = Visitor::whereYear('date', $year)
                            ->whereMonth('date', $i)
                            ->sum('hits');

            $visitors[] = [
                'name' => $months[$i - 1],
                'Pengunjung' => (int) $hits
            ];
        }

        // Ringkasan Kartu Atas (Total Keseluruhan)
        $totalPemasukan = TransaksiKeuangan::where('tipe', 'masuk')->sum('nominal');
        $totalPengeluaran = TransaksiKeuangan::where('tipe', 'keluar')->sum('nominal');
        $saldoKas = $totalPemasukan - $totalPengeluaran;
        $totalVisitors = Visitor::sum('hits');

        return response()->json([
            'success' => true,
            'data' => [
                'tahun' => $year,
                'chart_keuangan' => $finances,
                'chart_pengunjung' => $visitors,
                'summary' => [
                    'saldo' => $saldoKas,
                    'pemasukan' => $totalPemasukan,
                    'pengeluaran' => $totalPengeluaran,
                    'visitors' => $totalVisitors
                ]
            ]
        ]);
    }
}
