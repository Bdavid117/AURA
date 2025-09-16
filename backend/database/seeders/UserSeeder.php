<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create test user for API testing
        User::updateOrCreate(
            ['email' => 'test@example.com'],
            [
                'name' => 'Usuario de Prueba',
                'email' => 'test@example.com',
                'password' => Hash::make('password123'),
                'age' => 65,
                'gender' => 'male',
                'preferences' => [
                    'language' => 'es',
                    'voice_enabled' => true,
                    'notifications' => true
                ]
            ]
        );

        // Create additional test users
        User::updateOrCreate(
            ['email' => 'maria@example.com'],
            [
                'name' => 'María García',
                'email' => 'maria@example.com',
                'password' => Hash::make('password123'),
                'age' => 72,
                'gender' => 'female',
                'preferences' => [
                    'language' => 'es',
                    'voice_enabled' => true,
                    'notifications' => false
                ]
            ]
        );
    }
}
