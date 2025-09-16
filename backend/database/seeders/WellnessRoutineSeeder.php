<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\WellnessRoutine;

class WellnessRoutineSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $routines = [
            [
                'name' => 'Ejercicios de Respiración Matutinos',
                'description' => 'Rutina suave de respiración para comenzar el día con energía y calma.',
                'category' => 'mental',
                'difficulty' => 'easy',
                'duration_minutes' => 10,
                'instructions' => [
                    'Siéntate cómodamente en una silla con respaldo recto',
                    'Coloca una mano en el pecho y otra en el abdomen',
                    'Inhala lentamente por la nariz durante 4 segundos',
                    'Mantén la respiración por 2 segundos',
                    'Exhala lentamente por la boca durante 6 segundos',
                    'Repite este ciclo 10 veces'
                ],
                'benefits' => [
                    'Reduce el estrés y la ansiedad',
                    'Mejora la concentración',
                    'Aumenta los niveles de energía',
                    'Promueve la relajación'
                ],
                'is_personalized' => false,
                'is_active' => true,
            ],
            [
                'name' => 'Caminata Suave en Casa',
                'description' => 'Ejercicio cardiovascular ligero que se puede hacer en espacios pequeños.',
                'category' => 'physical',
                'difficulty' => 'easy',
                'duration_minutes' => 15,
                'instructions' => [
                    'Encuentra un espacio despejado en tu hogar',
                    'Comienza caminando en el lugar durante 2 minutos',
                    'Camina hacia adelante y hacia atrás por 5 minutos',
                    'Levanta las rodillas ligeramente mientras caminas',
                    'Mueve los brazos de forma natural',
                    'Termina con 3 minutos de caminata lenta'
                ],
                'benefits' => [
                    'Mejora la circulación sanguínea',
                    'Fortalece las piernas',
                    'Mantiene la movilidad articular',
                    'Aumenta la resistencia cardiovascular'
                ],
                'is_personalized' => false,
                'is_active' => true,
            ],
            [
                'name' => 'Estiramiento de Cuello y Hombros',
                'description' => 'Rutina para aliviar la tensión en cuello y hombros, ideal para hacer sentado.',
                'category' => 'physical',
                'difficulty' => 'easy',
                'duration_minutes' => 8,
                'instructions' => [
                    'Siéntate derecho en una silla cómoda',
                    'Inclina suavemente la cabeza hacia la derecha, mantén 10 segundos',
                    'Repite hacia la izquierda',
                    'Gira lentamente la cabeza en círculos, 5 veces cada dirección',
                    'Levanta los hombros hacia las orejas, mantén 5 segundos y relaja',
                    'Repite el movimiento de hombros 10 veces'
                ],
                'benefits' => [
                    'Alivia la tensión muscular',
                    'Mejora la flexibilidad del cuello',
                    'Reduce dolores de cabeza',
                    'Previene rigidez articular'
                ],
                'is_personalized' => false,
                'is_active' => true,
            ],
            [
                'name' => 'Meditación de Gratitud',
                'description' => 'Práctica mindfulness enfocada en cultivar sentimientos positivos y gratitud.',
                'category' => 'spiritual',
                'difficulty' => 'easy',
                'duration_minutes' => 12,
                'instructions' => [
                    'Busca un lugar tranquilo y siéntate cómodamente',
                    'Cierra los ojos y respira profundamente 3 veces',
                    'Piensa en 3 cosas por las que te sientes agradecido hoy',
                    'Reflexiona sobre por qué estas cosas son importantes',
                    'Visualiza a las personas que amas y envíales gratitud',
                    'Termina con 3 respiraciones profundas antes de abrir los ojos'
                ],
                'benefits' => [
                    'Mejora el estado de ánimo',
                    'Reduce sentimientos de soledad',
                    'Aumenta la satisfacción personal',
                    'Promueve pensamientos positivos'
                ],
                'is_personalized' => false,
                'is_active' => true,
            ],
            [
                'name' => 'Ejercicios de Memoria',
                'description' => 'Actividades mentales para mantener la mente activa y mejorar la memoria.',
                'category' => 'mental',
                'difficulty' => 'moderate',
                'duration_minutes' => 20,
                'instructions' => [
                    'Recita el alfabeto al revés',
                    'Cuenta de 100 hacia atrás de 7 en 7',
                    'Nombra 10 ciudades que empiecen con la letra "M"',
                    'Recuerda qué desayunaste los últimos 3 días',
                    'Describe detalladamente tu habitación favorita',
                    'Haz una lista mental de tus 10 canciones favoritas'
                ],
                'benefits' => [
                    'Mantiene la mente activa',
                    'Mejora la concentración',
                    'Fortalece la memoria',
                    'Previene el deterioro cognitivo'
                ],
                'is_personalized' => false,
                'is_active' => true,
            ],
            [
                'name' => 'Conexión Social Virtual',
                'description' => 'Actividad para mantener vínculos sociales y combatir la soledad.',
                'category' => 'social',
                'difficulty' => 'easy',
                'duration_minutes' => 30,
                'instructions' => [
                    'Elige a un familiar o amigo que no hayas contactado recientemente',
                    'Prepara 3 preguntas sobre cómo está y qué ha estado haciendo',
                    'Llama por teléfono o videollamada',
                    'Comparte algo positivo de tu semana',
                    'Escucha activamente sus respuestas',
                    'Programa la próxima conversación antes de despedirte'
                ],
                'benefits' => [
                    'Fortalece relaciones personales',
                    'Reduce sentimientos de aislamiento',
                    'Mejora el bienestar emocional',
                    'Mantiene conexiones sociales activas'
                ],
                'is_personalized' => false,
                'is_active' => true,
            ]
        ];

        foreach ($routines as $routine) {
            WellnessRoutine::create($routine);
        }
    }
}
