<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateOrdersTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->string('order_number')->unique(); // Unique order number generated by frontend/backend
            $table->foreignId('user_id')->nullable()->constrained('users')->onDelete('set null'); // Link to users table, nullable for guests

            // User Info
            $table->string('full_name');
            $table->string('email');
            $table->string('phone');

            // Shipping Address
            $table->string('shipping_address1');
            $table->string('shipping_address2')->nullable();
            $table->string('city');
            $table->string('state');
            $table->string('zip_code');

            // Order Totals
            $table->decimal('subtotal', 10, 2);
            $table->decimal('shipping_cost', 10, 2);
            $table->decimal('grand_total', 10, 2);

            // Payment Details
            $table->string('payment_method'); // e.g., 'paystack', 'bank_transfer', 'cash_on_delivery'
            $table->string('paystack_reference')->nullable(); // For Paystack transactions
            $table->string('status')->default('pending'); // e.g., 'pending', 'completed', 'failed', 'processing_bank_transfer_payment'

            // Order Items (JSON blob)
            $table->json('items_json'); // Stores the array of items as a JSON string

            $table->timestamps(); // created_at and updated_at
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('orders');
    }
}