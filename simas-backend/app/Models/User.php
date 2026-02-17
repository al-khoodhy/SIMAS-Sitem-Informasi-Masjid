<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, Notifiable;

    protected $fillable = [
        'name', 'email', 'phone', 'password', 'role',
    ];

    protected $hidden = [
        'password', 'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    public function transaksiKeuangan()
    {
        return $this->hasMany(TransaksiKeuangan::class, 'user_id');
    }

    public function beritaDitulis()
    {
        return $this->hasMany(Berita::class, 'penulis_id');
    }

    public function beritaDisetujui()
    {
        return $this->hasMany(Berita::class, 'disetujui_oleh');
    }
}