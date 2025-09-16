# AURA - Aplicación Móvil para Adultos Mayores

## Descripción del Proyecto

AURA es una aplicación móvil diseñada específicamente para adultos mayores, que combina un backend Laravel con un frontend React Native. La aplicación incluye funcionalidades de chat conversacional con IA, rutinas de bienestar personalizadas, diario personal con asistencia de IA, y un sistema de autenticación seguro.

## ✅ Estado del Proyecto: COMPLETAMENTE FUNCIONAL

- ✅ Backend Laravel API funcionando en puerto 8000
- ✅ Frontend React Native con Expo funcionando en puerto 8083
- ✅ Base de datos SQLite configurada y migrada
- ✅ Integración API completa y probada
- ✅ UI optimizada para adultos mayores

## Tecnologías Utilizadas

### Backend
- **Laravel 11** - Framework PHP
- **SQLite** - Base de datos
- **Laravel Sanctum** - Autenticación API
- **PHP 8.2+** - Lenguaje de programación

### Frontend
- **React Native** - Framework móvil
- **Expo** - Plataforma de desarrollo
- **React Navigation** - Navegación
- **Axios** - Cliente HTTP
- **AsyncStorage** - Almacenamiento local

## Estructura del Proyecto

```
AURA/
├── backend/          # Laravel API
│   ├── app/
│   │   ├── Http/Controllers/Api/
│   │   └── Models/
│   ├── config/
│   ├── database/
│   │   ├── migrations/
│   │   └── seeders/
│   └── routes/api.php
├── mobile/           # React Native App
│   ├── src/
│   │   ├── context/AuthContext.js
│   │   ├── screens/
│   │   └── services/apiService.js
│   ├── App.js
│   └── app.json
└── SETUP_INSTRUCTIONS.md
```

## 🚀 Instalación y Configuración

### Prerrequisitos

- PHP 8.2 o superior
- Composer
- Node.js 18 o superior
- npm o yarn
- Expo CLI (`npm install -g @expo/cli`)
- Un dispositivo móvil con Expo Go instalado

### ⚙️ Configuración del Backend (Laravel)

1. **Navegar al directorio del backend:**
   ```bash
   cd backend
   ```

2. **Instalar dependencias de PHP:**
   ```bash
   composer install
   ```

3. **Configurar el archivo de entorno:**
   ```bash
   cp .env.example .env
   ```

4. **Generar la clave de la aplicación:**
   ```bash
   php artisan key:generate
   ```

5. **Configurar la base de datos SQLite:**
   
   Edita el archivo `.env` y asegúrate de que tenga estas configuraciones:
   ```env
   DB_CONNECTION=sqlite
   DB_DATABASE=C:\Users\BrayanDavidCollazosE\Desktop\AURA\backend\database\database.sqlite
   ```

6. **Crear el archivo de base de datos SQLite:**
   ```bash
   touch database/database.sqlite
   ```
   
   En Windows, puedes crear el archivo manualmente o usar:
   ```cmd
   type nul > database\database.sqlite
   ```

7. **Ejecutar las migraciones:**
   ```bash
   php artisan migrate
   ```

8. **Ejecutar los seeders (rutinas de bienestar):**
   ```bash
   php artisan db:seed --class=WellnessRoutineSeeder
   ```

9. **Iniciar el servidor de desarrollo:**
   ```bash
   php artisan serve --host=127.0.0.1 --port=8000
   ```

   ✅ El servidor estará disponible en `http://127.0.0.1:8000`
   
   **Verificar que funciona:**
   ```bash
   curl http://127.0.0.1:8000/api/health
   ```
   Debería responder: `{"status":"OK","message":"AURA API is running"}`
- `conversations` - Conversaciones con IA
- `messages` - Mensajes de las conversaciones
- `diary_entries` - Entradas del diario personal
- `wellness_routines` - Rutinas de bienestar
- `routine_completions` - Registro de rutinas completadas

## Funcionalidades Principales

### 1. Sistema de Autenticación
- Registro de usuarios con información específica para adultos mayores
- Login seguro con Laravel Sanctum
- Gestión de perfil personalizable

### 2. Chat con IA
- Conversaciones contextuales en español
- Diferentes tipos: general, bienestar, apoyo emocional
- Respuestas adaptadas a la edad y preferencias del usuario

### 3. Diario Personal
- Entradas con seguimiento de estado de ánimo
- Sugerencias generadas por IA
- Calendario de entradas

### 4. Rutinas de Bienestar
- Rutinas personalizadas según perfil del usuario
- Categorías: física, mental, social, espiritual
- Seguimiento de progreso y completación

## Configuración para Producción

### Backend
1. Configurar servidor web (Apache/Nginx)
2. Configurar base de datos en producción
3. Configurar variables de entorno de producción
4. Habilitar HTTPS
5. Configurar backups automáticos

### Frontend
1. Configurar build de producción:
   ```bash
   expo build:android
   expo build:ios
   ```
2. Publicar en Google Play Store / App Store
3. Configurar actualizaciones OTA con Expo

## Solución de Problemas Comunes

### Error de conexión API
- Verificar que el backend esté ejecutándose
- Comprobar la URL del API en `apiService.js`
- Verificar configuración de CORS en Laravel

### Problemas con migraciones
```bash
php artisan migrate:fresh --seed
```

### Problemas con dependencias de React Native
```bash
npm install --legacy-peer-deps
```

### Error de permisos en Android
- Verificar permisos en `app.json`
- Reinstalar la aplicación en el dispositivo

## Características de Accesibilidad

- **Texto grande:** Fuentes de 16px o más para facilitar la lectura
- **Botones grandes:** Mínimo 44px de altura para fácil interacción
- **Colores contrastantes:** Cumple con estándares WCAG
- **Navegación simple:** Máximo 4 pestañas principales
- **Feedback visual:** Confirmaciones claras para todas las acciones

## Soporte y Mantenimiento

### Logs del Backend
```bash
tail -f storage/logs/laravel.log
```

### Logs de React Native
- Usar React Native Debugger
- Verificar consola de Expo

### Actualizaciones
- Backend: `composer update`
- Frontend: `npm update`

## Contacto y Soporte

Para soporte técnico o preguntas sobre la implementación, consulta la documentación de Laravel y React Native, o revisa los logs de error para diagnóstico específico.
