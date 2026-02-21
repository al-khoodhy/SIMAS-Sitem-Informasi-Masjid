<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Berita;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str; // PENTING UNTUK SLUG

class BeritaController extends Controller
{
    public function index(Request $request)
    {
        $user = Auth::user();
        
        // Optimasi Relasi: Hanya ambil id dan name untuk menghemat payload JSON
        $query = \App\Models\Berita::with(['penulis:id,name', 'penyetuju:id,name'])->latest();

        // 1. Filter Role (Remaja hanya lihat miliknya)
        if ($user->role === 'remaja') {
            $query->where('penulis_id', $user->id);
        }

        // 2. SERVER-SIDE FILTER: Berdasarkan Status (Dari Tab React)
        if ($request->filled('status') && $request->status !== 'semua') {
            $query->where('status', $request->status);
        }

        // 3. SERVER-SIDE SEARCH: Cari berdasarkan Judul atau Isi Konten
        if ($request->filled('search')) {
            $query->where(function($q) use ($request) {
                $q->where('judul', 'like', '%' . $request->search . '%')
                  ->orWhere('konten', 'like', '%' . $request->search . '%');
            });
        }

        // 4. SERVER-SIDE PAGINATION: Ambil 9 data per halaman (Pas untuk grid 3 kolom)
        $berita = $query->paginate(9);

        return response()->json([
            'success' => true,
            'data' => $berita->items(), // Hanya 9 data
            'pagination' => [           // Info halaman untuk React
                'current_page' => $berita->currentPage(),
                'last_page' => $berita->lastPage(),
                'total' => $berita->total()
            ]
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'judul' => 'required|string|max:255',
            'konten' => 'required|string',
            'thumbnail' => 'nullable|image|mimes:jpeg,png,jpg|max:2048',
            'status' => 'required|in:draft,menunggu_persetujuan,dipublikasi,ditolak',
            'link_youtube' => 'nullable|url'
        ]);

        $data = $request->all();
        
        // 1. OTOMATIS AMBIL ID PENULIS (User yang sedang login)
        $data['penulis_id'] = auth()->id();

        // 2. OTOMATIS BUAT SLUG DARI JUDUL (Mencegah Error 1364)
        $data['slug'] = Str::slug($request->judul) . '-' . time();

        if ($request->hasFile('thumbnail')) {
            $data['thumbnail'] = $request->file('thumbnail')->store('berita_thumbnails', 'public');
        }

        $berita = Berita::create($data);

        // Load relasi penulis
        $berita->load('penulis:id,name');

        return response()->json([
            'success' => true, 
            'message' => 'Berita berhasil ditambahkan',
            'data' => $berita
        ], 201);
    }

    // PANITIA MENYETUJUI BERITA
    public function approve($id)
    {
        $berita = Berita::findOrFail($id);

        if (Auth::user()->role === 'remaja') {
            return response()->json(['message' => 'Anda tidak memiliki izin'], 403);
        }

        $berita->update([
            'status' => 'dipublikasi',
            'disetujui_oleh' => Auth::id(), 
            'published_at' => now()
        ]);

        return response()->json(['success' => true, 'message' => 'Berita berhasil dipublikasikan!']);
    }

    // PANITIA MENOLAK BERITA (FITUR BARU)
    public function reject($id)
    {
        $berita = Berita::findOrFail($id);

        if (Auth::user()->role === 'remaja') {
            return response()->json(['message' => 'Anda tidak memiliki izin'], 403);
        }

        $berita->update([
            'status' => 'ditolak',
            'disetujui_oleh' => Auth::id() // Catat siapa yang menolak
        ]);

        return response()->json(['success' => true, 'message' => 'Berita telah ditolak dan dikembalikan ke penulis.']);
    }

    public function update(Request $request, $id)
    {
        $berita = Berita::findOrFail($id);
        
        $data = $request->except('thumbnail');
        
        // Update slug jika judul berubah
        if ($request->has('judul')) {
            $data['slug'] = Str::slug($request->judul) . '-' . time();
        }

        // Jika Remaja mengedit berita yang ditolak, statusnya otomatis kembali menjadi 'menunggu_persetujuan'
        if (Auth::user()->role === 'remaja' && $berita->status === 'ditolak') {
            $data['status'] = 'menunggu_persetujuan';
        }

        $berita->update($data);
        
        if ($request->hasFile('thumbnail')) {
            $berita->thumbnail = $request->file('thumbnail')->store('berita_thumbnails', 'public');
            $berita->save();
        }

        return response()->json(['success' => true, 'message' => 'Berita berhasil diperbarui']);
    }

    public function destroy($id)
    {
        Berita::destroy($id);
        return response()->json(['success' => true, 'message' => 'Berita dihapus']);
    }
}