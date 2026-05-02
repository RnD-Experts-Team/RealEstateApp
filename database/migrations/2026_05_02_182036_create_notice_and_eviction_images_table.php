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
        Schema::create('notice_and_eviction_images', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('notice_and_eviction_id');
            $table->string('file_name');
            $table->string('file_path');
            $table->timestamps();

            $table->foreign('notice_and_eviction_id')
                ->references('id')
                ->on('notice_and_evictions')
                ->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('notice_and_eviction_images');
    }
};
