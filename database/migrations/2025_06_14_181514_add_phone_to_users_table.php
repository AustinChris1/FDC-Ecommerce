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
        Schema::table('users', function (Blueprint $table) {
            // Add the 'phone' column after the 'email_verified_at' column
            // It will be nullable as phone numbers are often optional
            // and default to NULL if not provided.
            $table->string('phone')->nullable()->after('email_verified_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // Drop the 'phone' column if the migration is rolled back
            $table->dropColumn('phone');
        });
    }
};