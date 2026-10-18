<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('payments', function (Blueprint $table) {
            $table->boolean('remind')->default(false)->after('is_hidden');
            $table->boolean('added_to_ledger')->default(false)->after('remind');
        });
    }

    public function down(): void
    {
        Schema::table('payments', function (Blueprint $table) {
            $table->dropColumn(['remind', 'added_to_ledger']);
        });
    }
};
