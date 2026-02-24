<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Mustahik;
use App\Models\PenyaluranZakat;
use App\Models\TransaksiKeuangan;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Facades\Auth;

class ZakatController extends Controller
{
    public function indexPenyaluran(Request $request)
    {
        $query = \App\Models\PenyaluranZakat::with('mustahik');
        
        // Deteksi nama tabel asli secara dinamis agar 100% aman dari error SQL
        $penyaluranTable = (new \App\Models\PenyaluranZakat)->getTable();
        $mustahikTable = (new \App\Models\Mustahik)->getTable();

        // 1. Filter Pencarian berdasarkan Nama Mustahik atau RT
        if ($request->filled('search')) {
            $search = $request->search;
            $query->whereHas('mustahik', function($q) use ($search) {
                $q->where('nama_lengkap', 'like', "%{$search}%")
                  ->orWhere('rt', 'like', "%{$search}%");
            });
        }

        // 2. Filter berdasarkan Status (menunggu / disalurkan)
        if ($request->filled('status') && $request->status !== 'semua') {
            $query->where("{$penyaluranTable}.status", $request->status);
        }

        // 3. Filter berdasarkan Tahun
        if ($request->filled('tahun') && $request->tahun !== 'semua') {
            $query->whereYear("{$penyaluranTable}.created_at", $request->tahun);
        }

        // 4. Pengurutan (Sorting) MENGGUNAKAN SUBQUERY (Cara Paling Aman & Stabil)
        $sort = $request->input('sort', 'terbaru');

        if ($sort === 'nama_asc' || $sort === 'nama_desc') {
            $direction = $sort === 'nama_asc' ? 'asc' : 'desc';
            $query->orderBy(
                \App\Models\Mustahik::select('nama_lengkap')
                    ->whereColumn("{$mustahikTable}.id", "{$penyaluranTable}.mustahik_id")
                    ->limit(1),
                $direction
            );
        } elseif ($sort === 'rt_asc' || $sort === 'rt_desc') {
            $direction = $sort === 'rt_asc' ? 'asc' : 'desc';
            $query->orderBy(
                \App\Models\Mustahik::select('rt')
                    ->whereColumn("{$mustahikTable}.id", "{$penyaluranTable}.mustahik_id")
                    ->limit(1),
                $direction
            );
        } else {
            // Default: yang terbaru di atas
            $query->latest("{$penyaluranTable}.created_at");
        }

        // 5. Pagination (Hanya ambil 20 per halaman)
        $penyaluran = $query->paginate(20);

        return response()->json([
            'success' => true, 
            'data' => $penyaluran->items(),
            'pagination' => [
                'current_page' => $penyaluran->currentPage(),
                'last_page' => $penyaluran->lastPage(),
                'total' => $penyaluran->total()
            ]
        ]);
    }

    // 2. PANITIA MEMBUAT RENCANA PENYALURAN (Status: Menunggu)
    public function storePenyaluran(Request $request)
    {
        $request->validate([
            'mustahik_id' => 'required|exists:mustahik,id',
            'jenis_zakat' => 'required|in:fitrah,mal',
            'bentuk_barang' => 'nullable|string',
            'nominal_uang' => 'nullable|numeric',
        ]);

        $data = $request->all();
        $data['tanggal_penyaluran'] = now(); // Default hari ini
        $data['status'] = 'menunggu';

        $penyaluran = PenyaluranZakat::create($data);
        return response()->json(['success' => true, 'data' => $penyaluran]);
    }

    // 3. REMAJA / PANITIA MENGKONFIRMASI PENYALURAN DI LAPANGAN
    public function konfirmasiPenyaluran(Request $request, $id)
    {
        $penyaluran = PenyaluranZakat::findOrFail($id);

        $request->validate([
            'foto_dokumentasi' => 'required|image|mimes:jpeg,png,jpg|max:2048'
        ]);

        if ($request->hasFile('foto_dokumentasi')) {
            $path = $request->file('foto_dokumentasi')->store('dokumentasi_zakat', 'public');
            $penyaluran->foto_dokumentasi = $path;
        }

        $penyaluran->status = 'disalurkan';
        $penyaluran->tanggal_penyaluran = now(); // Update waktu aktual disalurkan
        $penyaluran->save();

        return response()->json(['success' => true, 'message' => 'Penyaluran berhasil dikonfirmasi']);
    }

