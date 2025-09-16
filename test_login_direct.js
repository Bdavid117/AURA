const axios = require('axios');

const BASE_URL = 'http://127.0.0.1:8000/api';

async function testLoginDirect() {
  try {
    console.log('🔐 Testing Login Directly...\n');

    // Test with existing user
    const loginData = {
      email: 'gemini_test@example.com',
      password: 'Password123'
    };

    console.log('Attempting login with:', loginData.email);
    
    const response = await axios.post(`${BASE_URL}/login`, loginData, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    console.log('Login response:', response.data);

    if (response.data.success) {
      console.log('✅ Login successful!');
      console.log('Token:', response.data.data.token);
      console.log('User:', response.data.data.user.name);
    } else {
      console.log('❌ Login failed:', response.data.message);
    }

  } catch (error) {
    console.error('❌ Login error:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
  }
}

testLoginDirect();
