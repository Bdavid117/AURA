<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RoutineCompletion extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'wellness_routine_id',
        'completed_date',
        'duration_minutes',
        'difficulty_rating',
        'notes',
        'enjoyment_rating',
    ];

    protected function casts(): array
    {
        return [
            'completed_date' => 'date',
        ];
    }

    /**
     * Get the user that completed the routine.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the wellness routine that was completed.
     */
    public function wellnessRoutine(): BelongsTo
    {
        return $this->belongsTo(WellnessRoutine::class);
    }

    /**
     * Check if completion was recent (within last 7 days).
     */
    public function getIsRecentAttribute(): bool
    {
        return $this->completed_date->gt(now()->subDays(7));
    }
}
