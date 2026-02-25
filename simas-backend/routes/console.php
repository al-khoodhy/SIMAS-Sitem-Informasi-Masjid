<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;
use App\Models\BackupSchedule;

Schedule::command('backup:auto')->when(function () {
    $schedule = BackupSchedule::where('is_active', true)->first();
    if (!$schedule) return false;

    // Cek kecocokan waktu
    $now = now();
    $timeMatches = $now->format('H:i') === date('H:i', strtotime($schedule->time));

    if (!$timeMatches) return false;

    if ($schedule->frequency === 'daily') return true;
    if ($schedule->frequency === 'weekly' && $now->isMonday()) return true;
    if ($schedule->frequency === 'monthly' && $now->day === 1) return true;

    return false;
})->everyMinute();

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');
