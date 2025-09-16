<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Conversation;
use App\Models\Message;
use App\Services\AIService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;

class ConversationController extends Controller
{
    protected AIService $aiService;

    public function __construct(AIService $aiService)
    {
        $this->aiService = $aiService;
    }
    /**
     * Get all conversations for authenticated user
     */
    public function index(Request $request): JsonResponse
    {
        $conversations = $request->user()
            ->conversations()
            ->with(['messages' => function($query) {
                $query->latest()->limit(1);
            }])
            ->orderBy('updated_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => [
                'conversations' => $conversations
            ]
        ]);
    }

    /**
     * Create a new conversation
     */
    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'title' => 'nullable|string|max:255',
            'type' => 'required|in:general,wellness,emotional_support',
            'initial_message' => 'required|string|max:1000',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation errors',
                'errors' => $validator->errors()
            ], 422);
        }

        $conversation = $request->user()->conversations()->create([
            'title' => $request->title,
            'type' => $request->type,
            'context' => [
                'user_preferences' => $request->user()->preferences ?? [],
                'user_age' => $request->user()->age,
                'activity_level' => $request->user()->activity_level,
            ]
        ]);

        // Create initial user message
        $userMessage = $conversation->messages()->create([
            'sender' => 'user',
            'content' => $request->initial_message,
        ]);

        // Generate AI response
        $aiResponse = $this->aiService->generateResponse($conversation, $request->initial_message);
        
        $aiMessage = $conversation->messages()->create([
            'sender' => 'ai',
            'content' => $aiResponse,
            'metadata' => [
                'response_type' => 'conversational',
                'sentiment' => 'positive',
                'generated_at' => now()
            ]
        ]);

        // Generate title if not provided
        if (!$conversation->title) {
            $conversation->generateTitle();
        }

        return response()->json([
            'success' => true,
            'message' => 'Conversation created successfully',
            'data' => [
                'conversation' => $conversation->load('messages')
            ]
        ], 201);
    }

    /**
     * Get a specific conversation with messages
     */
    public function show(Request $request, Conversation $conversation): JsonResponse
    {
        // Ensure user owns the conversation
        if ($conversation->user_id !== $request->user()->id) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
            ], 403);
        }

        $conversation->load('messages');

        return response()->json([
            'success' => true,
            'data' => [
                'conversation' => $conversation
            ]
        ]);
    }

    /**
     * Send a message in a conversation
     */
    public function sendMessage(Request $request, Conversation $conversation): JsonResponse
    {
        // Ensure user owns the conversation
        if ($conversation->user_id !== $request->user()->id) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'message' => 'required|string|max:1000',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation errors',
                'errors' => $validator->errors()
            ], 422);
        }

        // Create user message
        $userMessage = $conversation->messages()->create([
            'sender' => 'user',
            'content' => $request->message,
        ]);

        // Generate AI response
        $aiResponse = $this->aiService->generateResponse($conversation, $request->message);
        
        $aiMessage = $conversation->messages()->create([
            'sender' => 'ai',
            'content' => $aiResponse,
            'metadata' => [
                'response_type' => 'conversational',
                'sentiment' => $this->aiService->analyzeSentiment($request->message),
                'generated_at' => now()
            ]
        ]);

        // Update conversation timestamp
        $conversation->touch();

        return response()->json([
            'success' => true,
            'message' => 'Message sent successfully',
            'data' => [
                'user_message' => $userMessage,
                'ai_message' => $aiMessage
            ]
        ]);
    }

    /**
     * Delete a conversation
     */
    public function destroy(Request $request, Conversation $conversation): JsonResponse
    {
        // Ensure user owns the conversation
        if ($conversation->user_id !== $request->user()->id) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
            ], 403);
        }

        $conversation->delete();

        return response()->json([
            'success' => true,
            'message' => 'Conversation deleted successfully'
        ]);
    }

}
