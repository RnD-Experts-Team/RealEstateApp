<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('agreement_clause_options', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('agreement_clause_id');
            $table->string('label');
            $table->longText('body')->nullable();
            $table->integer('sort_order')->default(0);
            $table->boolean('is_archived')->default(false);
            $table->timestamps();

            $table->foreign('agreement_clause_id', 'aco_clause_fk')
                ->references('id')->on('agreement_clauses')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('agreement_clause_options');
    }
};
