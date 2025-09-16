# 🚀 Guía de Instalación y Configuración - AURA

## 📋 Requisitos Previos

### Sistema Operativo
- Windows 10/11
- macOS 10.15+
- Linux (Ubuntu 18.04+)

### Software Requerido
- **Node.js** 18.0+ ([Descargar](https://nodejs.org/))
- **PHP** 8.1+ ([Descargar](https://www.php.net/downloads))
- **Composer** ([Descargar](https://getcomposer.org/download/))
- **Git** ([Descargar](https://git-scm.com/downloads))

### Para Desarrollo Móvil
- **Expo CLI**: `npm install -g @expo/cli`
- **Expo Go** app en tu dispositivo móvil

## 🔧 Instalación

### 1. Clonar el Repositorio
```bash
git clone https://github.com/tu-usuario/aura.git
cd aura
```

### 2. Configurar Backend (Laravel)
```bash
cd backend

# Instalar dependencias
composer install

# Copiar archivo de configuración
cp .env.example .env

# Generar clave de aplicación
php artisan key:generate

# Configurar base de datos (SQLite por defecto)
php artisan migrate

# Crear usuario de prueba
php artisan tinker --execute="App\Models\User::create(['name' => 'Test User', 'email' => 'admin@aura.com', 'password' => bcrypt('password')]);"
```

### 3. Configurar Frontend (React Native + Expo)
```bash
cd ../mobile

# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npx expo start --port 8083
```

### 4. Configurar Tests
```bash
cd ../tests

# Instalar dependencias
npm install
```

## ⚙️ Configuración de Variables de Entorno

### Backend (.env)
```env
APP_NAME=AURA
APP_ENV=local
APP_KEY=base64:tu-clave-generada
APP_DEBUG=true
APP_URL=http://127.0.0.1:8000

DB_CONNECTION=sqlite
DB_DATABASE=/ruta/absoluta/a/database/database.sqlite

# OpenAI para transcripción de voz
OPENAI_API_KEY=tu-clave-openai-aqui
```

### Frontend (mobile/src/services/apiService.js)
```javascript
// Para desarrollo local
const BASE_URL = 'http://127.0.0.1:8000/api';

// Para dispositivo físico, cambiar por tu IP local
// const BASE_URL = 'http://192.168.1.100:8000/api';
```

## 🏃‍♂️ Ejecutar la Aplicación

### 1. Iniciar Backend
```bash
cd backend
php artisan serve --host=127.0.0.1
```
✅ Backend disponible en: `http://127.0.0.1:8000`

### 2. Iniciar Frontend
```bash
cd mobile
npx expo start --port 8083 --clear
```
✅ Expo DevTools en: `http://localhost:8083`

### 3. Conectar Dispositivo Móvil
1. Instala **Expo Go** desde App Store/Google Play
2. Escanea el código QR desde Expo DevTools
3. Asegúrate de estar en la misma red WiFi

## 🧪 Ejecutar Tests

```bash
cd tests

# Verificar salud de la API
npm run test:api

# Probar funcionalidad del diario
npm run test:diary

# Probar eliminación de conversaciones
npm run test:conversations

# Ejecutar todas las pruebas
npm test
```

## 🔧 Solución de Problemas

### Problema: Expo no se conecta
**Solución:**
```bash
npx expo start --port 8083 --clear --tunnel
```

### Problema: Error de CORS en API
**Solución:** Verificar que el backend esté ejecutándose con `--host=127.0.0.1`

### Problema: Base de datos no existe
**Solución:**
```bash
cd backend
touch database/database.sqlite
php artisan migrate
```

### Problema: OpenAI API no funciona
**Solución:** Verificar que `OPENAI_API_KEY` esté configurado en `.env`

## 📱 Uso en Dispositivo Físico

Para usar en dispositivo físico en lugar del simulador:

1. Encuentra tu IP local:
   ```bash
   # Windows
   ipconfig
   
   # macOS/Linux
   ifconfig
   ```

2. Actualiza `mobile/src/services/apiService.js`:
   ```javascript
   const BASE_URL = 'http://TU-IP-LOCAL:8000/api';
   ```

3. Asegúrate de que el firewall permita conexiones en el puerto 8000

## 🎯 Credenciales de Prueba

- **Email:** `admin@aura.com`
- **Password:** `password`

## 📞 Soporte

Si encuentras problemas:
1. Revisa los logs en `backend/storage/logs/`
2. Verifica que todos los servicios estén ejecutándose
3. Consulta la documentación en `/docs/`
