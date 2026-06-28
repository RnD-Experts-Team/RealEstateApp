<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('agreement_clauses', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('agreement_type_id');
            $table->string('title');
            $table->longText('body')->nullable();
            $table->enum('kind', ['standard', 'options'])->default('standard');
            $table->integer('sort_order')->default(0);
            $table->boolean('is_archived')->default(false);
            $table->timestamps();

            $table->foreign('agreement_type_id', 'ac_type_fk')
                ->references('id')->on('agreement_types')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('agreement_clauses');
    }
};
