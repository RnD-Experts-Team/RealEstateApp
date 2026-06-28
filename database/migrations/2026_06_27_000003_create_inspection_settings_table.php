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
        Schema::create('inspection_settings', function (Blueprint $table) {
            $table->id();
            $table->text('acknowledgment_text')->nullable();
            $table->string('other_comments_label')->nullable();
            $table->boolean('require_video')->default(false);
            $table->boolean('require_signature')->default(false);
            $table->boolean('require_acknowledgment')->default(true);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('inspection_settings');
    }
};
