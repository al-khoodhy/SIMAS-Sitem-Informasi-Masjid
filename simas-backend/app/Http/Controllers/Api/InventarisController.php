<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Inventaris;
use Illuminate\Http\Request;

class InventarisController extends Controller
{
    public function index()
    {
        return response()->json(Inventaris::all());
    }

    public function store(Request $request)
    {
        $request->validate([
            'kode_barang' => 'required|unique:inventaris',
            'nama_barang' => 'required|string',
            'jumlah' => 'required|integer|min:1',
            'kondisi' => 'required|in:baik,rusak_ringan,rusak_berat',
            'lokasi_penyimpanan' => 'required|string'
        ]);

        $barang = Inventaris::create($request->all());
        return response()->json(['success' => true, 'data' => $barang], 201);
    }

    // Fungsi update dan delete mengikuti pola yang sama...
    public function destroy($id)
    {
        Inventaris::destroy($id);
        return response()->json(['success' => true, 'message' => 'Barang dihapus']);
    }
}