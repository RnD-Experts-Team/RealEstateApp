<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('walkthrough_form_fields', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('walkthrough_form_id');
            $table->string('title');
            $table->enum('type', ['attachments', 'yes_no', 'multi_choice', 'long_text']);
            $table->boolean('is_repeatable')->default(false);
            $table->string('instance_label')->nullable();
            $table->integer('sort_order')->default(0);
            $table->text('value_text')->nullable();
            $table->boolean('value_bool')->nullable();
            $table->json('value_options')->nullable();
            $table->json('options_snapshot')->nullable();
            $table->timestamps();

            $table->foreign('walkthrough_form_id', 'wff_form_fk')
                ->references('id')->on('walkthrough_forms')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('walkthrough_form_fields');
    }
};
