<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PenyaluranZakat extends Model
{
    protected $table = 'penyaluran_zakat';
    
    protected $fillable = [
        'mustahik_id', 'jenis_zakat', 'transaksi_id', 'nominal_uang', 
        'bentuk_barang', 'tanggal_penyaluran', 'foto_dokumentasi', 'status'
    ];

    public function mustahik()
    {
        return $this->belongsTo(Mustahik::class, 'mustahik_id');
    }

    public function transaksiKeuangan()
    {
        return $this->belongsTo(TransaksiKeuangan::class, 'transaksi_id');
    }
}
