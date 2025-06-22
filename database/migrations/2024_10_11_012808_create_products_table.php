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
        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->integer('category_id');
            $table->string('meta_title');
            $table->string('name');
            $table->string('link');
            $table->text('description');
            $table->mediumText('meta_description')->nullable();
            $table->string('meta_keywords')->nullable();
            $table->string('selling_price');
            $table->string('original_price');
            $table->string('qty');
            $table->string('image');      // Nullable for the first image
            $table->string('image2')->nullable();     // Nullable for the second image
            $table->tinyInteger('status')->default(0)->comment('0=Inactive|1=Active')->nullable();
            $table->tinyInteger('featured')->nullable()->default(0)->comment('0=No|1=Yes');
            $table->tinyInteger('popular')->nullable()->default(0)->comment('0=No|1=Yes');
            $table->string('brand')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};
