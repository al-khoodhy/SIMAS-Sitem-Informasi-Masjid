<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TransaksiKeuangan extends Model
{
    protected $table = 'transaksi_keuangan';
    
    protected $fillable = [
        'user_id', 'kategori_id', 'campaign_id', 'tipe', 
        'nominal', 'keterangan', 'tanggal_transaksi', 'bukti_foto'
    ];

    // Relasi Balik (BelongsTo): Transaksi ini MILIK siapa/kategori apa?
    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function kategori()
    {
        return $this->belongsTo(KategoriKeuangan::class, 'kategori_id');
    }

    public function campaign()
    {
        return $this->belongsTo(CampaignDonasi::class, 'campaign_id');
    }

    // Jika transaksi ini adalah pengeluaran untuk zakat
    public function penyaluranZakat()
    {
        return $this->hasOne(PenyaluranZakat::class, 'transaksi_id');
    }
}
