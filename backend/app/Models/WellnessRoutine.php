<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class WellnessRoutine extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'name',
        'description',
        'category',
        'difficulty',
        'duration_minutes',
        'instructions',
        'benefits',
        'is_personalized',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'instructions' => 'array',
            'benefits' => 'array',
            'is_personalized' => 'boolean',
            'is_active' => 'boolean',
        ];
    }

    /**
     * Get the user that owns the wellness routine.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the completions for this routine.
     */
    public function completions(): HasMany
    {
        return $this->hasMany(RoutineCompletion::class);
    }

    /**
     * Get completion count for this routine.
     */
    public function getCompletionCountAttribute(): int
    {
        return $this->completions()->count();
    }

    /**
     * Get average enjoyment rating for this routine.
     */
    public function getAverageEnjoymentAttribute(): ?float
    {
        return $this->completions()
            ->whereNotNull('enjoyment_rating')
            ->avg('enjoyment_rating');
    }

    /**
     * Check if routine is suitable for user's activity level.
     */
    public function isSuitableForUser(User $user): bool
    {
        $userLevel = $user->activity_level;
        $routineDifficulty = $this->difficulty;

        return match($userLevel) {
            'low' => in_array($routineDifficulty, ['easy']),
            'moderate' => in_array($routineDifficulty, ['easy', 'moderate']),
            'high' => in_array($routineDifficulty, ['easy', 'moderate', 'challenging']),
            default => true
        };
    }
}
