<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
// database/migrations/xxxx_xx_xx_create_visits_table.php

public function up()
{
    Schema::create('visits', function (Blueprint $table) {
        $table->id();
        $table->ipAddress('ip')->nullable();
        $table->string('country')->nullable();
        $table->string('city')->nullable();
        $table->string('device')->nullable();  // e.g., mobile, desktop
        $table->string('platform')->nullable(); // e.g., Windows, Android
        $table->timestamp('visited_at')->useCurrent();
        $table->timestamps();
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('visits');
    }
};
