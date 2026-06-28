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
        Schema::create('inspection_sections', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('question')->nullable();
            $table->boolean('is_repeatable')->default(false);
            $table->integer('sort_order')->default(0);
            $table->boolean('is_archived')->default(false);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('inspection_sections');
    }
};
