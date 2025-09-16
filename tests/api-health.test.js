// Test para verificar la salud de la API
const axios = require('axios');

const BASE_URL = 'http://127.0.0.1:8000/api';

async function testApiHealth() {
  try {
    console.log('🏥 Verificando salud de la API...');
    const response = await axios.get(`${BASE_URL}/health`);
    
    console.log('📊 Status:', response.status);
    console.log('📥 Respuesta:', response.data);
    
    if (response.status === 200 && response.data.status === 'OK') {
      console.log('✅ API está funcionando correctamente');
      return true;
    } else {
      console.log('❌ API no responde correctamente');
      return false;
    }
  } catch (error) {
    console.error('❌ Error conectando con la API:', error.message);
    return false;
  }
}

if (require.main === module) {
  testApiHealth();
}

module.exports = { testApiHealth };
