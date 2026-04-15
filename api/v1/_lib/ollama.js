// Ollama Cloud APIクライアント
// Gemini の代替として Ollama Cloud を使用した気晴らし提案生成

const axios = require('axios');
const { createPrompt, parseResponse } = require('./suggestionPromptAndParse.js');

function normalizeOllamaBaseUrl(raw) {
  if (!raw) {
    return 'https://ollama.com';
  }
  let u = raw.replace(/\/+$/, '');
  if (u.endsWith('/api')) {
    u = u.slice(0, -4);
  }
  return u;
}

class OllamaClient {
  constructor() {
    this.baseUrl = normalizeOllamaBaseUrl(process.env.OLLAMA_BASE_URL);
    this.model = process.env.OLLAMA_MODEL || 'gemma4:31b-cloud';
    this.apiKey = process.env.OLLAMA_API_KEY || '';
    this.timeout = parseInt(process.env.OLLAMA_TIMEOUT || '120000');
    console.log('[OllamaClient] Initialized:', { baseUrl: this.baseUrl, model: this.model });
  }

  async generateSuggestions(situation, duration, ageGroup) {
    const maxRetries = 3;
    let lastError = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`[OllamaClient] Attempt ${attempt} - Generating suggestions...`);

        const prompt = createPrompt(situation, duration, ageGroup);
        const headers = { 'Content-Type': 'application/json' };
        if (this.apiKey) {
          headers['Authorization'] = `Bearer ${this.apiKey}`;
        }

        const response = await axios.post(
          `${this.baseUrl}/api/chat`,
          {
            model: this.model,
            messages: [
              {
                role: 'system',
                content: 'あなたは気晴らし提案の専門家です。回答はJSON配列のみを出力してください。説明文や前置きは不要です。',
              },
              {
                role: 'user',
                content: prompt,
              },
            ],
            stream: false,
            options: {
              temperature: 0.8,
              num_predict: 4096,
            },
          },
          { timeout: this.timeout, headers }
        );

        const text = response.data?.message?.content || '';
        console.log('[OllamaClient] Generation successful, length:', text.length);

        return parseResponse(text, duration, 'OllamaClient', 'ollama');

      } catch (error) {
        lastError = error;
        console.error(`[OllamaClient] Attempt ${attempt} failed:`, error.message);

        if (attempt < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        }
      }
    }

    throw lastError || new Error('Failed to generate suggestions');
  }
}

module.exports = { OllamaClient };
