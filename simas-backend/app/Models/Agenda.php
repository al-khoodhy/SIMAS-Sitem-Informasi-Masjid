<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Agenda extends Model
{
    use HasFactory;

    // Pastikan baris ini ada agar Laravel mengizinkan data disimpan!
    protected $fillable = ['judul', 'deskripsi', 'waktu_pelaksanaan', 'waktu_selesai', 'lokasi'];
}