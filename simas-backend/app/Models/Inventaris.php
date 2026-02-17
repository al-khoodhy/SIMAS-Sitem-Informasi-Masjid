<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Inventaris extends Model
{
    protected $table = 'inventaris';
    protected $fillable = [
        'kode_barang', 'nama_barang', 'jumlah', 'kondisi', 
        'lokasi_penyimpanan', 'tanggal_perolehan', 'keterangan'
    ];
}
