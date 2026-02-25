<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up()
    {
        Schema::create('backup_schedules', function (Blueprint $table) {
            $table->id();
            $table->json('tables')->nullable(); // Tabel spesifik (null = semua tabel)
            $table->string('frequency')->default('daily'); // daily, weekly, monthly
            $table->string('time')->default('00:00'); // Waktu eksekusi
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    public function down() { Schema::dropIfExists('backup_schedules'); }
};