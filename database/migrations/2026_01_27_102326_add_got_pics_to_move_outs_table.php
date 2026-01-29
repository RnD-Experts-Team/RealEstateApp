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
        Schema::table('move_outs', function (Blueprint $table) {
            $table->boolean('got_pics')->default(false)->after('is_hidden');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('move_outs', function (Blueprint $table) {
            $table->dropColumn('got_pics');
        });
    }
};
