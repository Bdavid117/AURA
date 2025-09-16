<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ConversationController;
use App\Http\Controllers\Api\DiaryController;
use App\Http\Controllers\Api\WellnessController;

// Health check route
Route::get('/health', function () {
    return response()->json([
        'status' => 'OK',
        'message' => 'AURA API is running',
        'timestamp' => now(),
        'version' => '1.0.0'
    ]);
});

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

// Public routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    // Authentication routes
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/profile', [AuthController::class, 'profile']);
    Route::put('/profile', [AuthController::class, 'updateProfile']);
    
    // Conversation routes
    Route::apiResource('conversations', ConversationController::class);
    Route::post('/conversations/{conversation}/messages', [ConversationController::class, 'sendMessage']);
    
    // Diary routes
    Route::apiResource('diary-entries', DiaryController::class);
    Route::get('/diary/date-range', [DiaryController::class, 'getByDateRange']);
    Route::get('/diary/mood-stats', [DiaryController::class, 'getMoodStats']);
    Route::post('/transcribe-audio', [DiaryController::class, 'transcribeAudio']);
    
    // Wellness routes
    Route::apiResource('wellness-routines', WellnessController::class);
    Route::get('/wellness/recommendations', [WellnessController::class, 'getRecommendations']);
    Route::post('/wellness-routines/{wellnessRoutine}/complete', [WellnessController::class, 'complete']);
    Route::get('/wellness/completion-history', [WellnessController::class, 'getCompletionHistory']);
});

// Health check route
Route::get('/health', function () {
    return response()->json([
        'status' => 'ok',
        'message' => 'AURA API is running',
        'timestamp' => now()->toISOString()
    ]);
});
