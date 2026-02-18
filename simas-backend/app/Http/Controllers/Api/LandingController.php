<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\TransaksiKeuangan;
use App\Models\CampaignDonasi;
use App\Models\Berita;
use Illuminate\Http\Request;

class LandingController extends Controller
{
    public function index()
    {
        // 1. Ringkasan Keuangan Kas Masjid
        $totalPemasukan = TransaksiKeuangan::where('tipe', 'masuk')->sum('nominal');
        $totalPengeluaran = TransaksiKeuangan::where('tipe', 'keluar')->sum('nominal');
        $saldoAkhir = $totalPemasukan - $totalPengeluaran;

        // 2. Daftar Pengadaan / Target Dana yang Masih Aktif
        $campaigns = CampaignDonasi::where('status', 'aktif')
                        ->orderBy('created_at', 'desc')
                        ->get();

        // 3. Tiga (3) Berita/Kegiatan Terbaru yang sudah disetujui
        $berita = Berita::with('penulis:id,name')
                        ->where('status', 'dipublikasi')
                        ->orderBy('created_at', 'desc')
                        ->take(3)
                        ->get();

        // Gabungkan semua data dalam satu respons
        return response()->json([
            'success' => true,
            'data' => [
                'keuangan' => [
                    'total_pemasukan' => $totalPemasukan,
                    'total_pengeluaran' => $totalPengeluaran,
                    'saldo_akhir' => $saldoAkhir
                ],
                'campaigns' => $campaigns,
                'berita' => $berita
            ]
        ], 200);
    }
}
