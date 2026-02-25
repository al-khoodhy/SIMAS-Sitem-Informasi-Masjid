<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;
use Symfony\Component\Process\Process;
use Symfony\Component\Process\Exception\ProcessFailedException;
use App\Models\BackupSchedule;

class BackupController extends Controller
{
    // 1. Ambil daftar semua tabel di database
    public function getTables()
    {
        $tables = array_map('current', DB::select('SHOW TABLES'));
        return response()->json(['success' => true, 'data' => $tables]);
    }

    // 2. Eksekusi Backup Manual
    public function manualBackup(Request $request)
    {
        $request->validate(['tables' => 'nullable|array']);
        
        $tables = $request->tables; // Jika kosong, backup semua
        $filename = 'backup_' . date('Y-m-d_H-i-s') . '.sql';
        $path = storage_path('app/public/backups');

        if (!File::exists($path)) { File::makeDirectory($path, 0755, true); }

        $this->runMysqlDump($tables, $path . '/' . $filename);

        return response()->json(['success' => true, 'message' => 'Backup berhasil dibuat!', 'filename' => $filename]);
    }

    // 3. Manajemen File Backup (Daftar, Hapus, Download)
    public function listBackups()
    {
        $path = storage_path('app/public/backups');
        $files = [];
        
        if (File::exists($path)) {
            foreach (File::files($path) as $file) {
                $files[] = [
                    'name' => $file->getFilename(),
                    'size' => number_format($file->getSize() / 1048576, 2) . ' MB',
                    'time' => date("Y-m-d H:i:s", $file->getMTime())
                ];
            }
        }
        
        // Urutkan dari yang terbaru
        usort($files, function($a, $b) { return strtotime($b['time']) - strtotime($a['time']); });

        return response()->json(['success' => true, 'data' => $files]);
    }

    public function downloadBackup($filename)
    {
        $path = storage_path('app/public/backups/' . $filename);
        if (!File::exists($path)) return response()->json(['message' => 'File tidak ditemukan'], 404);
        return response()->download($path);
    }

    public function deleteBackup($filename)
    {
        $path = storage_path('app/public/backups/' . $filename);
        if (File::exists($path)) File::delete($path);
        return response()->json(['success' => true, 'message' => 'Backup dihapus.']);
    }

    // 4. Pengaturan Jadwal Otomatis
    public function getSchedule()
    {
        $schedule = BackupSchedule::first();
        return response()->json(['success' => true, 'data' => $schedule]);
    }

    public function saveSchedule(Request $request)
    {
        $data = $request->only(['tables', 'frequency', 'time', 'is_active']);
        $schedule = BackupSchedule::first();
        
        if ($schedule) {
            $schedule->update($data);
        } else {
            BackupSchedule::create($data);
        }
        return response()->json(['success' => true, 'message' => 'Jadwal Auto Backup disimpan.']);
    }

    // --- FUNGSI INTI: MENJALANKAN MYSQLDUMP ---
    private function runMysqlDump($tables, $filepath)
    {
        $db = config('database.connections.mysql.database');
        $user = config('database.connections.mysql.username');
        $pass = config('database.connections.mysql.password');
        $host = config('database.connections.mysql.host');

        $tableStr = empty($tables) ? '' : implode(' ', $tables);
        
        // Gunakan mysqldump (Pastikan mysqldump tersedia di environment server/XAMPP Anda)
        $command = "mysqldump --user={$user} --password={$pass} --host={$host} {$db} {$tableStr} > {$filepath}";
        
        // Eksekusi Command
        $process = Process::fromShellCommandline($command);
        $process->setTimeout(300); // 5 Menit max
        $process->run();

        if (!$process->isSuccessful()) {
            throw new ProcessFailedException($process);
        }
    }
}