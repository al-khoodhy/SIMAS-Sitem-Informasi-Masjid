<?php

namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class BackupSchedule extends Model
{
    protected $fillable = ['tables', 'frequency', 'time', 'is_active'];
    protected $casts = ['tables' => 'array', 'is_active' => 'boolean'];
}
