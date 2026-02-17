<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Mustahik;
use Illuminate\Http\Request;

class MustahikController extends Controller
{
    /**
     * Menampilkan semua daftar Mustahik
     */
    public function index()
    {
        // Mengambil semua data mustahik, diurutkan dari yang paling baru ditambahkan
        $mustahik = Mustahik::orderBy('created_at', 'desc')->get();

        return response()->json([
            'success' => true,
            'message' => 'Data Mustahik berhasil diambil',
            'data' => $mustahik
        ], 200);
    }

    /**
     * Menyimpan data Mustahik baru (Dari Form Modal React)
     */
    public function store(Request $request)
    {
        // 1. Validasi Input
        $request->validate([
            'nama_lengkap' => 'required|string|max:255',
            'nik'          => 'nullable|numeric|digits:16|unique:mustahik,nik',
            'rt'           => 'required|string',
            'alamat'       => 'required|string',
            'kategori'     => 'required|in:fakir,miskin,mualaf,fisabilillah,ibnu_sabil,gharim,riqab,amil'
        ], [
            // Kustomisasi pesan error agar lebih ramah dibaca di Frontend
            'nik.unique' => 'NIK ini sudah terdaftar di sistem.',
            'nik.digits' => 'NIK harus berjumlah 16 angka.'
        ]);

        // 2. Simpan ke Database
        $mustahik = Mustahik::create([
            'nama_lengkap' => $request->nama_lengkap,
            'nik'          => $request->nik,
            'rt'           => $request->rt,
            'alamat'       => $request->alamat,
            'kategori'     => $request->kategori,
            'status_aktif' => true // Default selalu aktif saat baru dibuat
        ]);

        // 3. Kembalikan Response
        return response()->json([
            'success' => true,
            'message' => 'Data Mustahik berhasil ditambahkan',
            'data'    => $mustahik
        ], 201);
    }

    /**
     * Menampilkan satu data spesifik Mustahik
     */
    public function show($id)
    {
        $mustahik = Mustahik::find($id);

        if (!$mustahik) {
            return response()->json(['success' => false, 'message' => 'Data tidak ditemukan'], 404);
        }

        return response()->json(['success' => true, 'data' => $mustahik], 200);
    }

    /**
     * Mengubah data Mustahik (Contoh: Pindah RT atau Ganti Kategori)
     */
    public function update(Request $request, $id)
    {
        $mustahik = Mustahik::find($id);

        if (!$mustahik) {
            return response()->json(['success' => false, 'message' => 'Data tidak ditemukan'], 404);
        }

        $request->validate([
            'nama_lengkap' => 'sometimes|required|string|max:255',
            'nik'          => 'nullable|numeric|digits:16|unique:mustahik,nik,' . $id, // Abaikan validasi unique untuk NIK miliknya sendiri
            'rt'           => 'sometimes|required|string',
            'alamat'       => 'sometimes|required|string',
            'kategori'     => 'sometimes|required|in:fakir,miskin,mualaf,fisabilillah,ibnu_sabil,gharim,riqab,amil',
            'status_aktif' => 'sometimes|boolean'
        ]);

        $mustahik->update($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Data Mustahik berhasil diperbarui',
            'data'    => $mustahik
        ], 200);
    }

    /**
     * Menghapus data Mustahik
     */
    public function destroy($id)
    {
        $mustahik = Mustahik::find($id);

        if (!$mustahik) {
            return response()->json(['success' => false, 'message' => 'Data tidak ditemukan'], 404);
        }

        // Cek apakah mustahik sudah punya riwayat penyaluran zakat
        // Jika sudah ada riwayatnya, lebih baik statusnya di-nonaktifkan saja, jangan dihapus (untuk integritas data)
        if ($mustahik->riwayatPenyaluran()->count() > 0) {
            return response()->json([
                'success' => false, 
                'message' => 'Mustahik tidak bisa dihapus karena memiliki riwayat menerima zakat. Silakan non-aktifkan statusnya saja.'
            ], 400);
        }

        $mustahik->delete();

        return response()->json([
            'success' => true,
            'message' => 'Data Mustahik berhasil dihapus secara permanen'
        ], 200);
    }
}
