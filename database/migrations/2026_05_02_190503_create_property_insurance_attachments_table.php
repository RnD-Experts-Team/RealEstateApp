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
        Schema::create('property_insurance_attachments', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('property_info_id');
            $table->string('file_name');
            $table->string('file_path');
            $table->timestamps();

            $table->foreign('property_info_id')
                ->references('id')
                ->on('properties_info')
                ->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('property_insurance_attachments');
    }
};
