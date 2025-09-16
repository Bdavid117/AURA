# 🔌 Documentación de la API - AURA

## 📡 Información General

- **Base URL**: `http://127.0.0.1:8000/api`
- **Autenticación**: Bearer Token (Laravel Sanctum)
- **Formato**: JSON
- **Versión**: v1

## 🔐 Autenticación

### POST /login
Iniciar sesión y obtener token de acceso.

**Request:**
```json
{
  "email": "admin@aura.com",
  "password": "password"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": 1,
      "name": "Test User",
      "email": "admin@aura.com"
    },
    "token": "1|abc123..."
  }
}
```

### POST /logout
Cerrar sesión y revocar token.

**Headers:** `Authorization: Bearer {token}`

## 💬 Conversaciones

### GET /conversations
Obtener lista de conversaciones del usuario.

**Headers:** `Authorization: Bearer {token}`

**Response:**
```json
{
  "success": true,
  "data": {
    "conversations": [
      {
        "id": 1,
        "type": "general",
        "title": "Conversación sobre el clima",
        "created_at": "2024-01-01T10:00:00Z",
        "updated_at": "2024-01-01T10:30:00Z"
      }
    ]
  }
}
```

### POST /conversations
Crear nueva conversación.

**Headers:** `Authorization: Bearer {token}`

**Request:**
```json
{
  "type": "general",
  "title": "Nueva conversación"
}
```

### DELETE /conversations/{id}
Eliminar conversación específica.

**Headers:** `Authorization: Bearer {token}`

**Response:**
```json
{
  "success": true,
  "message": "Conversation deleted successfully"
}
```

## 💭 Mensajes

### GET /conversations/{id}/messages
Obtener mensajes de una conversación.

**Headers:** `Authorization: Bearer {token}`

### POST /conversations/{id}/messages
Enviar mensaje en una conversación.

**Headers:** `Authorization: Bearer {token}`

**Request:**
```json
{
  "content": "Hola, ¿cómo estás hoy?",
  "type": "user"
}
```

## 📖 Diario

### GET /diary-entries
Obtener entradas del diario del usuario.

**Headers:** `Authorization: Bearer {token}`

**Response:**
```json
{
  "success": true,
  "data": {
    "entries": [
      {
        "id": 1,
        "title": "Mi día de hoy",
        "content": "Hoy fue un día especial...",
        "mood": "happy",
        "entry_date": "2024-01-01",
        "created_at": "2024-01-01T15:00:00Z"
      }
    ]
  }
}
```

### POST /diary-entries
Crear nueva entrada de diario.

**Headers:** `Authorization: Bearer {token}`

**Request:**
```json
{
  "title": "Mi día de hoy",
  "content": "Contenido de la entrada...",
  "mood": "happy",
  "entry_date": "2024-01-01"
}
```

### PUT /diary-entries/{id}
Actualizar entrada de diario.

### DELETE /diary-entries/{id}
Eliminar entrada de diario.

## 🎤 Transcripción de Audio

### POST /transcribe-audio
Transcribir audio a texto usando OpenAI Whisper.

**Headers:** 
- `Authorization: Bearer {token}`
- `Content-Type: multipart/form-data`

**Request:**
```
audio: [archivo de audio .m4a, .mp3, .wav, .aac]
```

**Response:**
```json
{
  "success": true,
  "message": "Audio transcribed successfully",
  "data": {
    "transcription": "Texto transcrito del audio..."
  }
}
```

**Limitaciones:**
- Tamaño máximo: 10MB
- Formatos soportados: m4a, mp3, wav, aac
- Idioma optimizado: Español

## 🏥 Salud del Sistema

### GET /health
Verificar estado de la API.

**Response:**
```json
{
  "status": "OK",
  "timestamp": "2024-01-01T12:00:00Z",
  "version": "1.0.0"
}
```

## ❌ Códigos de Error

### Códigos HTTP Comunes
- `200`: Éxito
- `201`: Creado exitosamente
- `400`: Solicitud incorrecta
- `401`: No autorizado
- `403`: Prohibido
- `404`: No encontrado
- `422`: Error de validación
- `500`: Error interno del servidor

### Formato de Errores
```json
{
  "success": false,
  "message": "Descripción del error",
  "errors": {
    "campo": ["Mensaje de error específico"]
  }
}
```

## 🔧 Ejemplos de Uso

### Flujo Completo de Autenticación
```javascript
// 1. Login
const loginResponse = await fetch('/api/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'admin@aura.com',
    password: 'password'
  })
});

const { data } = await loginResponse.json();
const token = data.token;

// 2. Usar token para requests autenticados
const conversationsResponse = await fetch('/api/conversations', {
  headers: { 'Authorization': `Bearer ${token}` }
});
```

### Subir Audio para Transcripción
```javascript
const formData = new FormData();
formData.append('audio', audioFile);

const response = await fetch('/api/transcribe-audio', {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${token}` },
  body: formData
});
```

## 🛡️ Seguridad

### Mejores Prácticas
- Siempre usar HTTPS en producción
- Almacenar tokens de forma segura
- Implementar rate limiting
- Validar todos los inputs
- Sanitizar datos de salida
- Usar CORS apropiadamente

### Headers de Seguridad Recomendados
```
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Strict-Transport-Security: max-age=31536000
```
