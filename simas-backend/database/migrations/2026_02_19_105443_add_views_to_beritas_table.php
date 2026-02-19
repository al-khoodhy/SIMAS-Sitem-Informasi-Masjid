<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up()
    {
        Schema::table('berita', function (Blueprint $table) {
            // Tambahkan kolom views dengan default 0
            $table->unsignedBigInteger('views')->default(0)->after('status');
        });
    }

    public function down()
    {
        Schema::table('berita', function (Blueprint $table) {
            $table->dropColumn('views');
        });
    }
};