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
        Schema::create('inspection_form_attachments', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('inspection_form_id');
            $table->unsignedBigInteger('inspection_form_section_id')->nullable();
            $table->unsignedBigInteger('inspection_form_section_item_id')->nullable();
            $table->enum('kind', ['section', 'item', 'general', 'video'])->default('general');
            $table->string('file_name');
            $table->string('file_path');
            $table->timestamps();

            $table->foreign('inspection_form_id', 'ifa_form_id_fk')
                ->references('id')
                ->on('inspection_forms')
                ->onDelete('cascade');

            $table->foreign('inspection_form_section_id', 'ifa_section_id_fk')
                ->references('id')
                ->on('inspection_form_sections')
                ->onDelete('cascade');

            $table->foreign('inspection_form_section_item_id', 'ifa_item_id_fk')
                ->references('id')
                ->on('inspection_form_section_items')
                ->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('inspection_form_attachments');
    }
};
