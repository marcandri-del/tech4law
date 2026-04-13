// ========================================
// DZ LAW HUB - Backend API Proxy
// ========================================
// This keeps your Gemini API key SECRET on the server.
// Deploy this FREE on: https://render.com or https://railway.app
//
// Setup:
//   1. npm install in this /backend folder
//   2. Set GEMINI_API_KEY as environment variable on your hosting
//   3. Update FRONTEND_URL below to your deployed frontend URL
// ========================================

const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
const PORT = process.env.PORT || 4000;

// ✅ Only allow requests from your frontend domain
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

app.use(cors({
  origin: [FRONTEND_URL, 'http://localhost:3000'],
  methods: ['POST', 'GET'],
}));
app.use(express.json({ limit: '10mb' })); // 10mb for image uploads

// ✅ Health check
app.get('/', (req, res) => {
  res.json({ status: 'DZ LAW HUB API is running ✅', model: 'gemini-1.5-flash' });
});

// ✅ Main proxy endpoint - key never leaves the server
app.post('/api/chat', async (req, res) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'GEMINI_API_KEY not set on server' });
  }

  try {
    const { contents, systemInstruction, history, message } = req.body;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: contents || [{ role: 'user', parts: [{ text: message }] }],
          systemInstruction: systemInstruction ? { parts: [{ text: systemInstruction }] } : undefined,
          generationConfig: { maxOutputTokens: 2048 }
        })
      }
    );

    if (!response.ok) {
      const err = await response.json();
      return res.status(response.status).json({ error: err });
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    res.json({ text });

  } catch (error) {
    console.error('Proxy error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(PORT, () => {
  console.log(`✅ DZ LAW HUB proxy running on port ${PORT}`);
});
