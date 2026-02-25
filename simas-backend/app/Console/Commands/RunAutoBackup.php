<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\BackupSchedule;
use Illuminate\Support\Facades\File;
use Symfony\Component\Process\Process;

class RunAutoBackup extends Command
{
    protected $signature = 'backup:auto';
    protected $description = 'Menjalankan backup database berdasarkan jadwal custom developer';

    public function handle()
    {
        $schedule = BackupSchedule::where('is_active', true)->first();
        if (!$schedule) return;

        $filename = 'autobackup_' . date('Y-m-d_H-i-s') . '.sql';
        $path = storage_path('app/public/backups');
        if (!File::exists($path)) { File::makeDirectory($path, 0755, true); }

        $tables = empty($schedule->tables) ? '' : implode(' ', $schedule->tables);
        
        $db = config('database.connections.mysql.database');
        $user = config('database.connections.mysql.username');
        $pass = config('database.connections.mysql.password');
        $host = config('database.connections.mysql.host');

        $command = "mysqldump --user={$user} --password={$pass} --host={$host} {$db} {$tables} > {$path}/{$filename}";
        
        $process = Process::fromShellCommandline($command);
        $process->run();

        $this->info("Backup otomatis dieksekusi: {$filename}");
    }
}