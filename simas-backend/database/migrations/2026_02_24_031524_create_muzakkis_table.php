<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up()
    {
        Schema::create('muzakki', function (Blueprint $table) {
            $table->id();
            $table->string('nama_muzakki');
            $table->enum('jenis_zakat', ['fitrah', 'mal']);
            $table->enum('bentuk_pembayaran', ['uang', 'beras']);
            $table->decimal('nominal_uang', 15, 2)->nullable()->default(0);
            $table->decimal('berat_beras_kg', 8, 2)->nullable()->default(0);
            $table->year('tahun'); // Menyimpan tahun Hijriah atau Masehi
            $table->timestamps();
        });
    }
    public function down() { Schema::dropIfExists('muzakki'); }
};