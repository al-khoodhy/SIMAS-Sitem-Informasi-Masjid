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
        Schema::create('transaksi_keuangan', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users'); // Siapa bendahara yang input
            $table->foreignId('kategori_id')->constrained('kategori_keuangan');
            $table->foreignId('campaign_id')->nullable()->constrained('campaign_donasi'); // Jika donasi masuk ke target tertentu
            $table->enum('tipe', ['masuk', 'keluar']);
            $table->decimal('nominal', 15, 2);
            $table->string('keterangan');
            $table->date('tanggal_transaksi');
            $table->string('bukti_foto')->nullable(); // Struk/bukti transfer
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
