<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\DiaryEntry;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;

class DiaryController extends Controller
{
    /**
     * Get all diary entries for authenticated user
     */
    public function index(Request $request): JsonResponse
    {
        $entries = $request->user()
            ->diaryEntries()
            ->orderBy('entry_date', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => [
                'entries' => $entries
            ]
        ]);
    }

    /**
     * Create a new diary entry
     */
    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'title' => 'nullable|string|max:255',
            'content' => 'required|string|max:5000',
            'mood' => 'nullable|in:very_happy,happy,neutral,sad,very_sad',
            'tags' => 'nullable|array',
            'tags.*' => 'string|max:50',
            'is_private' => 'boolean',
            'entry_date' => 'nullable|date',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation errors',
                'errors' => $validator->errors()
            ], 422);
        }

        $entry = $request->user()->diaryEntries()->create([
            'title' => $request->title,
            'content' => $request->content,
            'mood' => $request->mood,
            'tags' => $request->tags ?? [],
            'is_private' => $request->is_private ?? true,
            'entry_date' => $request->entry_date ?? now()->toDateString(),
        ]);

        // Generate AI suggestions asynchronously
        $entry->generateAISuggestions();

        return response()->json([
            'success' => true,
            'message' => 'Diary entry created successfully',
            'data' => [
                'entry' => $entry->fresh()
            ]
        ], 201);
    }

    /**
     * Get a specific diary entry
     */
    public function show(Request $request, DiaryEntry $diaryEntry): JsonResponse
    {
        // Ensure user owns the diary entry
        if ($diaryEntry->user_id !== $request->user()->id) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
            ], 403);
        }

        return response()->json([
            'success' => true,
            'data' => [
                'entry' => $diaryEntry
            ]
        ]);
    }

    /**
     * Update a diary entry
     */
    public function update(Request $request, DiaryEntry $diaryEntry): JsonResponse
    {
        // Ensure user owns the diary entry
        if ($diaryEntry->user_id !== $request->user()->id) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'title' => 'sometimes|string|max:255',
            'content' => 'sometimes|string|max:5000',
            'mood' => 'sometimes|in:very_happy,happy,neutral,sad,very_sad',
            'tags' => 'sometimes|array',
            'tags.*' => 'string|max:50',
            'is_private' => 'sometimes|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation errors',
                'errors' => $validator->errors()
            ], 422);
        }

        $diaryEntry->update($request->only([
            'title', 'content', 'mood', 'tags', 'is_private'
        ]));

        // Regenerate AI suggestions if content changed
        if ($request->has('content')) {
            $diaryEntry->generateAISuggestions();
        }

        return response()->json([
            'success' => true,
            'message' => 'Diary entry updated successfully',
            'data' => [
                'entry' => $diaryEntry->fresh()
            ]
        ]);
    }

    /**
     * Delete a diary entry
     */
    public function destroy(Request $request, DiaryEntry $diaryEntry): JsonResponse
    {
        // Ensure user owns the diary entry
        if ($diaryEntry->user_id !== $request->user()->id) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
            ], 403);
        }

        $diaryEntry->delete();

        return response()->json([
            'success' => true,
            'message' => 'Diary entry deleted successfully'
        ]);
    }

    /**
     * Get diary entries by date range
     */
    public function getByDateRange(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation errors',
                'errors' => $validator->errors()
            ], 422);
        }

        $entries = $request->user()
            ->diaryEntries()
            ->whereBetween('entry_date', [$request->start_date, $request->end_date])
            ->orderBy('entry_date', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => [
                'entries' => $entries,
                'date_range' => [
                    'start_date' => $request->start_date,
                    'end_date' => $request->end_date
                ]
            ]
        ]);
    }

    /**
     * Get mood statistics for user
     */
    public function getMoodStats(Request $request): JsonResponse
    {
        $moodStats = $request->user()
            ->diaryEntries()
            ->whereNotNull('mood')
            ->selectRaw('mood, COUNT(*) as count')
            ->groupBy('mood')
            ->get()
            ->pluck('count', 'mood');

        $totalEntries = $request->user()->diaryEntries()->count();
        $entriesWithMood = $request->user()->diaryEntries()->whereNotNull('mood')->count();

        return response()->json([
            'success' => true,
            'data' => [
                'mood_distribution' => $moodStats,
                'total_entries' => $totalEntries,
                'entries_with_mood' => $entriesWithMood,
                'mood_tracking_percentage' => $totalEntries > 0 ? round(($entriesWithMood / $totalEntries) * 100, 2) : 0
            ]
        ]);
    }

    /**
     * Transcribe audio to text using AI
     */
    public function transcribeAudio(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'audio' => 'required|file|mimes:m4a,mp3,wav,aac|max:10240', // 10MB max
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid audio file',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $audioFile = $request->file('audio');
            $audioPath = $audioFile->store('temp_audio', 'local');
            $fullPath = storage_path('app/' . $audioPath);

            // Use OpenAI Whisper API for transcription
            $transcription = $this->transcribeWithOpenAI($fullPath);

            // Clean up temporary file
            unlink($fullPath);

            return response()->json([
                'success' => true,
                'message' => 'Audio transcribed successfully',
                'data' => [
                    'transcription' => $transcription
                ]
            ]);

        } catch (\Exception $e) {
            \Log::error('Audio transcription error: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to transcribe audio. Please try again or write manually.',
                'error' => config('app.debug') ? $e->getMessage() : 'Transcription service unavailable'
            ], 500);
        }
    }

    /**
     * Transcribe audio using OpenAI Whisper API
     */
    private function transcribeWithOpenAI(string $audioPath): string
    {
        $apiKey = config('services.openai.api_key');
        
        if (!$apiKey) {
            throw new \Exception('OpenAI API key not configured');
        }

        $curl = curl_init();

        curl_setopt_array($curl, [
            CURLOPT_URL => 'https://api.openai.com/v1/audio/transcriptions',
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_POST => true,
            CURLOPT_HTTPHEADER => [
                'Authorization: Bearer ' . $apiKey,
            ],
            CURLOPT_POSTFIELDS => [
                'file' => new \CURLFile($audioPath),
                'model' => 'whisper-1',
                'language' => 'es', // Spanish language for AURA users
                'response_format' => 'json',
                'prompt' => 'Este es un audio de diario personal en español. Por favor transcribe con precisión incluyendo emociones y sentimientos.'
            ],
            CURLOPT_TIMEOUT => 30,
        ]);

        $response = curl_exec($curl);
        $httpCode = curl_getinfo($curl, CURLINFO_HTTP_CODE);
        $error = curl_error($curl);
        curl_close($curl);

        if ($error) {
            throw new \Exception('cURL error: ' . $error);
        }

        if ($httpCode !== 200) {
            throw new \Exception('OpenAI API error: HTTP ' . $httpCode . ' - ' . $response);
        }

        $data = json_decode($response, true);
        
        if (!isset($data['text'])) {
            throw new \Exception('Invalid response from OpenAI API');
        }

        return trim($data['text']);
    }
}
