<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('donasi', function (Blueprint $table) {
            $table->id();
            // Relasi ke tabel campaign_donasi
            $table->foreignId('campaign_id')->nullable()->constrained('campaign_donasi')->onDelete('set null');
            
            $table->string('nama_donatur')->nullable();
            $table->decimal('nominal', 15, 2);
            $table->text('pesan')->nullable();
            $table->string('bukti_transfer');
            
            $table->enum('status', ['menunggu', 'disetujui', 'ditolak'])->default('menunggu');
            $table->foreignId('diverifikasi_oleh')->nullable()->constrained('users')->onDelete('set null');
            
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('donasi');
    }
};