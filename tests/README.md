# AURA Tests

Esta carpeta contiene todas las pruebas para la aplicación AURA, organizadas para mantener el proyecto ordenado y facilitar el debugging.

## Estructura de Pruebas

```
tests/
├── package.json              # Dependencias y scripts de pruebas
├── run-all-tests.js          # Script principal para ejecutar todas las pruebas
├── api-health.test.js        # Verificación de salud de la API
├── conversation-deletion.test.js  # Pruebas de eliminación de conversaciones
├── diary-entries.test.js     # Pruebas de funcionalidad del diario
└── README.md                 # Esta documentación
```

## Instalación

Antes de ejecutar las pruebas, instala las dependencias:

```bash
cd tests
npm install
```

## Ejecución de Pruebas

### Ejecutar todas las pruebas
```bash
npm test
```

### Ejecutar pruebas individuales
```bash
# Verificar salud de la API
npm run test:api

# Probar eliminación de conversaciones
npm run test:conversations

# Probar funcionalidad del diario
npm run test:diary
```

### Ejecutar pruebas manualmente
```bash
# Salud de la API
node api-health.test.js

# Eliminación de conversaciones
node conversation-deletion.test.js

# Funcionalidad del diario
node diary-entries.test.js
```

## Descripción de Pruebas

### 1. API Health Test (`api-health.test.js`)
- Verifica que la API esté funcionando correctamente
- Prueba el endpoint `/api/health`
- Confirma que el servidor backend esté activo

### 2. Conversation Deletion Test (`conversation-deletion.test.js`)
- **PROPÓSITO PRINCIPAL**: Debuggear por qué la eliminación visual de conversaciones no funciona
- Crea una conversación de prueba
- Intenta eliminarla usando la API
- Verifica si realmente se eliminó de la base de datos
- Proporciona análisis detallado del proceso

### 3. Diary Entries Test (`diary-entries.test.js`)
- Verifica la creación de entradas de diario
- Prueba la obtención del historial de entradas
- Confirma que las entradas se guarden correctamente

## Requisitos Previos

Para que las pruebas funcionen correctamente:

1. **Backend Laravel debe estar ejecutándose**:
   ```bash
   cd backend
   php artisan serve --host=127.0.0.1
   ```

2. **Base de datos debe estar configurada** con un usuario de prueba:
   - Email: `test@example.com`
   - Password: `password123`

3. **API debe estar accesible** en `http://127.0.0.1:8000/api`

## Interpretación de Resultados

### Prueba de Eliminación de Conversaciones
Si esta prueba muestra:
- ✅ **"Eliminación exitosa + Conversación realmente eliminada"**: Todo funciona correctamente
- ⚠️ **"API dice que eliminó pero la conversación sigue ahí"**: Problema en el backend
- ❌ **"La eliminación falló completamente"**: Problema de conectividad o autenticación

### Solución de Problemas Comunes

1. **Error de conexión**: Verificar que el backend esté ejecutándose
2. **Error de autenticación**: Verificar que existe el usuario de prueba
3. **Error 404**: Verificar que las rutas de la API estén configuradas correctamente

## Agregar Nuevas Pruebas

Para agregar una nueva prueba:

1. Crear archivo `nueva-prueba.test.js`
2. Seguir el patrón de las pruebas existentes
3. Agregar script en `package.json`
4. Incluir en `run-all-tests.js`

## Logs y Debugging

Todas las pruebas incluyen logging detallado con emojis para facilitar la identificación:
- 🧪 Inicio/fin de pruebas
- ✅ Operaciones exitosas
- ❌ Errores
- ⚠️ Advertencias
- 📊 Estadísticas
- 🔐 Autenticación
- 📝 Creación
- 🗑️ Eliminación