    // 4. SUMMARY ZAKAT PER TAHUN (Untuk Audit)
    public function summaryTahunan(Request $request)
    {
        $tahun = $request->tahun ?? date('Y');

        // Asumsi: ID Kategori Zakat Fitrah = 2, Zakat Mal = (Misal ID 6, sesuaikan dengan DB Anda)
        // Cara dinamis: cari kategori yang namanya mengandung kata 'Fitrah' atau 'Mal'
        $totalFitrah = TransaksiKeuangan::whereYear('tanggal_transaksi', $tahun)
            ->whereHas('kategori', function($q) { $q->where('nama_kategori', 'like', '%Fitrah%'); })->sum('nominal');
            
        $totalMal = TransaksiKeuangan::whereYear('tanggal_transaksi', $tahun)
            ->whereHas('kategori', function($q) { $q->where('nama_kategori', 'like', '%Mal%'); })->sum('nominal');

        $penyaluranSelesai = PenyaluranZakat::whereYear('tanggal_penyaluran', $tahun)
            ->where('status', 'disalurkan')->count();

        return response()->json([
            'success' => true,
            'data' => [
                'tahun' => $tahun,
                'total_fitrah' => $totalFitrah,
                'total_mal' => $totalMal,
                'total_mustahik_menerima' => $penyaluranSelesai
            ]
        ]);
    }

    // 5. EXPORT AUDIT PDF ZAKAT
    public function exportPdf(Request $request)
    {
        $tahun = $request->tahun ?? date('Y');

        $path = public_path('logo-masjid.png');

        $penyaluran = PenyaluranZakat::with('mustahik')
            ->whereYear('tanggal_penyaluran', $tahun)
            ->where('status', 'disalurkan')
            ->get();

        $data = [
            'tahun' => $tahun,
            'logo' => $path,
            'penyaluran' => $penyaluran,
            'pencetak' => Auth::user()->name,
            'tanggal_cetak' => now()->format('d M Y H:i')
        ];

        $pdf = Pdf::loadView('pdf.audit_zakat', $data);
        return $pdf->download("Audit_Zakat_{$tahun}.pdf");
    }
    // Mengelola Data Warga Penerima Zakat (Mustahik)
    public function storeMustahik(Request $request)
    {
        $request->validate([
            'nama_lengkap' => 'required|string',
            'nik' => 'nullable|unique:mustahik,nik',
            'rt' => 'required|string', // Contoh: 10, 11, 12
            'alamat' => 'required|string',
            'kategori' => 'required|in:fakir,miskin,mualaf,fisabilillah,ibnu_sabil,gharim,riqab,amil'
        ]);

        $mustahik = Mustahik::create($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Data Mustahik berhasil ditambahkan',
            'data' => $mustahik
        ], 201);
    }
    
    public function updatePenyaluran(Request $request, $id)
    {
        $penyaluran = \App\Models\PenyaluranZakat::findOrFail($id);
        $penyaluran->update($request->all());
        return response()->json(['success' => true, 'message' => 'Penyaluran diperbarui']);
    }

    public function destroyPenyaluran($id)
    {
        \App\Models\PenyaluranZakat::destroy($id);
        return response()->json(['success' => true, 'message' => 'Penyaluran dihapus']);
    }

    // HAPUS MASSAL PENYALURAN ZAKAT
    public function massDestroyPenyaluran(Request $request)
    {
        $request->validate(['ids' => 'required|array']);
        \App\Models\PenyaluranZakat::whereIn('id', $request->ids)->delete();
        return response()->json(['success' => true, 'message' => 'Data penyaluran berhasil dihapus']);
    }

    // EDIT MASSAL PENYALURAN ZAKAT
    public function massUpdatePenyaluran(Request $request)
    {
        $request->validate(['ids' => 'required|array']);
        
        $updateData = [];
        if ($request->filled('status')) $updateData['status'] = $request->status;
        if ($request->filled('jenis_zakat')) $updateData['jenis_zakat'] = $request->jenis_zakat;
        if ($request->filled('bentuk_barang')) $updateData['bentuk_barang'] = $request->bentuk_barang;
        if ($request->filled('nominal_uang')) $updateData['nominal_uang'] = $request->nominal_uang;

        if (!empty($updateData)) {
            \App\Models\PenyaluranZakat::whereIn('id', $request->ids)->update($updateData);
        }

        return response()->json(['success' => true, 'message' => 'Data massal berhasil diperbarui']);
    }
}
