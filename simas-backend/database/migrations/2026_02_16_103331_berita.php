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
        Schema::create('berita', function (Blueprint $table) {
            $table->id();
            $table->foreignId('penulis_id')->constrained('users'); // Pembuat berita
            $table->foreignId('disetujui_oleh')->nullable()->constrained('users'); // Panitia yang acc
            $table->string('judul');
            $table->string('slug')->unique(); // URL ramah SEO (contoh: /berita/kajian-selasa)
            $table->longText('konten');
            $table->string('thumbnail')->nullable();
            $table->string('link_youtube')->nullable(); // Untuk VOD kajian
            $table->enum('status', ['draft', 'menunggu_persetujuan', 'dipublikasi', 'ditolak'])->default('draft');
            $table->timestamp('published_at')->nullable();
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
