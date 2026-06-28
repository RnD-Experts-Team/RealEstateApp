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
        Schema::create('inspection_forms', function (Blueprint $table) {
            $table->id();
            $table->enum('form_type', ['move_in', 'move_out']);
            $table->unsignedBigInteger('reference_id');
            $table->uuid('token')->unique();
            $table->string('tenant_name')->nullable();
            $table->string('property_address')->nullable();
            $table->enum('status', ['pending', 'submitted'])->default('pending');
            $table->boolean('acknowledged')->default(false);
            $table->text('acknowledgment_text')->nullable();
            $table->text('other_comments')->nullable();
            $table->boolean('signature_required')->default(false);
            $table->string('signature_path')->nullable();
            $table->timestamp('submitted_at')->nullable();
            $table->boolean('is_archived')->default(false);
            $table->timestamps();

            $table->unique(['form_type', 'reference_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('inspection_forms');
    }
};
