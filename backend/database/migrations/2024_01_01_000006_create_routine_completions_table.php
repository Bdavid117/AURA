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
        Schema::create('routine_completions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('wellness_routine_id')->constrained()->onDelete('cascade');
            $table->date('completed_date');
            $table->integer('duration_minutes')->nullable();
            $table->enum('difficulty_rating', ['too_easy', 'just_right', 'too_hard'])->nullable();
            $table->text('notes')->nullable();
            $table->integer('enjoyment_rating')->nullable(); // 1-5 scale
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('routine_completions');
    }
};
