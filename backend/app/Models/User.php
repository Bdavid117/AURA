<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Database\Eloquent\Relations\HasMany;

class User extends Authenticatable
{
    use HasFactory, Notifiable, HasApiTokens;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'birth_date',
        'gender',
        'medical_conditions',
        'interests',
        'activity_level',
        'emergency_contact_name',
        'emergency_contact_phone',
        'preferences',
        'last_active_at',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'birth_date' => 'date',
            'preferences' => 'array',
            'last_active_at' => 'datetime',
        ];
    }

    /**
     * Get the user's diary entries.
     */
    public function diaryEntries(): HasMany
    {
        return $this->hasMany(DiaryEntry::class);
    }

    /**
     * Get the user's conversations.
     */
    public function conversations(): HasMany
    {
        return $this->hasMany(Conversation::class);
    }

    /**
     * Get the wellness routines for the user.
     */
    public function wellnessRoutines(): HasMany
    {
        return $this->hasMany(WellnessRoutine::class);
    }

    /**
     * Get the routine completions for the user.
     */
    public function routineCompletions(): HasMany
    {
        return $this->hasMany(RoutineCompletion::class);
    }

    /**
     * Calculate user's age from birth date.
     */
    public function getAgeAttribute(): ?int
    {
        return $this->birth_date ? $this->birth_date->age : null;
    }

    /**
     * Check if user is active (logged in within last 7 days).
     */
    public function getIsActiveAttribute(): bool
    {
        return $this->last_active_at && $this->last_active_at->gt(now()->subDays(7));
    }
}
