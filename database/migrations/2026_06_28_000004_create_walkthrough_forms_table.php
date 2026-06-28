<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('walkthrough_forms', function (Blueprint $table) {
            $table->id();
            $table->enum('form_kind', ['walkthrough', 'safety_inspection']);
            $table->enum('context_type', ['move_out', 'unit']);
            $table->unsignedBigInteger('reference_id');
            $table->uuid('token')->unique();
            $table->unsignedBigInteger('representative_id')->nullable();
            $table->string('representative_name')->nullable();
            $table->string('property_address')->nullable();
            $table->enum('status', ['pending', 'submitted'])->default('pending');
            $table->boolean('signature_required')->default(false);
            $table->string('signature_path')->nullable();
            $table->timestamp('submitted_at')->nullable();
            $table->boolean('is_archived')->default(false);
            $table->timestamps();

            $table->index(['context_type', 'reference_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('walkthrough_forms');
    }
};
