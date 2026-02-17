<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Akun Developer
        User::create([
            'name' => 'Super Developer',
            'email' => 'dev@masjid.com',
            'phone' => '08111111111',
            'password' => Hash::make('rahasia123'),
            'role' => 'developer',
        ]);

        // 2. Akun Panitia (Bendahara/Takmir)
        User::create([
            'name' => 'Haji Budi (Bendahara)',
            'email' => 'panitia@masjid.com',
            'phone' => '08222222222',
            'password' => Hash::make('rahasia123'),
            'role' => 'panitia',
        ]);

        // 3. Akun Remaja Masjid
        User::create([
            'name' => 'Ahmad (Remaja)',
            'email' => 'remaja@masjid.com',
            'phone' => '08333333333',
            'password' => Hash::make('rahasia123'),
            'role' => 'remaja',
        ]);
        
        // (Opsional) Menambahkan dummy kategori keuangan agar tidak error
        \App\Models\KategoriKeuangan::create(['nama_kategori' => 'Infaq Kotak Jumat', 'jenis' => 'pemasukan']);
        \App\Models\KategoriKeuangan::create(['nama_kategori' => 'Bayar Listrik', 'jenis' => 'pengeluaran']);
    }
}