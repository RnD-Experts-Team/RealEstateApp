<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('unit_payments', function (Blueprint $table) {
            $table->id();

            $table->foreignId('unit_id')->constrained()->cascadeOnDelete();

            $table->enum('type', ['Checks', 'Credit Card', 'Zelle']);
            $table->decimal('amount', 12, 2);
            $table->date('date');
            $table->string('to_whom');
            $table->text('description')->nullable();

            // only used when type = Credit Card
            $table->string('order_id')->nullable();

            $table->boolean('is_hidden')->default(false);

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('unit_payments');
    }
};