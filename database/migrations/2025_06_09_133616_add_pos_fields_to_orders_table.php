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
            // Add new columns for POS sales
            // Check if columns exist before adding to prevent errors on re-run
            if (!Schema::hasColumn('orders', 'discount_amount')) {
                $table->decimal('discount_amount', 10, 2)->default(0.00)->after('shipping_cost');
            }
            if (!Schema::hasColumn('orders', 'amount_paid')) {
                $table->decimal('amount_paid', 10, 2)->nullable()->after('grand_total');
            }
            if (!Schema::hasColumn('orders', 'is_pos_sale')) {
                $table->boolean('is_pos_sale')->default(false)->after('status');
            }

            // Make online order specific fields nullable if they are not already
            // Check if they are already nullable. This requires a bit more logic or direct inspection.
            // For simplicity, directly using ->nullable()->change() should work, but ensure column types match.
            // If the column already IS nullable, change() will not error.
            $table->string('full_name')->nullable()->change();
            $table->string('email')->nullable()->change();
            $table->string('phone')->nullable()->change();
            $table->string('shipping_address1')->nullable()->change();
            $table->string('shipping_address2')->nullable()->change();
            $table->string('city')->nullable()->change();
            $table->string('state')->nullable()->change();
            $table->string('zip_code')->nullable()->change();

            // If 'order_number' was NOT NULL and you want it nullable for POS, uncomment/ensure this:
            // $table->string('order_number')->nullable()->change();

            // paystack_reference is likely already nullable, but ensure it
            $table->string('paystack_reference')->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            // Only drop columns that were added in this migration
            if (Schema::hasColumn('orders', 'discount_amount')) {
                $table->dropColumn('discount_amount');
            }
            if (Schema::hasColumn('orders', 'amount_paid')) {
                $table->dropColumn('amount_paid');
            }
            if (Schema::hasColumn('orders', 'is_pos_sale')) {
                $table->dropColumn('is_pos_sale');
            }

            // Revert nullable changes if necessary (only if they were changed FROM nullable)
            // This part is tricky. If you made them nullable and data was inserted,
            // you might not be able to revert to NOT NULL without defining a default.
            // It's generally safer to just manage the `up` part for forward compatibility.
            // For this example, we'll assume you don't need to revert them to NOT NULL on rollback.
        });
    }
};