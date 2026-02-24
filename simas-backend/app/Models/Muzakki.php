<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Muzakki extends Model
{
     protected $table = 'muzakki';
     protected $fillable = ['nama_muzakki', 'jenis_zakat', 'bentuk_pembayaran', 'nominal_uang', 'berat_beras_kg', 'tahun'];
}
