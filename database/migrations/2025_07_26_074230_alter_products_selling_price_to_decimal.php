<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('products', function (Blueprint $table) {
            // Change column type to decimal, allow null if it was nullable before
            $table->decimal('selling_price', 10, 2)->change();
        });
    }

    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            // Revert to string if needed for rollback, but generally not recommended
            $table->string('selling_price')->change();
        });
    }
};