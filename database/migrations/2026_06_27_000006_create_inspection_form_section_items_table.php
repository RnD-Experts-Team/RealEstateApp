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
        Schema::create('inspection_form_section_items', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('inspection_form_section_id');
            $table->string('name');
            $table->text('note')->nullable();
            $table->integer('sort_order')->default(0);
            $table->timestamps();

            $table->foreign('inspection_form_section_id')
                ->references('id')
                ->on('inspection_form_sections')
                ->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('inspection_form_section_items');
    }
};
