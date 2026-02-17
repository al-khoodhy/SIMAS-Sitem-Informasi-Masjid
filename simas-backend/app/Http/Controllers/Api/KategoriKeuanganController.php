<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\KategoriKeuangan;
use Illuminate\Http\Request;

class KategoriKeuanganController extends Controller
{
    public function index()
    {
        return response()->json(['success' => true, 'data' => KategoriKeuangan::orderBy('jenis')->get()]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'nama_kategori' => 'required|string|max:255',
            'jenis' => 'required|in:pemasukan,pengeluaran'
        ]);
        $kategori = KategoriKeuangan::create($request->all());
        return response()->json(['success' => true, 'data' => $kategori], 201);
    }

    public function update(Request $request, $id)
    {
        $kategori = KategoriKeuangan::findOrFail($id);
        $request->validate(['nama_kategori' => 'required|string|max:255', 'jenis' => 'required|in:pemasukan,pengeluaran']);
        $kategori->update($request->all());
        return response()->json(['success' => true, 'data' => $kategori]);
    }

    public function destroy($id)
    {
        $kategori = KategoriKeuangan::findOrFail($id);
        // Proteksi: Jangan hapus jika sudah dipakai di transaksi
        if ($kategori->transaksi()->count() > 0) {
            return response()->json(['success' => false, 'message' => 'Kategori tidak bisa dihapus karena sedang digunakan dalam transaksi.'], 400);
        }
        $kategori->delete();
        return response()->json(['success' => true, 'message' => 'Kategori dihapus']);
    }
}