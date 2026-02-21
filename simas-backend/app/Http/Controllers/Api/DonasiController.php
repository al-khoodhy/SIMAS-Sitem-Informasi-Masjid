<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Donasi;
use App\Models\TransaksiKeuangan;
use App\Models\CampaignDonasi;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;

class DonasiController extends Controller
{
    // 1. PUBLIC: Warga mengirim bukti transfer dari Landing Page
    public function submitPublic(Request $request)
    {
        $request->validate([
            'campaign_id' => 'required',
            'nama_donatur' => 'nullable|string|max:255',
            'nominal' => 'required|numeric|min:10000',
            'pesan' => 'nullable|string',
            'bukti_transfer' => 'required|image|mimes:jpeg,png,jpg|max:2048'
        ]);

        $data = $request->all();

        // -------------------------------------------------------------
        // PERBAIKAN: Jika ID adalah 0 (Kas Umum), ubah jadi NULL agar MySQL tidak Error
        if ($data['campaign_id'] == 0 || $data['campaign_id'] == '0') {
            $data['campaign_id'] = null;
        }
        // -------------------------------------------------------------

        $data['bukti_transfer'] = $request->file('bukti_transfer')->store('bukti_donasi', 'public');
        
        // Hamba Allah jika nama dikosongkan
        if (empty($data['nama_donatur'])) {
            $data['nama_donatur'] = 'Hamba Allah';
        }

        Donasi::create($data);

        return response()->json(['success' => true, 'message' => 'Alhamdulillah, konfirmasi donasi berhasil dikirim. Menunggu verifikasi Panitia.']);
    }


// 3. ADMIN: Mengedit data (misal: panitia meralat salah ketik nominal)
public function update(Request $request, $id)
{
    $donasi = Donasi::findOrFail($id);
    
    $data = $request->only(['nama_donatur', 'nominal', 'pesan', 'campaign_id']);

    // -------------------------------------------------------------
    // PERBAIKAN: Tangani juga saat Panitia mengedit dan memilih Kas Umum
    if (isset($data['campaign_id']) && ($data['campaign_id'] == 0 || $data['campaign_id'] == '0')) {
        $data['campaign_id'] = null;
    }
    // -------------------------------------------------------------

    $donasi->update($data);
    return response()->json(['success' => true, 'message' => 'Data donasi berhasil diperbarui.']);
}

    // 2. ADMIN: Melihat daftar donasi masuk
    public function index()
    {
        $donasi = Donasi::with(['campaign', 'verifikator'])->orderBy('created_at', 'desc')->get();
        return response()->json(['success' => true, 'data' => $donasi]);
    }

    // 4. ADMIN: Menyetujui Donasi (LOGIKA INTI YANG SUDAH DIPERBAIKI)
    public function approve($id)
    {
        $donasi = Donasi::findOrFail($id);

        if ($donasi->status !== 'menunggu') {
            return response()->json(['message' => 'Donasi ini sudah diproses sebelumnya.'], 400);
        }

        // Gunakan DB Transaction agar jika salah satu gagal, semuanya dibatalkan
        DB::transaction(function () use ($donasi) {
            
            // A. Ubah Status Donasi menjadi disetujui
            $donasi->update([
                'status' => 'disetujui',
                'diverifikasi_oleh' => Auth::id()
            ]);

            // B. Tambahkan nominal ke target Campaign (Jika bukan kas umum)
            if ($donasi->campaign_id != 0 && $donasi->campaign_id != null) { 
                $campaign = CampaignDonasi::find($donasi->campaign_id);
                if ($campaign) {
                    $campaign->increment('terkumpul_nominal', $donasi->nominal);
                }
            }

            // C. CARI ATAU BUAT KATEGORI KEUANGAN (Otomatis)
            // Karena tabel keuangan butuh 'kategori_id', kita pastikan ada kategori "Donasi Web"
            $kategori = \App\Models\KategoriKeuangan::firstOrCreate(
                ['nama_kategori' => 'Donasi Online (Web)'],
                ['tipe' => 'masuk'] // Sesuaikan dengan struktur tabel KategoriKeuangan Anda
            );

            // D. CATAT OTOMATIS KE BUKU KAS (Disesuaikan dengan tabel TransaksiKeuangan)
            \App\Models\TransaksiKeuangan::create([
                'kategori_id'       => $kategori->id, // Menggunakan ID Kategori (Sesuai validasi)
                'user_id'           => Auth::id(),    // Mencatat siapa panitia yang menyetujui
                'tipe'              => 'masuk',
                'nominal'           => $donasi->nominal,
                'keterangan'        => 'Donasi via Web dari ' . $donasi->nama_donatur . ($donasi->campaign ? ' untuk ' . $donasi->campaign->judul : ''), // Menggunakan nama kolom 'keterangan'
                'tanggal_transaksi' => now(),
                'bukti_foto'        => $donasi->bukti_transfer // Struk donasi otomatis masuk ke bukti transaksi keuangan!
            ]);

        });

        return response()->json(['success' => true, 'message' => 'Donasi disetujui & otomatis masuk ke Buku Kas!']);
    }

    // 5. ADMIN: Menolak Donasi (Jika struk palsu)
    public function reject($id)
    {
        $donasi = Donasi::findOrFail($id);
        $donasi->update([
            'status' => 'ditolak',
            'diverifikasi_oleh' => Auth::id()
        ]);
        return response()->json(['success' => true, 'message' => 'Donasi ditolak.']);
    }
}