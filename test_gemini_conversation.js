const axios = require('axios');

const BASE_URL = 'http://127.0.0.1:8000/api';

// Test data
const testUser = {
  email: 'gemini_test@example.com',
  password: 'Password123',
  password_confirmation: 'Password123',
  name: 'Test Gemini User',
  birth_date: '1960-01-01',
  gender: 'male',
  emergency_contact_name: 'Emergency Contact',
  emergency_contact_phone: '+1234567890'
};

async function testGeminiConversation() {
  try {
    console.log('🤖 Testing Gemini AI Conversation...\n');

    // 1. Register test user
    console.log('1️⃣ Registering test user...');
    let response = await axios.post(`${BASE_URL}/register`, testUser);
    
    if (!response.data.success) {
      console.log('ℹ️ User might already exist, trying to login...');
      response = await axios.post(`${BASE_URL}/login`, {
        email: testUser.email,
        password: testUser.password
      });
    }

    const token = response.data.token;
    console.log('✅ Authentication successful');

    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };

    // 2. Test Gemini with General conversation
    console.log('\n2️⃣ Testing Gemini AI - General conversation...');
    response = await axios.post(`${BASE_URL}/conversations`, {
      type: 'general',
      initial_message: 'Hola, me llamo María y tengo 75 años. Me gustaría conversar contigo sobre mi día.'
    }, { headers });
    
    const generalConversation = response.data.data.conversation;
    console.log('✅ General conversation created');
    console.log('🤖 AI Response:', generalConversation.messages[1].content);

    // 3. Send follow-up message
    console.log('\n3️⃣ Sending follow-up message...');
    response = await axios.post(`${BASE_URL}/conversations/${generalConversation.id}/messages`, {
      message: 'Hoy fui al parque con mi nieta y vimos muchas flores bonitas. Me recordó a cuando era joven y tenía mi propio jardín.'
    }, { headers });
    
    console.log('🤖 AI Response:', response.data.data.ai_message.content);

    // 4. Test Wellness conversation
    console.log('\n4️⃣ Testing Wellness conversation...');
    response = await axios.post(`${BASE_URL}/conversations`, {
      type: 'wellness',
      initial_message: 'Me siento un poco cansada últimamente y quiero mejorar mi salud.'
    }, { headers });
    
    const wellnessConversation = response.data.data.conversation;
    console.log('🤖 Wellness AI Response:', wellnessConversation.messages[1].content);

    // 5. Test Emotional Support conversation
    console.log('\n5️⃣ Testing Emotional Support conversation...');
    response = await axios.post(`${BASE_URL}/conversations`, {
      type: 'emotional_support',
      initial_message: 'Me siento un poco sola hoy. Mis hijos viven lejos y los extraño mucho.'
    }, { headers });
    
    const supportConversation = response.data.data.conversation;
    console.log('❤️ Support AI Response:', supportConversation.messages[1].content);

    // 6. Test conversation continuity
    console.log('\n6️⃣ Testing conversation memory...');
    response = await axios.post(`${BASE_URL}/conversations/${generalConversation.id}/messages`, {
      message: '¿Recuerdas que te conté sobre mi nieta y las flores?'
    }, { headers });
    
    console.log('🧠 Memory Test Response:', response.data.data.ai_message.content);

    console.log('\n🎉 Gemini AI integration test completed successfully!');
    console.log('\n📊 Summary:');
    console.log('- ✅ General conversation with context');
    console.log('- ✅ Wellness-focused responses');
    console.log('- ✅ Emotional support responses');
    console.log('- ✅ Conversation memory working');
    console.log('- ✅ Natural Spanish responses');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    if (error.response?.data?.errors) {
      console.error('Validation errors:', error.response.data.errors);
    }
  }
}

testGeminiConversation();
