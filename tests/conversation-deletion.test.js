// Test para depurar la eliminación de conversaciones
// Este archivo contiene pruebas para identificar por qué la eliminación visual no funciona

const axios = require('axios');

const BASE_URL = 'http://127.0.0.1:8000/api';
let authToken = '';
let testConversationId = null;

// Configuración de prueba - usando usuario que probablemente ya existe
const testUser = {
  email: 'admin@aura.com',
  password: 'password'
};

// Función para hacer login y obtener token
async function login() {
  try {
    console.log('🔐 Iniciando sesión...');
    const response = await axios.post(`${BASE_URL}/login`, testUser);
    
    if (response.data.success) {
      authToken = response.data.data.token;
      console.log('✅ Login exitoso, token obtenido');
      return true;
    } else {
      console.log('❌ Login falló:', response.data.message);
      return false;
    }
  } catch (error) {
    console.error('❌ Error en login:', error.response?.data || error.message);
    return false;
  }
}

// Función para crear una conversación de prueba
async function createTestConversation() {
  try {
    console.log('📝 Creando conversación de prueba...');
    const response = await axios.post(
      `${BASE_URL}/conversations`,
      {
        type: 'general',
        title: 'Conversación de Prueba para Eliminación'
      },
      {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (response.data.success) {
      testConversationId = response.data.data.conversation.id;
      console.log('✅ Conversación creada con ID:', testConversationId);
      return testConversationId;
    } else {
      console.log('❌ Error creando conversación:', response.data.message);
      return null;
    }
  } catch (error) {
    console.error('❌ Error creando conversación:', error.response?.data || error.message);
    return null;
  }
}

// Función para listar conversaciones
async function listConversations() {
  try {
    console.log('📋 Listando conversaciones...');
    const response = await axios.get(`${BASE_URL}/conversations`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });

    if (response.data.success) {
      const conversations = response.data.data.conversations;
      console.log(`✅ Se encontraron ${conversations.length} conversaciones:`);
      conversations.forEach(conv => {
        console.log(`  - ID: ${conv.id}, Título: ${conv.title || 'Sin título'}, Tipo: ${conv.type}`);
      });
      return conversations;
    } else {
      console.log('❌ Error listando conversaciones:', response.data.message);
      return [];
    }
  } catch (error) {
    console.error('❌ Error listando conversaciones:', error.response?.data || error.message);
    return [];
  }
}

// Función para eliminar conversación
async function deleteConversation(conversationId) {
  try {
    console.log(`🗑️ Eliminando conversación ID: ${conversationId}...`);
    const response = await axios.delete(`${BASE_URL}/conversations/${conversationId}`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });

    console.log('📥 Respuesta de eliminación:', response.data);
    console.log('📊 Status code:', response.status);

    if (response.data.success) {
      console.log('✅ Conversación eliminada exitosamente');
      return true;
    } else {
      console.log('❌ Error eliminando conversación:', response.data.message);
      return false;
    }
  } catch (error) {
    console.error('❌ Error eliminando conversación:', error.response?.data || error.message);
    console.error('Status:', error.response?.status);
    return false;
  }
}

// Función principal de prueba
async function runConversationDeletionTest() {
  console.log('🧪 INICIANDO PRUEBA DE ELIMINACIÓN DE CONVERSACIONES');
  console.log('=' .repeat(60));

  // Paso 1: Login
  const loginSuccess = await login();
  if (!loginSuccess) {
    console.log('❌ No se pudo hacer login, terminando prueba');
    return;
  }

  // Paso 2: Listar conversaciones antes
  console.log('\n📋 CONVERSACIONES ANTES DE CREAR NUEVA:');
  const conversationsBefore = await listConversations();

  // Paso 3: Crear conversación de prueba
  console.log('\n📝 CREANDO CONVERSACIÓN DE PRUEBA:');
  const createdId = await createTestConversation();
  if (!createdId) {
    console.log('❌ No se pudo crear conversación de prueba');
    return;
  }

  // Paso 4: Listar conversaciones después de crear
  console.log('\n📋 CONVERSACIONES DESPUÉS DE CREAR:');
  const conversationsAfterCreate = await listConversations();

  // Paso 5: Eliminar conversación
  console.log('\n🗑️ ELIMINANDO CONVERSACIÓN:');
  const deleteSuccess = await deleteConversation(createdId);

  // Paso 6: Listar conversaciones después de eliminar
  console.log('\n📋 CONVERSACIONES DESPUÉS DE ELIMINAR:');
  const conversationsAfterDelete = await listConversations();

  // Paso 7: Análisis de resultados
  console.log('\n📊 ANÁLISIS DE RESULTADOS:');
  console.log(`- Conversaciones antes: ${conversationsBefore.length}`);
  console.log(`- Conversaciones después de crear: ${conversationsAfterCreate.length}`);
  console.log(`- Conversaciones después de eliminar: ${conversationsAfterDelete.length}`);
  console.log(`- Eliminación exitosa: ${deleteSuccess ? 'SÍ' : 'NO'}`);

  const wasActuallyDeleted = !conversationsAfterDelete.find(conv => conv.id === createdId);
  console.log(`- Conversación realmente eliminada: ${wasActuallyDeleted ? 'SÍ' : 'NO'}`);

  if (deleteSuccess && wasActuallyDeleted) {
    console.log('✅ PRUEBA EXITOSA: La eliminación funciona correctamente');
  } else if (deleteSuccess && !wasActuallyDeleted) {
    console.log('⚠️ PROBLEMA: API dice que eliminó pero la conversación sigue ahí');
  } else {
    console.log('❌ PROBLEMA: La eliminación falló completamente');
  }

  console.log('\n' + '=' .repeat(60));
  console.log('🧪 PRUEBA COMPLETADA');
}

// Ejecutar si se llama directamente
if (require.main === module) {
  runConversationDeletionTest().catch(console.error);
}

module.exports = {
  runConversationDeletionTest,
  login,
  createTestConversation,
  listConversations,
  deleteConversation
};
