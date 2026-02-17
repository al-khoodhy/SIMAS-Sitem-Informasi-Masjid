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
        Schema::create('penyaluran_zakat', function (Blueprint $table) {
            $table->id();
            $table->foreignId('mustahik_id')->constrained('mustahik');
            $table->foreignId('transaksi_id')->nullable()->constrained('transaksi_keuangan'); // Relasi ke kas keluar
            $table->decimal('nominal_uang', 15, 2)->nullable();
            $table->string('bentuk_barang')->nullable(); // Misal: Beras 5Kg
            $table->date('tanggal_penyaluran');
            $table->string('foto_dokumentasi')->nullable();
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
