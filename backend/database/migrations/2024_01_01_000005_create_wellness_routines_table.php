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
        Schema::create('wellness_routines', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('name');
            $table->text('description');
            $table->enum('category', ['physical', 'mental', 'social', 'spiritual'])->default('physical');
            $table->enum('difficulty', ['easy', 'moderate', 'challenging'])->default('easy');
            $table->integer('duration_minutes');
            $table->json('instructions'); // Step-by-step instructions
            $table->json('benefits')->nullable();
            $table->boolean('is_personalized')->default(false);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('wellness_routines');
    }
};
