<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up()
    {
        Schema::table('agendas', function (Blueprint $table) {
            $table->dateTime('waktu_selesai')->nullable()->after('waktu_pelaksanaan');
        });
    }

    public function down()
    {
        Schema::table('agendas', function (Blueprint $table) {
            $table->dropColumn('waktu_selesai');
        });
    }
};