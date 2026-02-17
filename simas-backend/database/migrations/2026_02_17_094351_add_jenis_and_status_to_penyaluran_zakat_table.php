<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up()
    {
        Schema::table('penyaluran_zakat', function (Blueprint $table) {
            $table->enum('jenis_zakat', ['fitrah', 'mal'])->default('fitrah')->after('mustahik_id');
            $table->enum('status', ['menunggu', 'disalurkan'])->default('menunggu')->after('foto_dokumentasi');
        });
    }

    public function down()
    {
        Schema::table('penyaluran_zakat', function (Blueprint $table) {
            $table->dropColumn(['jenis_zakat', 'status']);
        });
    }
};