<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use App\Models\Conversation;

class AIService
{
    private string $apiKey;
    private string $baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

    public function __construct()
    {
        $this->apiKey = env('GEMINI_API_KEY', '');
    }

    /**
     * Generate AI response using Google Gemini
     */
    public function generateResponse(Conversation $conversation, string $userMessage): string
    {
        if (empty($this->apiKey)) {
            Log::warning('Gemini API key not configured, using fallback responses');
            return $this->getFallbackResponse($conversation->type, $conversation->user->name);
        }

        try {
            $prompt = $this->buildPrompt($conversation, $userMessage);
            
            $response = Http::timeout(30)->post($this->baseUrl . '?key=' . $this->apiKey, [
                'contents' => [
                    [
                        'parts' => [
                            ['text' => $prompt]
                        ]
                    ]
                ],
                'generationConfig' => [
                    'temperature' => 0.7,
                    'topK' => 40,
                    'topP' => 0.95,
                    'maxOutputTokens' => 1024,
                ],
                'safetySettings' => [
                    [
                        'category' => 'HARM_CATEGORY_HARASSMENT',
                        'threshold' => 'BLOCK_MEDIUM_AND_ABOVE'
                    ],
                    [
                        'category' => 'HARM_CATEGORY_HATE_SPEECH',
                        'threshold' => 'BLOCK_MEDIUM_AND_ABOVE'
                    ]
                ]
            ]);

            if ($response->successful()) {
                $data = $response->json();
                
                if (isset($data['candidates'][0]['content']['parts'][0]['text'])) {
                    $aiResponse = $data['candidates'][0]['content']['parts'][0]['text'];
                    Log::info('Gemini AI response generated successfully');
                    return trim($aiResponse);
                }
            }

            Log::error('Gemini API error', ['response' => $response->json()]);
            return $this->getFallbackResponse($conversation->type, $conversation->user->name);

        } catch (\Exception $e) {
            Log::error('Error calling Gemini API', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return $this->getFallbackResponse($conversation->type, $conversation->user->name);
        }
    }

    /**
     * Build context-aware prompt for Gemini
     */
    private function buildPrompt(Conversation $conversation, string $userMessage): string
    {
        $user = $conversation->user;
        $userName = $user->name;
        $userAge = $user->birth_date ? now()->diffInYears($user->birth_date) : 'adulto mayor';
        $conversationType = $conversation->type;

        // Get conversation history for context
        $recentMessages = $conversation->messages()
            ->orderBy('created_at', 'desc')
            ->limit(6)
            ->get()
            ->reverse();

        $conversationHistory = '';
        foreach ($recentMessages as $message) {
            $sender = $message->sender === 'user' ? $userName : 'Asistente';
            $conversationHistory .= "{$sender}: {$message->content}\n";
        }

        $systemPrompt = $this->getSystemPrompt($conversationType, $userName, $userAge);
        
        return "{$systemPrompt}\n\nHistorial de conversación:\n{$conversationHistory}\n{$userName}: {$userMessage}\n\nAsistente:";
    }

    /**
     * Get system prompt based on conversation type
     */
    private function getSystemPrompt(string $type, string $userName, $userAge): string
    {
        $basePrompt = "Eres AURA, un asistente virtual especializado en acompañar a adultos mayores. Tu personalidad es cálida, empática, paciente y respetuosa. Siempre respondes en español de manera clara y sencilla. El usuario se llama {$userName} y tiene {$userAge} años.";

        switch ($type) {
            case 'wellness':
                return $basePrompt . " Esta es una conversación sobre bienestar físico y mental. Ofrece consejos de salud apropiados para adultos mayores, pero siempre recuerda que no eres un médico y que deben consultar con profesionales de la salud para temas serios. Enfócate en actividades suaves, nutrición saludable y bienestar emocional.";
                
            case 'emotional_support':
                return $basePrompt . " Esta es una conversación de apoyo emocional. Sé especialmente empático, valida los sentimientos del usuario, ofrece palabras de aliento y técnicas simples de relajación o mindfulness. Escucha activamente y responde con calidez y comprensión.";
                
            default: // general
                return $basePrompt . " Esta es una conversación general. Sé conversacional, amigable y muestra interés genuino en la vida del usuario. Puedes hablar sobre hobbies, familia, recuerdos, actividades diarias, o cualquier tema que el usuario quiera compartir.";
        }
    }

    /**
     * Fallback responses when AI is not available
     */
    private function getFallbackResponse(string $type, string $userName): string
    {
        $responses = [
            'wellness' => [
                "Hola {$userName}, me alegra que quieras hablar sobre bienestar. ¿Cómo te has sentido físicamente hoy?",
                "Es maravilloso que te preocupes por tu salud, {$userName}. ¿Has podido hacer alguna actividad física hoy?",
                "Tu bienestar es muy importante, {$userName}. ¿Te gustaría que conversemos sobre algún aspecto específico de tu salud?",
            ],
            'emotional_support' => [
                "Estoy aquí para escucharte, {$userName}. Tus sentimientos son válidos e importantes.",
                "Gracias por confiar en mí, {$userName}. ¿Cómo puedo apoyarte mejor en este momento?",
                "Te entiendo, {$userName}. A veces es bueno hablar sobre lo que sentimos. Estoy aquí para ti.",
            ],
            'general' => [
                "¡Hola {$userName}! Me da mucho gusto conversar contigo. ¿Cómo ha estado tu día?",
                "Es un placer hablar contigo, {$userName}. ¿Hay algo especial que te gustaría compartir conmigo?",
                "¡Qué bueno tenerte aquí, {$userName}! Cuéntame, ¿qué te trae por aquí hoy?",
            ]
        ];

        $typeResponses = $responses[$type] ?? $responses['general'];
        return $typeResponses[array_rand($typeResponses)];
    }

    /**
     * Analyze sentiment of user message
     */
    public function analyzeSentiment(string $message): string
    {
        $positiveWords = ['bien', 'bueno', 'feliz', 'alegre', 'contento', 'genial', 'excelente', 'fantástico', 'maravilloso'];
        $negativeWords = ['mal', 'triste', 'deprimido', 'preocupado', 'ansioso', 'dolor', 'enfermo', 'cansado'];
        
        $message = strtolower($message);
        
        $positiveCount = 0;
        $negativeCount = 0;
        
        foreach ($positiveWords as $word) {
            if (strpos($message, $word) !== false) {
                $positiveCount++;
            }
        }
        
        foreach ($negativeWords as $word) {
            if (strpos($message, $word) !== false) {
                $negativeCount++;
            }
        }
        
        if ($positiveCount > $negativeCount) {
            return 'positive';
        } elseif ($negativeCount > $positiveCount) {
            return 'negative';
        } else {
            return 'neutral';
        }
    }
}
