<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('agreements', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('agreement_type_id')->nullable();
            $table->uuid('token')->unique();
            $table->string('reference')->nullable();
            $table->string('type_name')->nullable();
            $table->enum('status', ['draft', 'sent', 'signed'])->default('draft');
            $table->string('owner_name')->nullable();
            $table->string('owner_signature_path')->nullable();
            $table->timestamp('owner_signed_at')->nullable();
            $table->string('agent_signature_path')->nullable();
            $table->timestamp('agent_signed_at')->nullable();
            $table->boolean('is_archived')->default(false);
            $table->timestamps();

            $table->foreign('agreement_type_id', 'agr_type_fk')
                ->references('id')->on('agreement_types')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('agreements');
    }
};
