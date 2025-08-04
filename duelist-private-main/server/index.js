require('dotenv').config();
console.log('OPENAI_API_KEY at startup:', process.env.OPENAI_API_KEY);
const express = require('express');
const cors = require('cors');


const { chatWithOpenRouter } = require('./openrouter');
const app = express();
const PORT = process.env.PORT || 3001;

// Allow both local and production frontends
const allowedOrigins = [
  'http://localhost:8081',
  'https://duelist-app-indol.vercel.app',
  'https://duelist-app-git-master-megheshs-projects-6a5cfef4.vercel.app',
];
app.use(cors({
  origin: function (origin, callback) {
    // allow requests with no origin (like mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      return callback(new Error('Not allowed by CORS'));
    }
  },
}));
app.use(express.json());

// Proxy endpoint for OpenAI
app.post('/openai', async (req, res) => {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'OpenAI API key not set in server .env' });
    }
    const { messages, ...rest } = req.body;
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'mistralai/mistral-7b-instruct:free',
        messages,
        ...rest
      })
    });
    const data = await response.json();
    console.log('OpenAI API response:', JSON.stringify(data));
    if (!response.ok) {
      console.error('OpenAI API error:', response.status, data);
    }
    res.status(response.status).json(data);
  } catch (err) {
    console.error('Server error:', err);
    res.status(500).json({ error: err.message });
  }
});
app.post('/api/openrouter/chat', async (req, res) => {
  try {
    const { messages, model } = req.body;
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'messages (array) is required' });
    }
    const data = await chatWithOpenRouter(messages, model);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/', (req, res) => {
  res.send('OpenAI proxy server running');
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
