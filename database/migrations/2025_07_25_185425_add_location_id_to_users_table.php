<?php

// database/migrations/YYYY_MM_DD_HHMMSS_add_location_id_to_users_table.php

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
            // Drop existing store_id if it was added from previous steps
            if (Schema::hasColumn('users', 'store_id')) {
                $table->dropForeign(['store_id']);
                $table->dropColumn('store_id');
            }

            // Add location_id column, nullable for central admins, unsigned big integer for foreign key
            $table->unsignedBigInteger('location_id')->nullable()->after('email');

            // Add foreign key constraint (assuming your 'locations' table is 'locations')
            $table->foreign('location_id')->references('id')->on('locations')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['location_id']);
            $table->dropColumn('location_id');
        });
    }
};