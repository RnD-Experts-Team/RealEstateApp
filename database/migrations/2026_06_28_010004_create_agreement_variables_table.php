<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('agreement_variables', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('agreement_type_id');
            $table->string('key');
            $table->string('label');
            $table->enum('input_type', ['text', 'long_text', 'date', 'number'])->default('text');
            $table->enum('scope', ['per_type', 'per_agreement'])->default('per_agreement');
            $table->text('value')->nullable();
            $table->boolean('required')->default(false);
            $table->integer('sort_order')->default(0);
            $table->boolean('is_archived')->default(false);
            $table->timestamps();

            $table->foreign('agreement_type_id', 'av_type_fk')
                ->references('id')->on('agreement_types')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('agreement_variables');
    }
};
