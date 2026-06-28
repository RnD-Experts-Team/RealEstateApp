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
        Schema::create('inspection_form_sections', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('inspection_form_id');
            $table->string('name');
            $table->string('question')->nullable();
            $table->boolean('is_repeatable')->default(false);
            $table->string('instance_label')->nullable();
            $table->boolean('has_problems')->nullable();
            $table->text('note')->nullable();
            $table->integer('sort_order')->default(0);
            $table->timestamps();

            $table->foreign('inspection_form_id')
                ->references('id')
                ->on('inspection_forms')
                ->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('inspection_form_sections');
    }
};
