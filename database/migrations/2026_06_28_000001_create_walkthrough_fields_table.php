<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('walkthrough_fields', function (Blueprint $table) {
            $table->id();
            $table->enum('form_kind', ['walkthrough', 'safety_inspection']);
            $table->string('title');
            $table->enum('type', ['attachments', 'yes_no', 'multi_choice', 'long_text']);
            $table->boolean('is_repeatable')->default(false);
            $table->integer('sort_order')->default(0);
            $table->boolean('is_archived')->default(false);
            $table->timestamps();

            $table->index('form_kind');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('walkthrough_fields');
    }
};
