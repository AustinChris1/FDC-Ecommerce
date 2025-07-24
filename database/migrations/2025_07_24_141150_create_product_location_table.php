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
        Schema::create('product_location', function (Blueprint $table) {
            // No primary 'id' for pivot table, use composite primary key
            $table->foreignId('product_id')->constrained()->onDelete('cascade');
            $table->foreignId('location_id')->constrained()->onDelete('cascade');
            $table->unsignedInteger('quantity_in_store')->default(0); // Stock level at this specific store
            $table->timestamps(); // To track when stock was last updated

            // Define composite primary key
            $table->primary(['product_id', 'location_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('product_location');
    }
};