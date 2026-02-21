<?php

namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class Donasi extends Model
{
    protected $table = 'donasi';
    protected $fillable = ['campaign_id', 'nama_donatur', 'nominal', 'pesan', 'bukti_transfer', 'status', 'diverifikasi_oleh'];

    public function campaign() {
        return $this->belongsTo(CampaignDonasi::class, 'campaign_id');
    }
    public function verifikator() {
        return $this->belongsTo(User::class, 'diverifikasi_oleh');
    }
}