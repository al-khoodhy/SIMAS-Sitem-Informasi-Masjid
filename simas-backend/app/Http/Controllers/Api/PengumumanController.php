<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Pengumuman;
use Illuminate\Support\Str;

class PengumumanController extends Controller
{
    // --- PUBLIK ---
    public function indexPublic()
    {
        // Ambil semua pengumuman, urutkan dari yang terbaru
        $data = Pengumuman::orderBy('tanggal_publish', 'desc')
                          ->orderBy('created_at', 'desc')
                          ->get();
        return response()->json(['success' => true, 'data' => $data]);
    }

    public function showPublic($slug)
    {
        $pengumuman = Pengumuman::where('slug', $slug)->firstOrFail();
        return response()->json(['success' => true, 'data' => $pengumuman]);
    }

    // --- ADMIN (CRUD) ---
    public function index()
    {
        $data = Pengumuman::orderBy('tanggal_publish', 'desc')->get();
        return response()->json(['success' => true, 'data' => $data]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'judul' => 'required|string|max:255',
            'konten' => 'required|string',
            'tanggal_publish' => 'required|date'
        ]);

        $data = $request->all();
        $data['slug'] = Str::slug($request->judul) . '-' . time();

        Pengumuman::create($data);
        return response()->json(['success' => true, 'message' => 'Pengumuman diterbitkan']);
    }

    public function update(Request $request, $id)
    {
        $pengumuman = Pengumuman::findOrFail($id);
        $data = $request->all();
        
        if ($request->judul !== $pengumuman->judul) {
            $data['slug'] = Str::slug($request->judul) . '-' . time();
        }

        $pengumuman->update($data);
        return response()->json(['success' => true, 'message' => 'Pengumuman diperbarui']);
    }

    public function destroy($id)
    {
        Pengumuman::destroy($id);
        return response()->json(['success' => true, 'message' => 'Pengumuman dihapus']);
    }
}