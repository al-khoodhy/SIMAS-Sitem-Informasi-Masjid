<?php
namespace App\Http\Controllers\Api;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Gallery;
use Illuminate\Support\Facades\Storage;

class GalleryController extends Controller
{
    // PUBLIK: Ambil semua data urut slot
    public function index()
    {
        return response()->json(['success' => true, 'data' => Gallery::orderBy('slot_number')->get()]);
    }

    // ADMIN: Update Gambar & Judul
    public function update(Request $request, $id)
    {
        $gallery = Gallery::findOrFail($id);
        
        $request->validate([
            'title' => 'required|string|max:100',
            'category' => 'nullable|string|max:50',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:2048'
        ]);

        $gallery->title = $request->title;
        $gallery->category = $request->category;

        if ($request->hasFile('image')) {
            // Hapus gambar lama jika bukan link external
            if ($gallery->image_url && !filter_var($gallery->image_url, FILTER_VALIDATE_URL)) {
                Storage::disk('public')->delete($gallery->image_url);
            }
            $path = $request->file('image')->store('gallery', 'public');
            $gallery->image_url = $path;
        }

        $gallery->save();
        return response()->json(['success' => true, 'message' => 'Slot galeri berhasil diperbarui']);
    }
}