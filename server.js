const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const axios = require('axios');

// Initialize Express app
const app = express();
const port = 3001;

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/translationDB', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.log("MongoDB connection error: ", err));

// Middlewares
app.use(bodyParser.json());

// MongoDB Schema
const TranslationSchema = new mongoose.Schema({
  inputText: String,
  targetLanguage: String,
  translatedText: String,
});

const Translation = mongoose.model('Translation', TranslationSchema);

// Translation route
app.post('/translate', async (req, res) => {
  const { inputText, targetLanguage } = req.body;
  let translatedText = '';

  try {
    // Call translation API (e.g., Deepl or Google Translate API)
    const response = await axios.post('https://api-free.deepl.com/v2/translate', null, {
      params: {
        auth_key: 'YOUR_DEEPL_API_KEY', // Replace with your Deepl API key
        text: inputText,
        target_lang: targetLanguage.toUpperCase(),
      },
    });
    
    translatedText = response.data.translations[0].text;
  } catch (error) {
    console.error('Translation error:', error);
    translatedText = 'Translation failed'; // Store a message if translation fails
  }

  // Save input text, target language, and translated text in MongoDB
  const newTranslation = new Translation({
    inputText,
    targetLanguage,
    translatedText,
  });

  try {
    await newTranslation.save();
    res.json({ translatedText });
  } catch (saveError) {
    console.error('Error saving to MongoDB:', saveError);
    res.status(500).send('Failed to save data to MongoDB');
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
