<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('campaign_donasi', function (Blueprint $table) {
            $table->id();
            $table->string('judul'); // Contoh: "Wakaf Pengadaan HP"
            $table->text('deskripsi');
            $table->decimal('target_nominal', 15, 2);
            $table->decimal('terkumpul_nominal', 15, 2)->default(0);
            $table->enum('status', ['aktif', 'terpenuhi', 'ditutup'])->default('aktif');
            $table->date('tanggal_selesai')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        //
    }
};
