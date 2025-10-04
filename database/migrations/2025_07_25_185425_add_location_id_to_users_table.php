<?php


use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            if (Schema::hasColumn('users', 'store_id')) {
                $table->dropForeign(['store_id']);
                $table->dropColumn('store_id');
            }

            $table->unsignedBigInteger('location_id')->nullable()->after('email');

            $table->foreign('location_id')->references('id')->on('locations')->onDelete('set null');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['location_id']);
            $table->dropColumn('location_id');
        });
    }
};