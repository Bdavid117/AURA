# 🤖 Configuración de Google Gemini AI

## 🔑 Obtener API Key de Gemini

1. **Ve a Google AI Studio**: https://aistudio.google.com/
2. **Inicia sesión** con tu cuenta de Google
3. **Clic en "Get API Key"** en la esquina superior derecha
4. **Crea un nuevo proyecto** o selecciona uno existente
5. **Genera tu API Key** y cópiala

## ⚙️ Configurar en AURA

1. **Abre el archivo `.env`** en la carpeta `backend/`
2. **Agrega tu API Key**:
   ```
   GEMINI_API_KEY=
   ```
3. **Guarda el archivo**

## 🚀 Características de Gemini en AURA

### ✅ **Ventajas:**
- **Gratuito**: 15 requests/minuto sin costo
- **Español nativo**: Respuestas naturales
- **Contexto**: Recuerda conversaciones anteriores
- **Personalizado**: Adaptado para adultos mayores
- **Empático**: Tono cálido y comprensivo

### 🎯 **Tipos de Conversación:**

#### **General** 💬
- Conversación casual y amigable
- Interés en la vida diaria del usuario
- Temas: familia, hobbies, recuerdos

#### **Bienestar** 🏃‍♂️
- Consejos de salud apropiados para seniors
- Actividades físicas suaves
- Nutrición y bienestar emocional

#### **Apoyo Emocional** ❤️
- Respuestas empáticas y validación
- Técnicas de relajación
- Escucha activa y comprensión

## 🔄 **Fallback System**

Si no hay API Key o falla la conexión:
- Sistema automático de respuestas predefinidas
- Mantiene funcionalidad básica
- No interrumpe la experiencia del usuario

## 🧪 **Probar la Integración**

Ejecuta el test:
```bash
node test_conversation_api.js
```

¡Ahora AURA tiene IA real para conversaciones naturales con adultos mayores! 🎉
