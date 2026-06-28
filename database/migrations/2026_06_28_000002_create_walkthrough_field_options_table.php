<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('walkthrough_field_options', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('walkthrough_field_id');
            $table->string('label');
            $table->integer('sort_order')->default(0);
            $table->boolean('is_archived')->default(false);
            $table->timestamps();

            $table->foreign('walkthrough_field_id', 'wfo_field_fk')
                ->references('id')->on('walkthrough_fields')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('walkthrough_field_options');
    }
};
