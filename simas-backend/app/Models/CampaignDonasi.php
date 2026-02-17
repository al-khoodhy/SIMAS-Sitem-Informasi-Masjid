<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CampaignDonasi extends Model
{
    protected $table = 'campaign_donasi';
    
    protected $fillable = [
        'judul', 'deskripsi', 'target_nominal', 'terkumpul_nominal', 'status', 'tanggal_selesai'
    ];

    // Relasi: 1 Campaign memiliki BANYAK Transaksi (Donasi masuk)
    public function transaksi()
    {
        return $this->hasMany(TransaksiKeuangan::class, 'campaign_id');
    }
}
