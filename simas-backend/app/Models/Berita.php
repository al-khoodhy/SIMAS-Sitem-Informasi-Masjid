<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Berita extends Model
{
    protected $table = 'berita';
    
    // TAMBAHKAN 'slug', 'disetujui_oleh', dan 'published_at' DI SINI
    protected $fillable = [
        'judul', 
        'slug',           // <--- Wajib ditambahkan
        'konten', 
        'thumbnail', 
        'link_youtube', 
        'penulis_id', 
        'status', 
        'views',
        'disetujui_oleh', // <--- Wajib untuk fitur Approve/Reject Panitia
        'published_at'    // <--- Wajib untuk mencatat kapan tayang
    ];

    // Relasi ke User yang menulis (Remaja)
    public function penulis()
    {
        return $this->belongsTo(User::class, 'penulis_id');
    }

    // Relasi ke User yang menyetujui (Panitia)
    public function penyetuju()
    {
        return $this->belongsTo(User::class, 'disetujui_oleh');
    }
}