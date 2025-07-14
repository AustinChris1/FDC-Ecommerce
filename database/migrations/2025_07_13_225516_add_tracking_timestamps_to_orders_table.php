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
            // Add new nullable datetime columns for tracking timestamps
            $table->timestamp('shipped_at')->nullable()->after('status');
            $table->timestamp('out_for_delivery_at')->nullable()->after('shipped_at');
            $table->timestamp('delivered_at')->nullable()->after('out_for_delivery_at');
            $table->timestamp('cancelled_at')->nullable()->after('delivered_at'); // For cancelled status
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            // Drop the columns if rolling back the migration
            $table->dropColumn(['shipped_at', 'out_for_delivery_at', 'delivered_at', 'cancelled_at']);
        });
    }
};