<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Visitor extends Model
{
    use HasFactory;

    // Baris ini SANGAT PENTING agar terhindar dari Error 500 (Mass Assignment)
    protected $fillable = ['date', 'hits'];
}