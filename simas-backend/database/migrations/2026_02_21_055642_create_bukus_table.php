<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up()
    {
        Schema::create('buku', function (Blueprint $table) {
            $table->id();
            $table->string('judul');
            $table->string('kategori'); // Cth: Fiqih, Ramadhan, Zakat
            $table->string('penulis');  // Cth: Ustadz Adi Hidayat
            $table->string('cover_image')->nullable();
            $table->string('link_gdrive'); // Link tautan download
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('buku');
    }
};