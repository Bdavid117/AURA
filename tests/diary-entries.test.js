// Test para verificar funcionalidad del diario
const axios = require('axios');

const BASE_URL = 'http://127.0.0.1:8000/api';
let authToken = '';

const testUser = {
  email: 'test@example.com',
  password: 'password123'
};

async function login() {
  try {
    const response = await axios.post(`${BASE_URL}/login`, testUser);
    if (response.data.success) {
      authToken = response.data.data.token;
      console.log('✅ Login exitoso para pruebas de diario');
      return true;
    }
    return false;
  } catch (error) {
    console.error('❌ Error en login:', error.response?.data || error.message);
    return false;
  }
}

async function createDiaryEntry() {
  try {
    console.log('📝 Creando entrada de diario de prueba...');
    const entryData = {
      title: 'Entrada de Prueba',
      content: 'Esta es una entrada de prueba para verificar el funcionamiento del diario.',
      mood: 'happy',
      entry_date: new Date().toISOString().split('T')[0]
    };

    const response = await axios.post(`${BASE_URL}/diary-entries`, entryData, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.data.success) {
      console.log('✅ Entrada creada con ID:', response.data.data.entry.id);
      return response.data.data.entry;
    } else {
      console.log('❌ Error creando entrada:', response.data.message);
      return null;
    }
  } catch (error) {
    console.error('❌ Error creando entrada:', error.response?.data || error.message);
    return null;
  }
}

async function getDiaryEntries() {
  try {
    console.log('📋 Obteniendo entradas del diario...');
    const response = await axios.get(`${BASE_URL}/diary-entries`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });

    if (response.data.success) {
      const entries = response.data.data.entries;
      console.log(`✅ Se encontraron ${entries.length} entradas`);
      entries.forEach(entry => {
        console.log(`  - ID: ${entry.id}, Título: ${entry.title}, Fecha: ${entry.entry_date}`);
      });
      return entries;
    } else {
      console.log('❌ Error obteniendo entradas:', response.data.message);
      return [];
    }
  } catch (error) {
    console.error('❌ Error obteniendo entradas:', error.response?.data || error.message);
    return [];
  }
}

async function runDiaryTest() {
  console.log('🧪 INICIANDO PRUEBA DE FUNCIONALIDAD DEL DIARIO');
  console.log('=' .repeat(50));

  const loginSuccess = await login();
  if (!loginSuccess) {
    console.log('❌ No se pudo hacer login');
    return;
  }

  const entriesBefore = await getDiaryEntries();
  const newEntry = await createDiaryEntry();
  
  if (newEntry) {
    const entriesAfter = await getDiaryEntries();
    console.log(`📊 Entradas antes: ${entriesBefore.length}, después: ${entriesAfter.length}`);
    
    if (entriesAfter.length > entriesBefore.length) {
      console.log('✅ PRUEBA EXITOSA: Nueva entrada creada correctamente');
    } else {
      console.log('❌ PROBLEMA: La entrada no se guardó correctamente');
    }
  }

  console.log('🧪 PRUEBA DE DIARIO COMPLETADA');
}

if (require.main === module) {
  runDiaryTest().catch(console.error);
}

module.exports = { runDiaryTest, createDiaryEntry, getDiaryEntries };
