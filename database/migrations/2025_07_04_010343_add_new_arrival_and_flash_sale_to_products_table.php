<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up()
    {
        Schema::table('products', function (Blueprint $table) {
            $table->boolean('is_new_arrival')->default(false)->after('popular');
            $table->boolean('is_flash_sale')->default(false)->after('is_new_arrival');
            $table->decimal('flash_sale_price', 8, 2)->nullable()->after('is_flash_sale');
            $table->timestamp('flash_sale_starts_at')->nullable()->after('flash_sale_price');
            $table->timestamp('flash_sale_ends_at')->nullable()->after('flash_sale_starts_at');
        });
    }
    
    public function down()
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropColumn(['is_new_arrival', 'is_flash_sale', 'flash_sale_price', 'flash_sale_starts_at', 'flash_sale_ends_at']);
        });
    }

};
