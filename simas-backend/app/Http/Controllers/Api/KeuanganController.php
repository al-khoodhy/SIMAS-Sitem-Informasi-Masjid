<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\TransaksiKeuangan;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Barryvdh\DomPDF\Facade\Pdf;

class KeuanganController extends Controller
{
    // Mengambil daftar transaksi (Bisa difilter tipe masuk/keluar)
    public function index(Request $request)
    {
        $query = TransaksiKeuangan::with(['user', 'kategori']);

        // Filter berdasarkan Tipe (Masuk/Keluar)
        if ($request->has('tipe') && $request->tipe != '') {
            $query->where('tipe', $request->tipe);
        }

        // Filter berdasarkan Rentang Tanggal (Start Date & End Date)
        if ($request->filled('start_date') && $request->filled('end_date')) {
            $query->whereBetween('tanggal_transaksi', [$request->start_date, $request->end_date]);
        }

        $transaksi = $query->orderBy('tanggal_transaksi', 'desc')->get();

        return response()->json([
            'success' => true,
            'data' => $transaksi
        ]);
    }
    
    // TAMBAHKAN FUNGSI BARU: EXPORT PDF AUDIT
    public function exportPdf(Request $request)
    {
        $query = TransaksiKeuangan::with(['user', 'kategori'])->orderBy('tanggal_transaksi', 'asc');

        if ($request->filled('start_date') && $request->filled('end_date')) {
            $query->whereBetween('tanggal_transaksi', [$request->start_date, $request->end_date]);
            $periode = "Periode: " . $request->start_date . " s.d " . $request->end_date;
        } else {
            $periode = "Periode: Semua Waktu";
        }

        $path = public_path('logo-masjid.png');
        $transaksi = $query->get();
        $totalPemasukan = $transaksi->where('tipe', 'masuk')->sum('nominal');
        $totalPengeluaran = $transaksi->where('tipe', 'keluar')->sum('nominal');
        $saldoAkhir = $totalPemasukan - $totalPengeluaran;

        // Siapkan data untuk dikirim ke template PDF
        $data = [
            'transaksi' => $transaksi,
            'logo' => $path,
            'periode' => $periode,
            'totalPemasukan' => $totalPemasukan,
            'totalPengeluaran' => $totalPengeluaran,
            'saldoAkhir' => $saldoAkhir,
            'pencetak' => Auth::user()->name,
            'tanggal_cetak' => now()->format('d M Y H:i')
        ];

        // Load view HTML dan jadikan PDF
        $pdf = Pdf::loadView('pdf.audit_keuangan', $data);
        
        // Kembalikan file PDF untuk di-download
        return $pdf->download('Audit_Keuangan_Masjid.pdf');
    }

    // Mencatat Uang Masuk atau Keluar
    public function store(Request $request)
    {
        // 1. Validasi Input
        $request->validate([
            'kategori_id' => 'required|exists:kategori_keuangan,id',
            'tipe' => 'required|in:masuk,keluar',
            'nominal' => 'required|numeric|min:1',
            'keterangan' => 'required|string',
            'tanggal_transaksi' => 'required|date',
            'bukti_foto' => 'nullable|image|mimes:jpeg,png,jpg|max:2048' // Max 2MB
        ]);

        $data = $request->all();
        $data['user_id'] = Auth::id(); // Otomatis mencatat siapa bendahara yang login

        // 2. Logika Upload File Gambar (Jika ada bukti transfer/nota)
        if ($request->hasFile('bukti_foto')) {
            // Simpan ke folder storage/app/public/bukti_transaksi
            $path = $request->file('bukti_foto')->store('bukti_transaksi', 'public');
            $data['bukti_foto'] = $path;
        }

        // 3. Simpan ke Database
        $transaksi = TransaksiKeuangan::create($data);

        // Jika donasi ini untuk Campaign (Crowdfunding), update progress bar-nya!
        if ($request->filled('campaign_id') && $request->tipe == 'masuk') {
            $campaign = \App\Models\CampaignDonasi::find($request->campaign_id);
            $campaign->increment('terkumpul_nominal', $request->nominal);
        }

        return response()->json([
            'success' => true,
            'message' => 'Transaksi berhasil dicatat',
            'data' => $transaksi
        ], 201);
    }

    // Mengambil ringkasan saldo untuk Dashboard (Pemasukan vs Pengeluaran)
    public function summary()
    {
        $totalPemasukan = TransaksiKeuangan::where('tipe', 'masuk')->sum('nominal');
        $totalPengeluaran = TransaksiKeuangan::where('tipe', 'keluar')->sum('nominal');
        $saldoAkhir = $totalPemasukan - $totalPengeluaran;

        return response()->json([
            'success' => true,
            'data' => [
                'total_pemasukan' => $totalPemasukan,
                'total_pengeluaran' => $totalPengeluaran,
                'saldo_akhir' => $saldoAkhir
            ]
        ]);
    }

    public function update(Request $request, $id)
    {
        $transaksi = TransaksiKeuangan::findOrFail($id);
        $transaksi->update($request->except('bukti_foto')); // Update data teks

        // Jika ada foto baru, timpa yang lama
        if ($request->hasFile('bukti_foto')) {
            $transaksi->bukti_foto = $request->file('bukti_foto')->store('bukti_transaksi', 'public');
            $transaksi->save();
        }
        return response()->json(['success' => true, 'message' => 'Transaksi diperbarui']);
    }

    public function destroy($id)
    {
        TransaksiKeuangan::destroy($id);
        return response()->json(['success' => true, 'message' => 'Transaksi dihapus']);
    }
}
