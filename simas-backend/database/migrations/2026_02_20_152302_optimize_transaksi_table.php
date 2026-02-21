<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up()
    {
        Schema::table('transaksi_keuangan', function (Blueprint $table) {
            $table->index('tanggal_transaksi');
            $table->index('tipe');
        });
    }

    public function down()
    {
        Schema::table('transaksi_keuangan', function (Blueprint $table) {
            $table->dropIndex(['tanggal_transaksi']);
            $table->dropIndex(['tipe']);
        });
    }
};