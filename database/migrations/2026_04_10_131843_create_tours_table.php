<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('tours', function (Blueprint $table) {
            $table->id();

            // foreign keys
            $table->foreignId('unit_id')->constrained()->cascadeOnDelete();
            $table->foreignId('representative_id')->constrained('representatives')->cascadeOnDelete();

            // fields
            $table->string('prospect');
            $table->string('phone', 20);
            $table->string('email')->nullable();
            $table->date('date');
            $table->time('time');
            $table->text('note')->nullable();

            $table->boolean('is_hidden')->default(false);

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tours');
    }
};