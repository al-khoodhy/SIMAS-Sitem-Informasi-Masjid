<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\UserController; // TAMBAHAN IMPORT
use App\Http\Controllers\Api\KeuanganController;
use App\Http\Controllers\Api\BeritaController;
use App\Http\Controllers\Api\MustahikController;
use App\Http\Controllers\Api\InventarisController;
use App\Http\Controllers\Api\ZakatController;
use App\Http\Controllers\Api\DonasiController;
use App\Http\Controllers\Api\LandingController;
use App\Http\Controllers\Api\AgendaController;
use App\Http\Controllers\Api\KategoriKeuanganController;
use App\Http\Controllers\Api\CampaignDonasiController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\TransaksiKeuanganController;

/*
|--------------------------------------------------------------------------
| Rute Publik (Tanpa perlu login)
|--------------------------------------------------------------------------
*/
Route::get('/public/buku', [\App\Http\Controllers\Api\BukuController::class, 'indexPublic']);
Route::get('/public/buku/filters', [\App\Http\Controllers\Api\BukuController::class, 'getFilters']);
Route::get('/public/landing', [LandingController::class, 'index']);
Route::get('/public/berita/{id}', [LandingController::class, 'newsDetail']);
Route::get('/public/berita-semua', [LandingController::class, 'allBerita']);
Route::get('/public/agenda', [LandingController::class, 'allAgenda']);
Route::post('/public/donasi', [DonasiController::class, 'submitPublic']);
Route::post('/login', [AuthController::class, 'login']);


/*
|--------------------------------------------------------------------------
| Rute Terproteksi (Wajib Login bawa Token)
|--------------------------------------------------------------------------
*/
Route::middleware('auth:sanctum')->group(function () {
    
    // 1. Rute Umum (Bisa diakses SIAPA SAJA yang sudah login)
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);
    Route::put('/profile', [UserController::class, 'updateProfile']);
    Route::get('/dashboard-stats', [DashboardController::class, 'getStats']); // Dasbor untuk semua role
    Route::post('/save-push-token', function (Illuminate\Http\Request $request) {
        $user = auth()->user();
        $user->update(['expo_push_token' => $request->token]);
        return response()->json(['success' => true]);
    });
    
    Route::get('/donasi/pending-count', function () {
        $count = \App\Models\Donasi::where('status', 'menunggu')->count();
        return response()->json(['success' => true, 'count' => $count]);
    });
    // ------------------------------------------------------------------------
    // 2. KHUSUS REMAJA, PANITIA, & DEVELOPER
    // ------------------------------------------------------------------------
    Route::middleware('role:remaja,panitia,developer')->group(function () {
        
        // Inventaris
        Route::apiResource('/inventaris', InventarisController::class);
        
        // Berita (Akses Dasar: Index, Store, Update, Destroy)
        Route::apiResource('/berita', BeritaController::class);

        // Penyaluran Zakat (Hanya melihat dan konfirmasi penerimaan)
        Route::get('/penyaluran-zakat', [ZakatController::class, 'indexPenyaluran']);
        Route::post('/penyaluran-zakat/{id}/konfirmasi', [ZakatController::class, 'konfirmasiPenyaluran']);
    });


    // ------------------------------------------------------------------------
    // 3. KHUSUS PANITIA & DEVELOPER (Level Manajemen)
    // ------------------------------------------------------------------------
    Route::middleware('role:panitia,developer')->group(function () {
        
        // Berita (Approval Redaksi) -> Harus diletakkan di luar jangkauan Remaja
        Route::post('/berita/{id}/approve', [BeritaController::class, 'approve']);
        Route::post('/berita/{id}/reject', [BeritaController::class, 'reject']);

        // Agenda (Custom rute harus di atas apiResource)
        Route::post('/agenda/mass-destroy', [AgendaController::class, 'massDestroy']);
        Route::apiResource('/agenda', AgendaController::class);
        
        // Transaksi Keuangan
        Route::get('/summary', [KeuanganController::class, 'summary']);
        Route::get('/keuangan/export-pdf', [KeuanganController::class, 'exportPdf']);
        Route::apiResource('/keuangan', TransaksiKeuanganController::class); 
        
        // Mustahik
        Route::post('/mustahik/mass-destroy', [MustahikController::class, 'massDestroy']);
        Route::apiResource('/mustahik', MustahikController::class);

        // Master Data Kategori & Campaign Donasi
        Route::apiResource('/kategori-keuangan', KategoriKeuanganController::class);
        Route::apiResource('/campaign-donasi', CampaignDonasiController::class);
       
        // Manajemen Zakat
        Route::get('/zakat/summary', [ZakatController::class, 'summaryTahunan']);
        Route::get('/zakat/export-pdf', [ZakatController::class, 'exportPdf']);
        Route::post('/penyaluran-zakat/mass-destroy', [ZakatController::class, 'massDestroyPenyaluran']);
        Route::post('/penyaluran-zakat/mass-update', [ZakatController::class, 'massUpdatePenyaluran']);
        Route::post('/penyaluran-zakat', [ZakatController::class, 'storePenyaluran']);
        Route::put('/penyaluran-zakat/{id}', [ZakatController::class, 'updatePenyaluran']);
        Route::delete('/penyaluran-zakat/{id}', [ZakatController::class, 'destroyPenyaluran']);
        Route::get('/penyaluran-zakat', [\App\Http\Controllers\Api\ZakatController::class, 'indexPenyaluran']);
        Route::post('/penyaluran-zakat/{id}/konfirmasi', [\App\Http\Controllers\Api\ZakatController::class, 'konfirmasiPenyaluran']);
        
        // Verifikasi Donasi / Crowdfunding
        Route::get('/donasi', [DonasiController::class, 'index']);
        Route::post('/donasi/{id}/approve', [DonasiController::class, 'approve']);
        Route::post('/donasi/{id}/reject', [DonasiController::class, 'reject']);
        Route::put('/donasi/{id}', [DonasiController::class, 'update']);

        // Tambah Buku
        Route::apiResource('/buku', \App\Http\Controllers\Api\BukuController::class);
    });


    // ------------------------------------------------------------------------
    // 4. KHUSUS DEVELOPER (Super Admin)
    // ------------------------------------------------------------------------
    Route::middleware('role:developer')->group(function () {
        
        // Manajemen Akun Pengurus
        Route::apiResource('/users', UserController::class);
        
        // Catatan: Tidak perlu mendeklarasikan ulang Hapus Keuangan/Berita di sini, 
        // karena rute apiResource di grup 'panitia,developer' sudah mencakup Developer juga.
        // Jika ingin hanya Developer yang bisa hapus, logic-nya diamankan dari Controller, bukan Route.
    });

});