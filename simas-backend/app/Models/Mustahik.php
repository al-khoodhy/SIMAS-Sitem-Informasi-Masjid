<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Mustahik extends Model
{
    protected $table = 'mustahik';
    
    protected $fillable = [
        'nama_lengkap', 'nik', 'rt', 'alamat', 'kategori', 'status_aktif'
    ];

    // Relasi: 1 Mustahik bisa menerima zakat BERKALI-KALI (hasMany)
    public function riwayatPenyaluran()
    {
        return $this->hasMany(PenyaluranZakat::class, 'mustahik_id');
    }
}
