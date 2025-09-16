// Test script para verificar conexión con API
const axios = require('axios');

const BASE_URL = 'http://127.0.0.1:8000/api';

async function testAPI() {
  try {
    console.log('🔍 Probando conexión con API...');
    
    // Test health check
    const healthResponse = await axios.get(`${BASE_URL}/health`);
    console.log('✅ Health check:', healthResponse.data);
    
    // Test registro
    const registerData = {
      name: 'Usuario Prueba',
      email: `test${Date.now()}@aura.com`,
      password: 'Password123',
      password_confirmation: 'Password123',
      birth_date: '1950-01-01',
      gender: 'male',
      activity_level: 'moderate',
      emergency_contact_name: 'Contacto Emergencia',
      emergency_contact_phone: '+1234567890'
    };
    
    console.log('🔍 Probando registro de usuario...');
    const registerResponse = await axios.post(`${BASE_URL}/register`, registerData);
    console.log('✅ Registro exitoso:', registerResponse.data);
    
  } catch (error) {
    console.error('❌ Error en API:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      fullError: error.response?.data?.error,
      validationErrors: error.response?.data?.errors
    });
  }
}

testAPI();
