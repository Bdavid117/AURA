<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\WellnessRoutine;
use App\Models\RoutineCompletion;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;

class WellnessController extends Controller
{
    /**
     * Get personalized wellness routines for authenticated user
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        
        $routines = WellnessRoutine::where('is_active', true)
            ->where(function($query) use ($user) {
                $query->where('user_id', $user->id)
                      ->orWhereNull('user_id'); // Include general routines
            })
            ->get()
            ->filter(function($routine) use ($user) {
                return $routine->isSuitableForUser($user);
            });

        return response()->json([
            'success' => true,
            'data' => [
                'routines' => $routines->values()
            ]
        ]);
    }

    /**
     * Get recommended routines based on user profile
     */
    public function getRecommendations(Request $request): JsonResponse
    {
        $user = $request->user();
        
        // Generate personalized recommendations
        $recommendations = $this->generatePersonalizedRoutines($user);

        return response()->json([
            'success' => true,
            'data' => [
                'recommendations' => $recommendations,
                'user_profile' => [
                    'activity_level' => $user->activity_level,
                    'age' => $user->age,
                    'interests' => $user->interests
                ]
            ]
        ]);
    }

    /**
     * Create a new wellness routine
     */
    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'description' => 'required|string|max:1000',
            'category' => 'required|in:physical,mental,social,spiritual',
            'difficulty' => 'required|in:easy,moderate,challenging',
            'duration_minutes' => 'required|integer|min:1|max:180',
            'instructions' => 'required|array|min:1',
            'instructions.*' => 'string|max:500',
            'benefits' => 'nullable|array',
            'benefits.*' => 'string|max:200',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation errors',
                'errors' => $validator->errors()
            ], 422);
        }

        $routine = $request->user()->wellnessRoutines()->create([
            'name' => $request->name,
            'description' => $request->description,
            'category' => $request->category,
            'difficulty' => $request->difficulty,
            'duration_minutes' => $request->duration_minutes,
            'instructions' => $request->instructions,
            'benefits' => $request->benefits ?? [],
            'is_personalized' => true,
            'is_active' => true,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Wellness routine created successfully',
            'data' => [
                'routine' => $routine
            ]
        ], 201);
    }

    /**
     * Get a specific wellness routine
     */
    public function show(Request $request, WellnessRoutine $wellnessRoutine): JsonResponse
    {
        // Check if user can access this routine
        if ($wellnessRoutine->user_id && $wellnessRoutine->user_id !== $request->user()->id) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
            ], 403);
        }

        $routine = $wellnessRoutine->load('completions');

        return response()->json([
            'success' => true,
            'data' => [
                'routine' => $routine,
                'user_completions' => $wellnessRoutine->completions()
                    ->where('user_id', $request->user()->id)
                    ->orderBy('completed_date', 'desc')
                    ->limit(10)
                    ->get()
            ]
        ]);
    }

    /**
     * Complete a wellness routine
     */
    public function complete(Request $request, WellnessRoutine $wellnessRoutine): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'duration_minutes' => 'nullable|integer|min:1|max:300',
            'difficulty_rating' => 'nullable|in:too_easy,just_right,too_hard',
            'notes' => 'nullable|string|max:1000',
            'enjoyment_rating' => 'nullable|integer|min:1|max:5',
            'completed_date' => 'nullable|date',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation errors',
                'errors' => $validator->errors()
            ], 422);
        }

        // Check if already completed today
        $today = $request->completed_date ?? now()->toDateString();
        $existingCompletion = RoutineCompletion::where('user_id', $request->user()->id)
            ->where('wellness_routine_id', $wellnessRoutine->id)
            ->where('completed_date', $today)
            ->first();

        if ($existingCompletion) {
            return response()->json([
                'success' => false,
                'message' => 'Routine already completed today'
            ], 422);
        }

        $completion = RoutineCompletion::create([
            'user_id' => $request->user()->id,
            'wellness_routine_id' => $wellnessRoutine->id,
            'completed_date' => $today,
            'duration_minutes' => $request->duration_minutes,
            'difficulty_rating' => $request->difficulty_rating,
            'notes' => $request->notes,
            'enjoyment_rating' => $request->enjoyment_rating,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Routine completed successfully',
            'data' => [
                'completion' => $completion,
                'routine' => $wellnessRoutine
            ]
        ], 201);
    }

    /**
     * Get user's completion history
     */
    public function getCompletionHistory(Request $request): JsonResponse
    {
        $completions = $request->user()
            ->routineCompletions()
            ->with('wellnessRoutine')
            ->orderBy('completed_date', 'desc')
            ->get();

        $stats = [
            'total_completions' => $completions->count(),
            'this_week' => $completions->where('completed_date', '>=', now()->startOfWeek())->count(),
            'this_month' => $completions->where('completed_date', '>=', now()->startOfMonth())->count(),
            'average_enjoyment' => $completions->whereNotNull('enjoyment_rating')->avg('enjoyment_rating'),
            'favorite_category' => $completions->groupBy('wellnessRoutine.category')
                ->map->count()
                ->sortDesc()
                ->keys()
                ->first()
        ];

        return response()->json([
            'success' => true,
            'data' => [
                'completions' => $completions,
                'statistics' => $stats
            ]
        ]);
    }

    /**
     * Generate personalized wellness routines based on user profile
     */
    private function generatePersonalizedRoutines($user): array
    {
        $routines = [];
        $activityLevel = $user->activity_level;
        $age = $user->age;
        $interests = $user->interests ? explode(',', $user->interests) : [];

        // Physical routines based on activity level
        if ($activityLevel === 'low' || $age > 70) {
            $routines[] = [
                'name' => 'Ejercicios de Silla Suaves',
                'description' => 'Ejercicios suaves que se pueden hacer sentado, perfectos para mantener la movilidad.',
                'category' => 'physical',
                'difficulty' => 'easy',
                'duration_minutes' => 15,
                'instructions' => [
                    'Siéntate cómodamente en una silla con respaldo',
                    'Levanta los brazos lentamente hacia arriba y bájalos',
                    'Gira los hombros hacia adelante y hacia atrás',
                    'Flexiona y extiende los tobillos',
                    'Respira profundamente durante todo el ejercicio'
                ],
                'benefits' => ['Mejora la circulación', 'Mantiene la flexibilidad', 'Reduce la rigidez']
            ];
        }

        if ($activityLevel === 'moderate') {
            $routines[] = [
                'name' => 'Caminata Mindful',
                'description' => 'Una caminata consciente que combina ejercicio físico con relajación mental.',
                'category' => 'physical',
                'difficulty' => 'moderate',
                'duration_minutes' => 30,
                'instructions' => [
                    'Sal al aire libre o camina en un espacio amplio',
                    'Comienza con un paso lento y relajado',
                    'Concéntrate en tu respiración mientras caminas',
                    'Observa tu entorno con atención plena',
                    'Termina con estiramientos suaves'
                ],
                'benefits' => ['Ejercicio cardiovascular', 'Reduce el estrés', 'Mejora el estado de ánimo']
            ];
        }

        // Mental wellness routines
        $routines[] = [
            'name' => 'Meditación de Gratitud',
            'description' => 'Una práctica de mindfulness enfocada en cultivar sentimientos de gratitud.',
            'category' => 'mental',
            'difficulty' => 'easy',
            'duration_minutes' => 10,
            'instructions' => [
                'Encuentra un lugar tranquilo y siéntate cómodamente',
                'Cierra los ojos y respira profundamente',
                'Piensa en tres cosas por las que te sientes agradecido',
                'Reflexiona sobre por qué estas cosas son importantes para ti',
                'Termina enviando gratitud a las personas que amas'
            ],
            'benefits' => ['Mejora el bienestar emocional', 'Reduce la ansiedad', 'Aumenta la felicidad']
        ];

        // Social routines
        $routines[] = [
            'name' => 'Llamada a un Ser Querido',
            'description' => 'Conecta con familia o amigos para mantener vínculos sociales importantes.',
            'category' => 'social',
            'difficulty' => 'easy',
            'duration_minutes' => 20,
            'instructions' => [
                'Elige a alguien especial a quien no hayas hablado recientemente',
                'Prepara algunas preguntas sobre cómo está',
                'Comparte algo positivo de tu día',
                'Escucha activamente sus respuestas',
                'Programa la próxima conversación antes de despedirte'
            ],
            'benefits' => ['Fortalece relaciones', 'Reduce la soledad', 'Mejora el estado de ánimo']
        ];

        return $routines;
    }
}
