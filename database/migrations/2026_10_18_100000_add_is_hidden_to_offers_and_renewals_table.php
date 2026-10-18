<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('offers_and_renewals', function (Blueprint $table) {
            $table->boolean('is_hidden')->default(false)->after('is_archived');
            $table->index('is_hidden');
        });
    }

    public function down(): void
    {
        Schema::table('offers_and_renewals', function (Blueprint $table) {
            $table->dropIndex(['is_hidden']);
            $table->dropColumn('is_hidden');
        });
    }
};
