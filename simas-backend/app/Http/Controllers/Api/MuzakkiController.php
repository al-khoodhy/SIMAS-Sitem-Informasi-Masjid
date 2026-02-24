<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Muzakki;

class MuzakkiController extends Controller
{
    public function index(Request $request)
    {
        $query = \App\Models\Muzakki::query();
        $tahun = $request->tahun ?? date('Y');

        // Filter Tahun
        $query->where('tahun', $tahun);

        // Filter Pencarian Nama
        if ($request->filled('search')) {
            $query->where('nama_muzakki', 'like', '%' . $request->search . '%');
        }

        // Pengurutan (Sorting) Nama
        if ($request->filled('sort')) {
            if ($request->sort === 'nama_asc') $query->orderBy('nama_muzakki', 'asc');
            elseif ($request->sort === 'nama_desc') $query->orderBy('nama_muzakki', 'desc');
            else $query->latest();
        } else {
            $query->latest();
        }

        // Kalkulasi Statistik untuk Tahun Tersebut
        $totalBerasKg = \App\Models\Muzakki::where('tahun', $tahun)->where('bentuk_pembayaran', 'beras')->sum('berat_beras_kg');
        $totalUangFitrah = \App\Models\Muzakki::where('tahun', $tahun)->where('jenis_zakat', 'fitrah')->where('bentuk_pembayaran', 'uang')->sum('nominal_uang');
        $totalUangMal = \App\Models\Muzakki::where('tahun', $tahun)->where('jenis_zakat', 'mal')->sum('nominal_uang');

        $data = $query->paginate(20);

        return response()->json([
            'success' => true,
            'data' => $data->items(),
            'summary' => [
                'total_beras_kg' => (float) $totalBerasKg,
                'total_uang_fitrah' => (float) $totalUangFitrah,
                'total_uang_mal' => (float) $totalUangMal,
                'total_muzakki' => $data->total()
            ],
            'pagination' => [
                'current_page' => $data->currentPage(),
                'last_page' => $data->lastPage()
            ]
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'nama_muzakki' => 'required|string',
            'jenis_zakat' => 'required|in:fitrah,mal',
            'bentuk_pembayaran' => 'required|in:uang,beras',
            'tahun' => 'required'
        ]);

        Muzakki::create($request->all());
        return response()->json(['success' => true, 'message' => 'Data Muzaki berhasil dicatat']);
    }

    public function update(Request $request, $id)
    {
        $muzakki = Muzakki::findOrFail($id);
        $muzakki->update($request->all());
        return response()->json(['success' => true, 'message' => 'Data Muzaki diperbarui']);
    }

    public function destroy($id)
    {
        Muzakki::destroy($id);
        return response()->json(['success' => true, 'message' => 'Data dihapus']);
    }
}