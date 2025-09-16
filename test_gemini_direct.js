const axios = require('axios');

async function testGeminiDirect() {
  const apiKey = 'AIzaSyDXacNVkEgdmWohQ1tkXZzi3yt9iMs4g-o';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

  try {
    console.log('🧪 Testing Gemini API directly...\n');

    const response = await axios.post(url, {
      contents: [
        {
          parts: [
            {
              text: "Hola, soy María, tengo 75 años y me gustaría conversar contigo. ¿Cómo estás hoy?"
            }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 1024,
      }
    }, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 30000
    });

    if (response.data && response.data.candidates && response.data.candidates[0]) {
      const aiResponse = response.data.candidates[0].content.parts[0].text;
      console.log('✅ Gemini API is working!');
      console.log('🤖 Response:', aiResponse);
      return true;
    } else {
      console.log('❌ Unexpected response format:', response.data);
      return false;
    }

  } catch (error) {
    console.error('❌ Gemini API test failed:');
    console.error('Status:', error.response?.status);
    console.error('Data:', error.response?.data);
    console.error('Message:', error.message);
    return false;
  }
}

testGeminiDirect();
