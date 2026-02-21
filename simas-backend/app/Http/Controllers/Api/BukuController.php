<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Buku;
use Illuminate\Support\Facades\Storage;

class BukuController extends Controller
{
    // --- AREA PUBLIK (TanPA LOGIN) ---
    
    // 1. Mengambil data buku untuk halaman perpustakaan
    public function indexPublic(Request $request)
    {
        $query = Buku::query();

        // Pencarian (Search)
        if ($request->filled('search')) {
            $query->where('judul', 'like', '%' . $request->search . '%');
        }
        // Filter Kategori
        if ($request->filled('kategori') && $request->kategori !== 'semua') {
            $query->where('kategori', $request->kategori);
        }
        // Filter Penulis
        if ($request->filled('penulis') && $request->penulis !== 'semua') {
            $query->where('penulis', $request->penulis);
        }

        $buku = $query->latest()->paginate(12);

        return response()->json([
            'success' => true,
            'data' => $buku->items(),
            'pagination' => [
                'current_page' => $buku->currentPage(),
                'last_page' => $buku->lastPage(),
                'total' => $buku->total()
            ]
        ]);
    }

    // 2. Mengambil daftar Kategori dan Penulis unik untuk Dropdown Filter
    public function getFilters()
    {
        $kategori = Buku::select('kategori')->distinct()->pluck('kategori');
        $penulis = Buku::select('penulis')->distinct()->pluck('penulis');

        return response()->json([
            'success' => true,
            'data' => [
                'kategori' => $kategori,
                'penulis' => $penulis
            ]
        ]);
    }

    // --- AREA ADMIN (CRUD UNTUK PANITIA & DEV) ---
    
    public function index()
    {
        return response()->json(['success' => true, 'data' => Buku::latest()->get()]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'judul' => 'required|string|max:255',
            'kategori' => 'required|string',
            'penulis' => 'required|string',
            'link_gdrive' => 'required|url',
            'cover_image' => 'nullable|image|mimes:jpeg,png,jpg|max:2048'
        ]);

        $data = $request->all();

        if ($request->hasFile('cover_image')) {
            $data['cover_image'] = $request->file('cover_image')->store('buku_covers', 'public');
        }

        Buku::create($data);
        return response()->json(['success' => true, 'message' => 'Buku berhasil ditambahkan.']);
    }

    public function update(Request $request, $id)
    {
        $buku = Buku::findOrFail($id);
        $data = $request->except('cover_image');

        if ($request->hasFile('cover_image')) {
            $data['cover_image'] = $request->file('cover_image')->store('buku_covers', 'public');
        }

        $buku->update($data);
        return response()->json(['success' => true, 'message' => 'Buku berhasil diperbarui.']);
    }

    public function destroy($id)
    {
        Buku::destroy($id);
        return response()->json(['success' => true, 'message' => 'Buku dihapus.']);
    }
}