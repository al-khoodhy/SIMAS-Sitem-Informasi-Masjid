<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class JadwalKegiatan extends Model
{
    protected $table = 'jadwal_kegiatan';
    protected $fillable = [
        'nama_kegiatan', 'deskripsi', 'waktu_mulai', 
        'penceramah', 'jenis', 'tampil_di_countdown'
    ];
}