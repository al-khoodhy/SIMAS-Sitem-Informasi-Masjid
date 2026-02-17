<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Mustahik;
use App\Models\PenyaluranZakat;

class ZakatController extends Controller
{
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

    // Mencatat Riwayat Pembagian Zakat ke Warga
    public function storePenyaluran(Request $request)
    {
        $request->validate([
            'mustahik_id' => 'required|exists:mustahik,id',
            'tanggal_penyaluran' => 'required|date',
            'nominal_uang' => 'nullable|numeric',
            'bentuk_barang' => 'nullable|string'
        ]);

        $penyaluran = PenyaluranZakat::create($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Riwayat penyaluran zakat berhasil dicatat',
            'data' => $penyaluran
        ], 201);
    }
}
