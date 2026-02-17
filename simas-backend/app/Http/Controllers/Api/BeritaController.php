<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Berita;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Storage;

class BeritaController extends Controller
{
    // Melihat daftar berita (Panitia bisa lihat semua, Remaja hanya lihat miliknya, Publik hanya lihat yang dipublish)
    public function index()
    {
        $user = Auth::user();
        $query = Berita::with(['penulis', 'penyetuju'])->latest();

        if ($user->role === 'remaja') {
            // Remaja hanya bisa melihat draft yang dia buat sendiri
            $query->where('penulis_id', $user->id);
        }

        return response()->json([
            'success' => true,
            'data' => $query->get()
        ]);
    }

    // Remaja membuat draf berita baru
    public function store(Request $request)
    {
        $request->validate([
            'judul' => 'required|string|max:255',
            'konten' => 'required|string',
            'thumbnail' => 'nullable|image|mimes:jpeg,png,jpg|max:2048',
            'link_youtube' => 'nullable|url'
        ]);

        $data = $request->all();
        $data['penulis_id'] = Auth::id();
        $data['slug'] = Str::slug($request->judul) . '-' . time(); // Membuat URL unik (contoh: kajian-selasa-167890)
        $data['status'] = 'menunggu_persetujuan'; // Status awal tidak langsung tayang!

        if ($request->hasFile('thumbnail')) {
            $data['thumbnail'] = $request->file('thumbnail')->store('berita_thumbnail', 'public');
        }

        $berita = Berita::create($data);

        return response()->json([
            'success' => true,
            'message' => 'Draf berita berhasil dibuat dan menunggu persetujuan Panitia.',
            'data' => $berita
        ], 201);
    }

    // PANITIA MENYETUJUI BERITA (Approval Logic)
    public function approve($id)
    {
        $berita = Berita::findOrFail($id);

        // Pastikan hanya panitia/developer yang bisa hit fungsi ini (sudah dijaga oleh Middleware di routes, tapi kita double check)
        if (Auth::user()->role === 'remaja') {
            return response()->json(['message' => 'Anda tidak memiliki izin'], 403);
        }

        $berita->update([
            'status' => 'dipublikasi',
            'disetujui_oleh' => Auth::id(), // Catat siapa panitia yang ACC
            'published_at' => now()
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Berita berhasil dipublikasikan ke Landing Page!'
        ]);
    }

    public function update(Request $request, $id)
    {
        $berita = \App\Models\Berita::findOrFail($id);
        $berita->update($request->except('thumbnail'));
        
        if ($request->hasFile('thumbnail')) {
            $berita->thumbnail = $request->file('thumbnail')->store('berita_thumbnail', 'public');
            $berita->save();
        }
        return response()->json(['success' => true, 'message' => 'Berita diperbarui']);
    }

    public function destroy($id)
    {
        \App\Models\Berita::destroy($id);
        return response()->json(['success' => true, 'message' => 'Berita dihapus']);
    }
}
