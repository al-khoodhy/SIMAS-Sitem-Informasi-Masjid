<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\KeuanganController;
use App\Http\Controllers\Api\BeritaController;
use App\Http\Controllers\Api\MustahikController;
use App\Http\Controllers\Api\InventarisController;
use App\Http\Controllers\Api\ZakatController;
// Nanti tambahkan Controller lain di sini (KeuanganController, BeritaController, dll)

/*
|--------------------------------------------------------------------------
| Rute Publik (Tanpa perlu login)
|--------------------------------------------------------------------------
*/
Route::get('/public/landing', [\App\Http\Controllers\Api\LandingController::class, 'index']);
Route::get('/public/berita/{id}', [\App\Http\Controllers\Api\LandingController::class, 'newsDetail']);
Route::get('/public/agenda', [\App\Http\Controllers\Api\LandingController::class, 'allAgenda']);
Route::post('/login', [AuthController::class, 'login']);
Route::get('/public/berita-semua', [\App\Http\Controllers\Api\LandingController::class, 'allBerita']);
Route::get('/berita-publik', function() {
    // Contoh rute untuk Landing Page mengambil data berita
    return App\Models\Berita::where('status', 'dipublikasi')->get();
});


/*
|--------------------------------------------------------------------------
| Rute Terproteksi (Wajib Login bawa Token)
|--------------------------------------------------------------------------
*/
Route::middleware('auth:sanctum')->group(function () {
    
    // Rute Umum untuk semua yang sudah login
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);

    // 👑 KHUSUS DEVELOPER
    Route::middleware('role:developer')->group(function () {
        Route::apiResource('/users', \App\Http\Controllers\Api\UserController::class);
        // Keuangan
    Route::put('/keuangan/{id}', [\App\Http\Controllers\Api\KeuanganController::class, 'update']);
    Route::delete('/keuangan/{id}', [\App\Http\Controllers\Api\KeuanganController::class, 'destroy']);

    // Berita
    Route::put('/berita/{id}', [\App\Http\Controllers\Api\BeritaController::class, 'update']);
    Route::delete('/berita/{id}', [\App\Http\Controllers\Api\BeritaController::class, 'destroy']);

    // Penyaluran Zakat
    Route::put('/penyaluran-zakat/{id}', [\App\Http\Controllers\Api\ZakatController::class, 'updatePenyaluran']);
    Route::delete('/penyaluran-zakat/{id}', [\App\Http\Controllers\Api\ZakatController::class, 'destroyPenyaluran']);
        // Contoh: Route::get('/system-logs', [SystemController::class, 'logs']);
    });




    // 👳‍♂️ KHUSUS PANITIA & DEVELOPER (Manajemen Keuangan & Zakat)
    Route::middleware('role:panitia,developer')->group(function () {
        Route::get('/dashboard-stats', [\App\Http\Controllers\Api\DashboardController::class, 'getStats']);

        Route::apiResource('/agenda', \App\Http\Controllers\Api\AgendaController::class);
        Route::post('/agenda/mass-destroy', [\App\Http\Controllers\Api\AgendaController::class, 'massDestroy']);
        
        // Rute Keuangan
        Route::post('/keuangan/pemasukan', [KeuanganController::class, 'storePemasukan']);
        Route::post('/keuangan/pengeluaran', [KeuanganController::class, 'storePengeluaran']);
        // 1. Rute untuk Ringkasan Dasbor (Chart/Angka Besar)
        Route::get('/summary', [KeuanganController::class, 'summary']);

        // 2. Rute untuk Tabel dan Tambah Transaksi Keuangan
        Route::get('/keuangan/export-pdf', [\App\Http\Controllers\Api\KeuanganController::class, 'exportPdf']);
        Route::get('/keuangan', [KeuanganController::class, 'index']);
        Route::post('/keuangan', [KeuanganController::class, 'store']);
        
        // Rute Approval Berita
        Route::post('/berita/{id}/approve', [BeritaController::class, 'approve']);
        
        // Rute Mustahik
        Route::apiResource('/mustahik', MustahikController::class);
        Route::get('/mustahik', [MustahikController::class, 'index']);
        Route::post('/mustahik', [MustahikController::class, 'store']);
        Route::post('/mustahik/mass-destroy', [MustahikController::class, 'massDestroy']);

        Route::apiResource('/kategori-keuangan', \App\Http\Controllers\Api\KategoriKeuanganController::class);
        Route::apiResource('/campaign-donasi', \App\Http\Controllers\Api\CampaignDonasiController::class);
       

        Route::get('/zakat/summary', [\App\Http\Controllers\Api\ZakatController::class, 'summaryTahunan']);
        Route::get('/zakat/export-pdf', [\App\Http\Controllers\Api\ZakatController::class, 'exportPdf']);

        Route::post('/penyaluran-zakat', [\App\Http\Controllers\Api\ZakatController::class, 'storePenyaluran']);
        Route::post('/penyaluran-zakat/mass-destroy', [\App\Http\Controllers\Api\ZakatController::class, 'massDestroyPenyaluran']);
        Route::post('/penyaluran-zakat/mass-update', [\App\Http\Controllers\Api\ZakatController::class, 'massUpdatePenyaluran']);

    });

    // 🧑‍🎓 KHUSUS REMAJA, PANITIA, & DEVELOPER (Berita & Inventaris)
    Route::middleware('role:remaja,panitia,developer')->group(function () {

        Route::put('/profile', [\App\Http\Controllers\Api\UserController::class, 'updateProfile']);
        // Rute Berita (Remaja hanya bisa submit draft)
        Route::post('/berita', [BeritaController::class, 'store']);
        Route::put('/berita/{id}', [BeritaController::class, 'update']);
        
        Route::get('/berita', [BeritaController::class, 'index']);
        Route::post('/berita', [BeritaController::class, 'store']);
        // Rute Inventaris
        Route::apiResource('/inventaris', InventarisController::class);

        Route::get('/penyaluran-zakat', [\App\Http\Controllers\Api\ZakatController::class, 'indexPenyaluran']);
        Route::post('/penyaluran-zakat/{id}/konfirmasi', [\App\Http\Controllers\Api\ZakatController::class, 'konfirmasiPenyaluran']);
        
    });

});