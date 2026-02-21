<?php

namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class Buku extends Model
{
    protected $table = 'buku';
    protected $fillable = ['judul', 'kategori', 'penulis', 'cover_image', 'link_gdrive'];
}