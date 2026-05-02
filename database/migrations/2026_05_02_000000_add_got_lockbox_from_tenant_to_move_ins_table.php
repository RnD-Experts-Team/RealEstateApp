<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('move_ins', function (Blueprint $table) {
            $table->boolean('got_lockbox_from_tenant')->default(false)->after('utilities_under_their_name');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('move_ins', function (Blueprint $table) {
            $table->dropColumn('got_lockbox_from_tenant');
        });
    }
};
