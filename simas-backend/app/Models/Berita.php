<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Berita extends Model
{
    protected $table = 'berita';
    
    protected $fillable = [
        'penulis_id', 'disetujui_oleh', 'judul', 'slug', 
        'konten', 'thumbnail', 'link_youtube', 'status', 'published_at'
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
