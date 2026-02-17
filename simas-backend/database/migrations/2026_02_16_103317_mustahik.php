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
        Schema::create('mustahik', function (Blueprint $table) {
            $table->id();
            $table->string('nama_lengkap');
            $table->string('nik')->unique()->nullable();
            $table->string('rt'); // 10, 11, atau 12
            $table->text('alamat');
            $table->enum('kategori', ['fakir', 'miskin', 'mualaf', 'fisabilillah', 'ibnu_sabil', 'gharim', 'riqab', 'amil']);
            $table->boolean('status_aktif')->default(true);
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
