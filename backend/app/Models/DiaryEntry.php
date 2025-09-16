<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DiaryEntry extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'title',
        'content',
        'ai_suggestions',
        'mood',
        'tags',
        'is_private',
        'entry_date',
    ];

    protected function casts(): array
    {
        return [
            'tags' => 'array',
            'is_private' => 'boolean',
            'entry_date' => 'date',
        ];
    }

    /**
     * Get the user that owns the diary entry.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Generate AI suggestions based on entry content.
     */
    public function generateAISuggestions(): void
    {
        // This would integrate with AI service to generate suggestions
        // For now, we'll add a placeholder
        $suggestions = [
            'Consider reflecting on what made you feel this way',
            'Try practicing gratitude for three things today',
            'Remember to take care of your physical health too'
        ];
        
        $this->ai_suggestions = implode("\n", $suggestions);
        $this->save();
    }

    /**
     * Get mood emoji representation.
     */
    public function getMoodEmojiAttribute(): string
    {
        return match($this->mood) {
            'very_happy' => '😄',
            'happy' => '😊',
            'neutral' => '😐',
            'sad' => '😢',
            'very_sad' => '😭',
            default => '😐'
        };
    }
}
