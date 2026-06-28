<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('walkthrough_form_attachments', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('walkthrough_form_id');
            $table->unsignedBigInteger('walkthrough_form_field_id')->nullable();
            $table->string('file_name');
            $table->string('file_path');
            $table->timestamps();

            $table->foreign('walkthrough_form_id', 'wfa_form_fk')
                ->references('id')->on('walkthrough_forms')->onDelete('cascade');
            $table->foreign('walkthrough_form_field_id', 'wfa_field_fk')
                ->references('id')->on('walkthrough_form_fields')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('walkthrough_form_attachments');
    }
};
