<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\TransaksiKeuangan;

class TransaksiKeuanganController extends Controller
{
    public function index(Request $request)
    {
        $query = \App\Models\TransaksiKeuangan::with('kategori');

        if ($request->filled('tipe') && $request->tipe !== 'semua') {
            // Gunakan LIKE agar fleksibel (mencari kata 'masuk' atau 'pemasukan')
            $query->where('tipe', 'like', '%' . $request->tipe . '%');
        }

        if ($request->filled('search')) {
            $query->where('keterangan', 'like', '%' . $request->search . '%');
        }

        $transactions = $query->orderBy('tanggal_transaksi', 'desc')
                              ->orderBy('id', 'desc')
                              ->paginate(20);

        // =========================================================
        // PERBAIKAN KALKULASI KARTU RINGKASAN (MENGATASI NILAI 0)
        // Kita gunakan LIKE agar menangkap variasi teks di Database
        // =========================================================
        $totalPemasukan = \App\Models\TransaksiKeuangan::where('tipe', 'like', '%masuk%')
                            ->orWhere('tipe', 'like', '%pemasukan%')
                            ->sum('nominal');
                            
        $totalPengeluaran = \App\Models\TransaksiKeuangan::where('tipe', 'like', '%keluar%')
                            ->orWhere('tipe', 'like', '%pengeluaran%')
                            ->sum('nominal');
                            
        $saldo = $totalPemasukan - $totalPengeluaran;

        return response()->json([
            'success' => true,
            'data' => $transactions->items(),
            'pagination' => [
                'current_page' => $transactions->currentPage(),
                'last_page' => $transactions->lastPage(),
                'total' => $transactions->total()
            ],
            'summary' => [
                'pemasukan' => (float) $totalPemasukan,
                'pengeluaran' => (float) $totalPengeluaran,
                'saldo' => (float) $saldo
            ]
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'tanggal_transaksi' => 'required|date',
            'tipe' => 'required|in:masuk,keluar',
            'nominal' => 'required|numeric|min:1',
            'keterangan' => 'required|string', // Pastikan KETERANGAN, bukan deskripsi
        ]);

        $data = $request->all();
        // Otomatis catat ID Panitia yang menginput
        $data['user_id'] = auth()->id(); 

        TransaksiKeuangan::create($data);
        return response()->json(['success' => true, 'message' => 'Transaksi berhasil dicatat']);
    }

    public function update(Request $request, $id)
    {
        $transaksi = TransaksiKeuangan::findOrFail($id);
        $transaksi->update($request->all());
        return response()->json(['success' => true, 'message' => 'Transaksi diperbarui']);
    }

    // FITUR HAPUS SUDAH AKTIF
    public function destroy($id)
    {
        TransaksiKeuangan::destroy($id);
        return response()->json(['success' => true, 'message' => 'Transaksi dihapus']);
    }
}