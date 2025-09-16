const axios = require('axios');

const BASE_URL = 'http://127.0.0.1:8000/api';

// Test data
const testUser = {
  email: 'conversation_test@example.com',
  password: 'Password123',
  password_confirmation: 'Password123',
  name: 'Test User Conversation',
  birth_date: '1960-01-01',
  gender: 'male',
  emergency_contact_name: 'Emergency Contact',
  emergency_contact_phone: '+1234567890'
};

async function testConversationAPI() {
  try {
    console.log('🧪 Testing Conversation API...\n');

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

    // 2. Test getting conversations (should be empty initially)
    console.log('\n2️⃣ Getting conversations...');
    response = await axios.get(`${BASE_URL}/conversations`, { headers });
    console.log('✅ Conversations retrieved:', response.data.data.conversations.length);

    // 3. Create a general conversation
    console.log('\n3️⃣ Creating general conversation...');
    response = await axios.post(`${BASE_URL}/conversations`, {
      type: 'general',
      initial_message: 'Hola, me gustaría conversar contigo sobre mi día.'
    }, { headers });
    
    const generalConversation = response.data.data.conversation;
    console.log('✅ General conversation created:', generalConversation.id);
    console.log('📝 Messages:', generalConversation.messages.length);

    // 4. Create a wellness conversation
    console.log('\n4️⃣ Creating wellness conversation...');
    response = await axios.post(`${BASE_URL}/conversations`, {
      type: 'wellness',
      initial_message: 'Quiero hablar sobre mi bienestar físico y mental.'
    }, { headers });
    
    const wellnessConversation = response.data.data.conversation;
    console.log('✅ Wellness conversation created:', wellnessConversation.id);

    // 5. Create an emotional support conversation
    console.log('\n5️⃣ Creating emotional support conversation...');
    response = await axios.post(`${BASE_URL}/conversations`, {
      type: 'emotional_support',
      initial_message: 'Me siento un poco triste hoy y necesito apoyo.'
    }, { headers });
    
    const supportConversation = response.data.data.conversation;
    console.log('✅ Emotional support conversation created:', supportConversation.id);

    // 6. Send additional messages
    console.log('\n6️⃣ Sending additional messages...');
    response = await axios.post(`${BASE_URL}/conversations/${generalConversation.id}/messages`, {
      message: 'Hoy fue un día muy interesante. Fui al parque y vi muchas flores bonitas.'
    }, { headers });
    
    console.log('✅ Message sent to general conversation');
    console.log('🤖 AI Response:', response.data.data.ai_message.content);

    // 7. Get specific conversation with all messages
    console.log('\n7️⃣ Getting conversation details...');
    response = await axios.get(`${BASE_URL}/conversations/${generalConversation.id}`, { headers });
    const fullConversation = response.data.data.conversation;
    console.log('✅ Full conversation retrieved with', fullConversation.messages.length, 'messages');

    // 8. Get all conversations again (should have 3 now)
    console.log('\n8️⃣ Getting all conversations...');
    response = await axios.get(`${BASE_URL}/conversations`, { headers });
    console.log('✅ Total conversations:', response.data.data.conversations.length);

    console.log('\n🎉 All conversation tests passed successfully!');
    console.log('\n📊 Summary:');
    console.log(`- Created ${response.data.data.conversations.length} conversations`);
    console.log('- Tested all conversation types (general, wellness, emotional_support)');
    console.log('- AI responses are working');
    console.log('- Message sending is functional');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    if (error.response?.data?.errors) {
      console.error('Validation errors:', error.response.data.errors);
    }
  }
}

testConversationAPI();
