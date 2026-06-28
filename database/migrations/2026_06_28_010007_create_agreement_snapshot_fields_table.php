<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('agreement_snapshot_fields', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('agreement_id');
            $table->string('key');
            $table->string('label');
            $table->enum('input_type', ['text', 'long_text', 'date', 'number'])->default('text');
            $table->enum('scope', ['per_type', 'per_agreement'])->default('per_agreement');
            $table->text('value')->nullable();
            $table->boolean('required')->default(false);
            $table->integer('sort_order')->default(0);
            $table->timestamps();

            $table->foreign('agreement_id', 'asf_agreement_fk')
                ->references('id')->on('agreements')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('agreement_snapshot_fields');
    }
};
