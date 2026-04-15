// CLAUDE-GENERATED: Gemini APIクライアント
// Google Generative AIを使用した動的な気晴らし提案生成

const { GoogleGenerativeAI } = require('@google/generative-ai');
const { createPrompt, parseResponse } = require('./suggestionPromptAndParse.js');

class GeminiClient {
  constructor(apiKeyManager) {
    this.keyManager = apiKeyManager;
    this.genAI = null;
    this.model = null;
    this.initializeClient();
  }
  
  initializeClient() {
    try {
      const apiKey = this.keyManager.getCurrentKey();
      this.genAI = new GoogleGenerativeAI(apiKey);
      this.model = this.genAI.getGenerativeModel({
        model: 'gemini-2.5-flash',
        generationConfig: {
          temperature: 0.9,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 2048,
          responseMimeType: 'application/json',
        }
      });
      console.log('[GeminiClient] Initialized successfully');
    } catch (error) {
      console.error('[GeminiClient] Initialization error:', error.message);
      throw error;
    }
  }
  
  async generateSuggestions(situation, duration, ageGroup) {
    const maxRetries = 3;
    let lastError = null;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`[GeminiClient] Attempt ${attempt} - Generating suggestions...`);
        
        const prompt = createPrompt(situation, duration, ageGroup);
        const result = await this.model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        
        console.log('[GeminiClient] Generation successful');
        
        // 成功したらキーの失敗カウントをリセット
        this.keyManager.markSuccess(this.keyManager.getCurrentKey());
        
        return parseResponse(text, duration, 'GeminiClient', 'gemini');
        
      } catch (error) {
        lastError = error;
        console.error(`[GeminiClient] Attempt ${attempt} failed:`, error.message);
        
        if (attempt < maxRetries) {
          // キーローテーションを試す
          const newKey = this.keyManager.markFailure(this.keyManager.getCurrentKey());
          
          // 新しいキーでクライアントを再初期化
          if (newKey !== this.keyManager.getCurrentKey()) {
            this.initializeClient();
          }
          
          // リトライ前に少し待機
          await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        }
      }
    }
    
    throw lastError || new Error('Failed to generate suggestions');
  }
}

module.exports = { GeminiClient };
