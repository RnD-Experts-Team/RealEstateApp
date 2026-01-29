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
        Schema::table('move_ins', function (Blueprint $table) {
            $table->boolean('delisted')->default(false)->after('last_notice_sent');
            $table->boolean('utilities_under_their_name')->default(false)->after('delisted');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('move_ins', function (Blueprint $table) {
            $table->dropColumn(['delisted', 'utilities_under_their_name']);
        });
    }
};
