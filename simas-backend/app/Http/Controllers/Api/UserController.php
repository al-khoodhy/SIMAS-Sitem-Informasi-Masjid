<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;

class UserController extends Controller
{
    // Mengambil semua data pengguna
    public function index()
    {
        $users = User::orderBy('role')->orderBy('name')->get();
        return response()->json(['success' => true, 'data' => $users]);
    }

    // Membuat akun pengguna baru
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'phone' => 'nullable|string|max:20',
            'password' => 'required|string|min:6',
            'role' => 'required|in:developer,panitia,remaja'
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'phone' => $request->phone,
            'password' => Hash::make($request->password), // Enkripsi password
            'role' => $request->role,
        ]);

        return response()->json(['success' => true, 'message' => 'Pengguna berhasil ditambahkan', 'data' => $user], 201);
    }

    // Memperbarui data pengguna
    public function update(Request $request, $id)
    {
        $user = User::findOrFail($id);

        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email,' . $user->id, // Abaikan validasi unik untuk emailnya sendiri
            'phone' => 'nullable|string|max:20',
            'role' => 'required|in:developer,panitia,remaja',
            'password' => 'nullable|string|min:6' // Password opsional saat edit
        ]);

        $user->name = $request->name;
        $user->email = $request->email;
        $user->phone = $request->phone;
        $user->role = $request->role;

        // Jika password diisi, maka update password
        if ($request->filled('password')) {
            $user->password = Hash::make($request->password);
        }

        $user->save();

        return response()->json(['success' => true, 'message' => 'Data pengguna berhasil diperbarui', 'data' => $user]);
    }

    // Menghapus pengguna
    public function destroy($id)
    {
        $user = User::findOrFail($id);

        // PROTEKSI: Developer tidak boleh menghapus dirinya sendiri
        if ($user->id === Auth::id()) {
            return response()->json(['success' => false, 'message' => 'Anda tidak bisa menghapus akun Anda sendiri!'], 400);
        }

        $user->delete();
        return response()->json(['success' => true, 'message' => 'Pengguna berhasil dihapus']);
    }
    // Fungsi Khusus Update Profil Sendiri
    public function updateProfile(Request $request)
    {
        $user = Auth::user(); // Ambil data user yang sedang login

        $request->validate([
            'name' => 'required|string|max:255',
            'password' => 'nullable|string|min:6' // Password opsional
        ]);

        $user->name = $request->name;

        // Jika form password diisi, enkripsi dan simpan password baru
        if ($request->filled('password')) {
            $user->password = Hash::make($request->password);
        }

        $user->save();

        return response()->json([
            'success' => true, 
            'message' => 'Profil berhasil diperbarui', 
            'data' => $user
        ]);
    }
}