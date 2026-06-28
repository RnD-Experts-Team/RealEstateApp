<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('agreement_snapshot_clauses', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('agreement_id');
            $table->string('title');
            $table->longText('body')->nullable();
            $table->enum('kind', ['standard', 'options'])->default('standard');
            $table->json('options')->nullable();
            $table->integer('selected_option')->nullable();
            $table->integer('sort_order')->default(0);
            $table->timestamps();

            $table->foreign('agreement_id', 'asc_agreement_fk')
                ->references('id')->on('agreements')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('agreement_snapshot_clauses');
    }
};
