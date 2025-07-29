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
        Schema::table('orders', function (Blueprint $table) {
            // Add location_id column
            // It's unsignedBigInteger because it will reference the 'id' column of the 'locations' table
            // It's nullable because online orders might not be associated with a specific store location
            $table->unsignedBigInteger('location_id')->nullable()->after('is_pos_sale'); // Adjust 'after' as needed

            // Add foreign key constraint
            // This links the location_id in 'orders' to the 'id' in the 'locations' table
            // onDelete('set null') means if a location is deleted, orders associated with it
            // will have their location_id set to null instead of being deleted.
            $table->foreign('location_id')->references('id')->on('locations')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            // Drop the foreign key constraint first
            $table->dropConstrainedForeignId('location_id'); // Laravel 8+ helper to drop foreign keys

            // Then drop the column
            $table->dropColumn('location_id');
        });
    }
};
