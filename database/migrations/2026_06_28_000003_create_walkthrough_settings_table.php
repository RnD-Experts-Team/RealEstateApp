<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('walkthrough_settings', function (Blueprint $table) {
            $table->id();
            $table->enum('form_kind', ['walkthrough', 'safety_inspection'])->unique();
            $table->boolean('require_signature')->default(false);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('walkthrough_settings');
    }
};
