// CLAUDE-GENERATED: Gemini APIクライアント
// Google Generative AIを使用した動的な気晴らし提案生成

const { GoogleGenerativeAI } = require('@google/generative-ai');

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
        model: 'gemini-1.5-flash',
        generationConfig: {
          temperature: 0.9,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 2048,
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
        
        const prompt = this.createPrompt(situation, duration, ageGroup);
        const result = await this.model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        
        console.log('[GeminiClient] Generation successful');
        
        // 成功したらキーの失敗カウントをリセット
        this.keyManager.markSuccess(this.keyManager.getCurrentKey());
        
        return this.parseResponse(text, duration);
        
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
  
  createPrompt(situation, duration, ageGroup) {
    const situationMap = {
      workplace: '職場',
      home: '家',
      outside: '外出先',
      job_hunting: '就職・転職活動中'
    };
    
    const ageGroupMap = {
      office_worker: '20-40代の社会人',
      job_hunting: '就職・転職活動中の方',
      student: '学生',
      senior: 'シニア世代'
    };
    
    const locationText = situationMap[situation] || '職場';
    const targetText = ageGroupMap[ageGroup] || '20-40代の社会人';
    
    // 就活・転職活動者向けの特別なプロンプト
    if (ageGroup === 'job_hunting' || situation === 'job_hunting') {
      return this.createJobHuntingPrompt(duration);
    }
    
    return `あなたは職場でのストレス解消と気晴らしの専門家です。
以下の条件で、実践しやすく効果的な気晴らし方法を3つ提案してください。

【条件】
- 場所: ${locationText}
- 時間: ${duration}分
- 対象: ${targetText}
- 状況: 仕事のストレスや人間関係の疲れを感じている

【提案のガイドライン】
1. 認知的気晴らし（頭の中で行う）と行動的気晴らし（具体的な行動を伴う）をバランスよく含める
2. ${duration}分で完結できる現実的な内容にする
3. 特別な道具や準備が不要なものを優先する
4. ストレス解消効果が期待できる科学的根拠があるものが望ましい

【重要】
必ず以下のJSON形式で、3つの提案を配列として返してください。他の説明文は不要です：

[
  {
    "title": "提案のタイトル（20文字以内）",
    "description": "簡潔な説明（50文字以内）",
    "category": "認知的",
    "steps": ["ステップ1", "ステップ2", "ステップ3", "ステップ4", "ステップ5"]
  },
  {
    "title": "提案のタイトル",
    "description": "簡潔な説明",
    "category": "行動的",
    "steps": ["ステップ1", "ステップ2", "ステップ3", "ステップ4", "ステップ5"]
  },
  {
    "title": "提案のタイトル",
    "description": "簡潔な説明",
    "category": "認知的または行動的",
    "steps": ["ステップ1", "ステップ2", "ステップ3", "ステップ4", "ステップ5"]
  }
]`;
  }
  
  createJobHuntingPrompt(duration) {
    return `あなたは就職・転職活動のストレスケア専門家です。
以下の条件で、就活・転職活動中の方向けの気晴らし方法を3つ提案してください。

【条件】
- 時間: ${duration}分
- 対象: 就職・転職活動中でストレスを感じている方
- 想定される状況:
  - 面接前の緊張
  - 不採用通知後の落ち込み
  - 書類作成の疲れ
  - 長期化による焦りや不安

【提案のガイドライン】
1. 就活・転職活動特有のストレスに効果的な方法
2. 自己肯定感を高める要素を含む
3. 次の活動へのモチベーションにつながる
4. どこでも実践できる内容

【重要】
必ず以下のJSON形式で、3つの提案を配列として返してください：

[
  {
    "title": "提案のタイトル（20文字以内）",
    "description": "簡潔な説明（50文字以内）",
    "category": "認知的",
    "steps": ["ステップ1", "ステップ2", "ステップ3", "ステップ4", "ステップ5"]
  },
  {
    "title": "提案のタイトル",
    "description": "簡潔な説明",
    "category": "行動的",
    "steps": ["ステップ1", "ステップ2", "ステップ3", "ステップ4", "ステップ5"]
  },
  {
    "title": "提案のタイトル",
    "description": "簡潔な説明",
    "category": "認知的または行動的",
    "steps": ["ステップ1", "ステップ2", "ステップ3", "ステップ4", "ステップ5"]
  }
]`;
  }
  
  parseResponse(text, duration) {
    try {
      console.log('[GeminiClient] Parsing response...');
      
      // Markdownコードブロックを除去
      let cleanText = text;
      if (text.includes('```json')) {
        cleanText = text.replace(/```json\s*/, '').replace(/```\s*$/, '');
      } else if (text.includes('```')) {
        cleanText = text.replace(/```\s*/, '').replace(/```\s*$/, '');
      }
      
      // JSON配列を抽出
      const jsonMatch = cleanText.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        throw new Error('No JSON array found in response');
      }
      
      const suggestions = JSON.parse(jsonMatch[0]);
      
      // バリデーションと正規化
      if (!Array.isArray(suggestions)) {
        throw new Error('Response is not an array');
      }
      
      if (suggestions.length === 0) {
        throw new Error('No suggestions in response');
      }
      
      // 最大3つまで、必要なフィールドを確保
      return suggestions.slice(0, 3).map((suggestion, index) => ({
        id: `gemini-${Date.now()}-${index}`,
        title: suggestion.title || '気晴らし提案',
        description: suggestion.description || '',
        duration: duration,
        category: suggestion.category || '認知的',
        steps: Array.isArray(suggestion.steps) ? suggestion.steps : []
      }));
      
    } catch (error) {
      console.error('[GeminiClient] Parse error:', error.message);
      console.error('[GeminiClient] Raw response:', text?.substring(0, 500));
      throw new Error(`Failed to parse AI response: ${error.message}`);
    }
  }
}

module.exports = { GeminiClient };