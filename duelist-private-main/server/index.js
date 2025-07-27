
require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
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
        model: 'gpt-3.5-turbo',
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

app.get('/', (req, res) => {
  res.send('OpenAI proxy server running');
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
