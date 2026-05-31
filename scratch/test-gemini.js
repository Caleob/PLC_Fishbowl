const fs = require('fs');
const path = require('path');

async function testGemini() {
  const secretPath = path.join(__dirname, '..', 'SECRET.env');
  const apiKey = fs.readFileSync(secretPath, 'utf8').trim();
  console.log('Using API key (truncated):', apiKey.substring(0, 10) + '...');

  const model = 'gemini-2.5-flash'; // Wait, let's try a standard model first, or gemini-3.1-flash-lite, or gemini-1.5-flash
  const modelsToTry = ['gemini-2.5-flash', 'gemini-1.5-flash', 'gemini-2.0-flash-exp'];
  
  for (const modelId of modelsToTry) {
    console.log(`\nTrying model: ${modelId}...`);
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:generateContent?key=${apiKey}`;

    const requestBody = {
      contents: [
        {
          role: 'user',
          parts: [{ text: 'Hello, respond with a short sentence saying hello and that you are working.' }]
        }
      ]
    };

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      const status = response.status;
      const text = await response.text();
      console.log(`Response Status: ${status}`);
      if (response.ok) {
        const data = JSON.parse(text);
        console.log('Response content:', data.candidates?.[0]?.content?.parts?.[0]?.text);
        return; // Success!
      } else {
        console.log('Error details:', text);
      }
    } catch (err) {
      console.error('Fetch error:', err.message);
    }
  }
}

testGemini();
