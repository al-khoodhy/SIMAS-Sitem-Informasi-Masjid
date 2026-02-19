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
    public function index(Request $request)
    {
        // 1. PELACAKAN PENGUNJUNG HARIAN BERDASARKAN IP ADDRESS
        $ipAddress = $request->ip(); 
        $today = now()->format('Y-m-d');
        
        // Kunci cache: contoh "visitor_127.0.0.1_2026-02-19"
        $cacheKey = 'visitor_' . $ipAddress . '_' . $today;

        // Jika IP ini belum membuka web HARI INI
        if (!\Illuminate\Support\Facades\Cache::has($cacheKey)) {
            
            // Simpan ke cache sampai akhir hari (jam 23:59:59)
            \Illuminate\Support\Facades\Cache::put($cacheKey, true, now()->endOfDay());

            // Catat ke tabel pengunjung
            $visitor = \App\Models\Visitor::firstOrCreate(
                ['date' => $today], 
                ['hits' => 0]
            );
            $visitor->increment('hits');
        }

        // 2. Ringkasan Keuangan Kas Masjid
        $totalPemasukan = \App\Models\TransaksiKeuangan::where('tipe', 'masuk')->sum('nominal');
        $totalPengeluaran = \App\Models\TransaksiKeuangan::where('tipe', 'keluar')->sum('nominal');
        $saldoAkhir = $totalPemasukan - $totalPengeluaran;

        // 3. Daftar Pengadaan / Target Dana yang Masih Aktif
        $campaigns = \App\Models\CampaignDonasi::where('status', 'aktif')
                        ->orderBy('created_at', 'desc')
                        ->get();

        // 4. Hanya ambil 3 Berita/Kegiatan Terbaru
        $berita = \App\Models\Berita::with('penulis:id,name')
        ->where('status', 'dipublikasi')
        ->orderBy('created_at', 'desc')
        ->take(3) 
        ->get();

        // 5. Ambil Agenda yang akan datang (Mulai hari ini ke depan)
        $agenda = \App\Models\Agenda::where('waktu_pelaksanaan', '>=', now())
                        ->orderBy('waktu_pelaksanaan', 'asc')
                        ->take(4)
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

    // FUNGSI BARU: Mengambil Semua Berita untuk Halaman "Semua Berita"
    public function allBerita()
    {
        $berita = \App\Models\Berita::with('penulis:id,name')
                        ->where('status', 'dipublikasi')
                        ->orderBy('created_at', 'desc')
                        ->get(); // Di masa depan bisa diganti ->paginate(9) jika berita sudah ratusan

        return response()->json(['success' => true, 'data' => $berita], 200);
    }

    // Mengambil agenda yang difilter (Default: 3 Bulan Ke Depan)
    public function allAgenda(Request $request)
    {
        $query = \App\Models\Agenda::query();

        // Jika user memfilter bulan dan tahun spesifik
        if ($request->filled('month') && $request->filled('year')) {
            $query->whereYear('waktu_pelaksanaan', $request->year)
                ->whereMonth('waktu_pelaksanaan', $request->month);
        } else {
            // DEFAULT TERBAIK: Dari hari ini sampai akhir bulan ke-3 ke depan
            $query->where('waktu_pelaksanaan', '>=', now())
                ->where('waktu_pelaksanaan', '<=', now()->addMonths(3)->endOfMonth());
        }

        // Urutkan jadwal secara ascending (terdekat di atas)
        $agendas = $query->orderBy('waktu_pelaksanaan', 'asc')->get();
        
        return response()->json(['success' => true, 'data' => $agendas], 200);
    }

    public function newsDetail($id)
    {
        $berita = \App\Models\Berita::with('penulis:id,name')->findOrFail($id);
        
        // Gunakan Try-Catch agar aman. 
        // Jika kolom 'views' belum dibuat di database, sistem tidak akan error 500.
        try {
            $berita->increment('views');
        } catch (\Exception $e) {
            // Abaikan diam-diam jika gagal increment
        }

        return response()->json(['success' => true, 'data' => $berita], 200);
    }

    
}
