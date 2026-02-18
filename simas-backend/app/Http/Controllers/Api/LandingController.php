<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\TransaksiKeuangan;
use App\Models\CampaignDonasi;
use App\Models\Berita;
use Illuminate\Http\Request;
use App\Models\Agenda;

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

        // 4. Ambil Agenda yang akan datang (Mulai hari ini ke depan)
        $agenda = Agenda::where('waktu_pelaksanaan', '>=', now())
                        ->orderBy('waktu_pelaksanaan', 'asc')
                        ->take(4) // Ambil 4 agenda terdekat
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
                'berita' => $berita,
                'agenda' => $agenda
            ]
        ], 200);
    }
    // Mengambil semua agenda yang akan datang
    public function allAgenda()
    {
        $agendas = Agenda::where('waktu_pelaksanaan', '>=', now())
                        ->orderBy('waktu_pelaksanaan', 'asc')
                        ->get();
        return response()->json(['success' => true, 'data' => $agendas], 200);
    }

    // Mengambil detail satu berita beserta penulisnya
    public function newsDetail($id)
    {
        $berita = Berita::with('penulis:id,name')->findOrFail($id);
        return response()->json(['success' => true, 'data' => $berita], 200);
    }
}
