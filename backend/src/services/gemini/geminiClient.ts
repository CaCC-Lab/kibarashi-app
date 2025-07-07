import { GoogleGenerativeAI } from '@google/generative-ai';
import { logger } from '../../utils/logger';
import { EnhancedSuggestionGenerator } from '../suggestion/enhancedSuggestionGenerator';
import { createStudentPrompt, StudentPromptInput } from '../suggestion/studentPromptTemplates';
import { createJobSeekerPrompt, createCareerChangerPrompt, JobHuntingPromptInput } from '../suggestion/jobHuntingPromptTemplates';

class GeminiClient {
  private genAI: GoogleGenerativeAI;
  private model: any;
  private enhancedGenerator: EnhancedSuggestionGenerator;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not set in environment variables');
    }

    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    this.enhancedGenerator = new EnhancedSuggestionGenerator();
  }

  async generateSuggestions(
    situation: string,
    duration: number,
    ageGroup?: string,
    studentContext?: Partial<StudentPromptInput>,
    jobHuntingContext?: Partial<JobHuntingPromptInput>
  ): Promise<any[]> {
    try {
      const prompt = this.createPrompt(situation, duration, ageGroup, studentContext, jobHuntingContext);
      
      // タイムアウト付きでGemini APIを呼び出し
      const timeoutMs = process.env.NODE_ENV === 'test' ? 3000 : 10000; // テスト環境では3秒、本番では10秒
      const apiCall = this.model.generateContent(prompt);
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => {
          reject(new Error(`Gemini API timeout after ${timeoutMs}ms`));
        }, timeoutMs);
      });
      
      const result = await Promise.race([apiCall, timeoutPromise]);
      const response = await result.response;
      const text = response.text();
      
      // JSON形式のレスポンスをパース
      const suggestions = this.parseResponse(text, duration);
      logger.info('Gemini API response received', { 
        situation, 
        duration, 
        suggestionCount: suggestions.length,
        responseTime: `< ${timeoutMs}ms`
      });
      
      return suggestions;
    } catch (error) {
      logger.error('Gemini API error', { 
        error: error instanceof Error ? error.message : 'Unknown error',
        situation, 
        duration,
        stack: error instanceof Error ? error.stack : undefined
      });
      throw error;
    }
  }

  private createPrompt(situation: string, duration: number, ageGroup: string = 'office_worker', studentContext?: Partial<StudentPromptInput>, jobHuntingContext?: Partial<JobHuntingPromptInput>): string {
    // 学生の場合、詳細なプロンプト生成を使用
    if (ageGroup === 'student' && studentContext) {
      const studentInput: StudentPromptInput = {
        concern: studentContext.concern || '',
        subject: studentContext.subject || '',
        time: duration,
        situation: situation as any,
        stressFactor: studentContext.stressFactor
      };
      
      // 学生向けシナリオのマッピング
      const studentSituationMap: Record<string, 'studying' | 'school' | 'commuting' | 'beforeExam'> = {
        studying: 'studying',
        school: 'school',
        commuting: 'commuting',
        beforeExam: 'beforeExam',
        // 既存の状況を学生向けにマッピング
        workplace: 'studying',
        home: 'studying',
        outside: 'school'
      };
      
      studentInput.situation = studentSituationMap[situation] || 'studying';
      
      return createStudentPrompt(studentInput);
    }
    
    // 就活生の場合、専用のプロンプト生成を使用
    if (ageGroup === 'job_seeker' && jobHuntingContext) {
      const jobSeekerInput: JobHuntingPromptInput = {
        activityType: 'job_seeking',
        currentPhase: jobHuntingContext.currentPhase,
        concern: jobHuntingContext.concern || '',
        time: duration,
        situation: situation as any,
        stressFactor: jobHuntingContext.stressFactor,
        activityDuration: jobHuntingContext.activityDuration
      };
      
      return createJobSeekerPrompt(jobSeekerInput);
    }
    
    // 転職活動者の場合、専用のプロンプト生成を使用
    if (ageGroup === 'career_changer' && jobHuntingContext) {
      const careerChangerInput: JobHuntingPromptInput = {
        activityType: 'career_change',
        currentPhase: jobHuntingContext.currentPhase,
        concern: jobHuntingContext.concern || '',
        time: duration,
        situation: situation as any,
        stressFactor: jobHuntingContext.stressFactor,
        activityDuration: jobHuntingContext.activityDuration
      };
      
      return createCareerChangerPrompt(careerChangerInput);
    }
    
    // 年齢層別のプロンプト設定を取得
    const promptConfig = this.getAgeGroupPromptConfig(ageGroup);
    
    // 状況のマッピング（年齢層別）
    const situationMap = this.getSituationMap(ageGroup);
    
    // 前回の提案を記憶するための時間ベースのシード
    const timeSeed = new Date().toISOString().slice(0, 16); // 分単位で変化
    
    const situationLabel = situationMap[situation] || situation;

    return `${promptConfig.persona}

以下の条件で、気晴らし方法を3つ提案してください。

条件：
- 場所: ${situationLabel}
- 時間: ${duration}分
- 対象: ${promptConfig.target}
- 現在時刻: ${timeSeed}
${promptConfig.specialConsiderations ? `- 特別な配慮: ${promptConfig.specialConsiderations}` : ''}

要件：
1. 具体的で実行可能な提案
2. ${duration}分間でちょうど完了できる内容にする
3. 認知的気晴らし（頭の中で行う）と行動的気晴らし（体を動かす）をバランスよく含める
4. **重要**: 毎回異なる提案をすること。一般的すぎる提案は避け、創造的で具体的な提案を心がける
5. ${promptConfig.tone}
${promptConfig.emojiUsage === 'moderate' ? '6. 絵文字を適度に使用（各提案に1-2個）' : ''}
7. 各提案には以下を含める：
   - タイトル（20文字以内、具体的で魅力的なもの）
   - 説明（100文字程度、実際の効果や気分の変化を含める）
   - カテゴリ（"認知的" または "行動的"）
   - 具体的な手順（3-5ステップ、実行しやすい詳細な説明）
   - ガイド（実行時の詳しい案内文、200文字程度、励ましの言葉も含める）
   - ${promptConfig.scientificExplanation}
   - duration（実行時間: ${duration}）

${this.getActivityGuidelines(ageGroup, situation)}

以下のJSON形式で回答してください：
[
  {
    "title": "提案のタイトル",
    "description": "提案の説明",
    "category": "認知的",
    "steps": ["ステップ1", "ステップ2", "ステップ3"],
    "guide": "この気晴らし方法の詳しい実行方法と注意点を説明する案内文",
    "scientificBasis": "${promptConfig.scientificExplanation}",
    "duration": ${duration}
  }
]

重要: コードブロック記法(\\\`\\\`\\\`)を使わず、純粋なJSON配列のみを返してください。説明文や余計な文字を含めないでください。`;
  }

  /**
   * 年齢層別のプロンプト設定を取得
   */
  private getAgeGroupPromptConfig(ageGroup: string) {
    switch (ageGroup) {
      case 'student':
        return {
          persona: 'あなたは高校生・大学生（16-22歳）の気持ちに寄り添うAIカウンセラーです 🎓\n勉強、友人関係、将来への不安など、学生特有のストレスを理解し、\n親しみやすく実践的なアドバイスを提供してください。',
          target: '16-22歳の高校生・大学生',
          tone: '親しみやすく励ます感じで、でも軽薄すぎないように',
          emojiUsage: 'moderate',
          scientificExplanation: '科学的根拠を1-2行で簡潔に説明',
          specialConsiderations: '集中力低下、レポート締切のプレッシャー、将来不安、学業プレッシャー、人間関係の悩みに配慮'
        };
      case 'middle_school':
        return {
          persona: 'あなたは中学生（13-15歳）に寄り添う優しいカウンセラーです。\n思春期の複雑な心境を理解し、安全で実践的なアドバイスを提供してください。',
          target: '13-15歳の中学生',
          tone: '優しく寄り添う感じで、押し付けがましくない',
          emojiUsage: 'moderate',
          scientificExplanation: '簡単な科学的根拠を分かりやすく説明',
          specialConsiderations: '思春期の悩み、学校生活のストレス、親との関係、安全性を最優先'
        };
      case 'job_seeker':
        return {
          persona: 'あなたは就職活動中の若者（20-24歳）に寄り添うキャリアカウンセラーです。\n初めての就職活動の不安や緊張を理解し、前向きで実践的なアドバイスを提供してください。',
          target: '20-24歳の就職活動中の方',
          tone: '応援しながら寄り添う感じで、プレッシャーを与えない',
          emojiUsage: 'moderate',
          scientificExplanation: 'ストレス軽減効果を簡潔に説明',
          specialConsiderations: '面接前の緊張、ES作成疲れ、不採用による自己肯定感低下、周囲との比較による焦り、自己分析の難しさに配慮'
        };
      case 'career_changer':
        return {
          persona: 'あなたは転職活動中の方（25-49歳）の状況を深く理解するキャリアアドバイザーです。\n現職との両立の大変さ、キャリアの悩み、年齢や経験に応じた不安を理解し、実践的で共感的なアドバイスを提供してください。',
          target: '25-49歳の転職活動中の方',
          tone: '共感的で落ち着いた感じで、専門的かつ実用的',
          emojiUsage: 'minimal',
          scientificExplanation: 'ビジネスパーソン向けに効果を端的に説明',
          specialConsiderations: '現職との両立、給与・待遇交渉のストレス、家族の期待、不採用の連続による自信喪失、40代後半の方は管理職経験と求人ニーズのミスマッチ・給与ダウンへの葛藤に特に配慮'
        };
      case 'housewife':
        return {
          persona: 'あなたは主婦・主夫の方の気持ちに共感する実用的なアドバイザーです。\n家事や育児の負担を理解し、温かく実践的なアドバイスを提供してください。',
          target: '25-45歳の主婦・主夫',
          tone: '共感的で温かく、実用的',
          emojiUsage: 'minimal',
          scientificExplanation: '簡潔で実用的な効果説明',
          specialConsiderations: '育児制約、家事負担、自分時間の確保、家庭内での実践可能性'
        };
      case 'elderly':
        return {
          persona: 'あなたは高齢者の方に寄り添う丁寧なアドバイザーです。\n健康や生活の不安を理解し、ゆっくりと分かりやすくアドバイスを提供してください。',
          target: '65歳以上の高齢者',
          tone: '丁寧な敬語で、ゆっくりと分かりやすく',
          emojiUsage: 'none',
          scientificExplanation: '分かりやすい健康効果の説明',
          specialConsiderations: '健康への不安、体力的制約、孤独感、馴染みのある表現の使用'
        };
      default: // office_worker
        return {
          persona: 'あなたは職場のストレス解消法の専門家です。',
          target: '20-40代の職場でストレスを抱える人',
          tone: '丁寧で実践的、プロフェッショナル',
          emojiUsage: 'minimal',
          scientificExplanation: '科学的根拠を簡潔に説明',
          specialConsiderations: ''
        };
    }
  }

  /**
   * 年齢層別の状況マッピングを取得
   */
  private getSituationMap(ageGroup: string): Record<string, string> {
    const baseMaps = {
      workplace: '職場',
      home: '家・自宅',
      outside: '外出先',
      job_hunting: '就職・転職活動中'
    };

    switch (ageGroup) {
      case 'student':
        return {
          ...baseMaps,
          studying: '勉強中・勉強の合間',
          school: '学校・大学で',
          commuting: '通学中（電車・バス）'
        };
      case 'middle_school':
        return {
          ...baseMaps,
          school: '学校で'
        };
      default:
        return baseMaps;
    }
  }

  /**
   * 年齢層別の活動ガイドラインを取得
   */
  private getActivityGuidelines(ageGroup: string, _situation: string): string {
    const baseGuidelines = `既に提案したものと重複しないよう、以下のような多様な観点から考えてください：
- 五感を使った気晴らし（視覚、聴覚、触覚、嗅覚、味覚）
- 創造的な活動（描く、書く、作る、想像する）
- 身体的な活動（姿勢、動作、リズム、バランス）
- 認知的な活動（記憶、計算、パズル、言語）
- 社会的な活動（連絡、共有、感謝、つながり）
- 自然との関わり（観察、感じる、育てる）`;

    switch (ageGroup) {
      case 'student':
        return `${baseGuidelines}

学生向け特別配慮：
- 図書館、電車内、自室、学校で実践可能な内容
- 集中力向上や記憶力強化に役立つ活動
- 将来不安や学業プレッシャーの軽減に効果的な方法
- SNSや友人関係に関連した気晴らし
- 勉強に戻るための効果的な切り替え方法`;

      case 'middle_school':
        return `${baseGuidelines}

中学生向け特別配慮：
- 学校や自宅で安全に実践可能な内容
- 危険な身体活動や外出を必要とする活動は避ける
- 思春期の心理的変化に配慮した内容
- 親や先生に相談しやすい方法も含める`;

      case 'job_seeker':
        return `${baseGuidelines}

就活生向け特別配慮：
- 面接前の緊張緩和に効果的な方法（深呼吸、アファメーション、軽いストレッチ）
- 不採用通知後の気持ちの切り替え方法（感情受容、小さな達成感、気分転換）
- ES・書類作成疲れのリフレッシュ方法（目の体操、音楽、瞑想）
- 長期化する活動へのモチベーション維持方法（偉人の名言、進歩の確認、未来を想像）
- 説明会・面接の移動中でも実践可能な内容
- 自己肯定感を高める活動を重視`;

      case 'career_changer':
        return `${baseGuidelines}

転職活動者向け特別配慮：
- 現職の休憩時間や昼休みに実践可能な短時間の活動
- 面接前の緊張緩和（プレゼン準備、自信を高める方法）
- 不採用の連続による自信回復方法（経験の価値の再認識、感謝のワーク）
- 40代後半向け：キャリアの棚卸し、未来からの逆算思考、経験を価値として捉え直す活動
- 家族の期待によるプレッシャー軽減方法
- 給与・条件交渉のストレス緩和方法
- ワークライフバランスを意識した気晴らし`;

      case 'housewife':
        return `${baseGuidelines}

主婦・主夫向け特別配慮：
- 家事・育児の合間（5-15分）で実践可能
- 家庭内中心で、子供の声を考慮した静かな活動
- 家族のケアをしながらでも取り組める内容
- 自分時間の確保と気分転換に効果的な方法`;

      case 'elderly':
        return `${baseGuidelines}

高齢者向け特別配慮：
- 無理のない軽い運動や活動
- 馴染みのある文化的要素を取り入れた内容
- 健康効果が明確で安全な方法
- 地域コミュニティとのつながりを意識した活動`;

      default:
        return baseGuidelines;
    }
  }

  /**
   * 拡張提案を生成（音声ガイド対応）
   */
  async generateEnhancedSuggestions(
    situation: string,
    duration: number,
    ageGroup?: string
  ): Promise<any[]> {
    try {
      const prompt = this.enhancedGenerator.generateEnhancedPrompt(situation, duration, ageGroup);
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      // 拡張提案の配列を生成
      const enhancedSuggestions = this.parseEnhancedResponse(text, duration);
      
      logger.info('Gemini API enhanced response received', { 
        situation, 
        duration,
        ageGroup,
        suggestionCount: enhancedSuggestions.length 
      });
      
      return enhancedSuggestions;
    } catch (error) {
      logger.error('Gemini API enhanced generation error', { error, situation, duration, ageGroup });
      throw error;
    }
  }

  private parseEnhancedResponse(text: string, duration: number): any[] {
    try {
      // 複数のJSON形式に対応
      let jsonText = text.trim();
      
      // ```json ... ``` または ``` ... ``` の形式を処理
      const codeBlockMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      if (codeBlockMatch) {
        jsonText = codeBlockMatch[1].trim();
      }
      
      // Geminiレスポンスからクリーンなデータを抽出
      let parsedData;
      
      // シングルオブジェクトの場合（新形式）
      if (jsonText.startsWith('{')) {
        parsedData = JSON.parse(jsonText);
        
        // 単一の拡張提案を配列に変換
        const enhancedSuggestion = this.enhancedGenerator.convertToEnhancedSuggestion(
          JSON.stringify(parsedData),
          `enhanced-${Date.now()}`,
          duration
        );
        return [enhancedSuggestion];
      }
      
      // 従来の配列形式
      const jsonMatch = jsonText.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        throw new Error('No valid JSON found in response');
      }
      
      let cleanJson = jsonMatch[0];
      cleanJson = cleanJson.replace(/,(\s*[}\]])/g, '$1');
      
      const rawSuggestions = JSON.parse(cleanJson);
      
      if (!Array.isArray(rawSuggestions) || rawSuggestions.length === 0) {
        throw new Error('Invalid enhanced response format');
      }

      // 各提案を拡張形式に変換
      return rawSuggestions.map((suggestion: any, index: number) => {
        const id = `enhanced-${Date.now()}-${index}`;
        
        // 従来形式の場合は拡張形式に変換
        if (!suggestion.detailedSteps || !suggestion.breathingInstructions) {
          return this.enhancedGenerator.convertToEnhancedSuggestion(
            JSON.stringify(suggestion),
            id,
            duration
          );
        }
        
        // 既に拡張形式の場合はそのまま変換
        return this.enhancedGenerator.convertToEnhancedSuggestion(
          JSON.stringify(suggestion),
          id,
          duration
        );
      });
      
    } catch (error) {
      logger.error('Failed to parse enhanced Gemini response', { error, text });
      throw new Error('Failed to parse AI enhanced response');
    }
  }

  private parseResponse(text: string, duration: number): any[] {
    try {
      // Markdownコードブロックを除去
      let jsonText = text;
      
      // ```json ... ``` または ``` ... ``` の形式を処理
      const codeBlockMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      if (codeBlockMatch) {
        jsonText = codeBlockMatch[1];
      }
      
      // JSONの配列部分を抽出
      const jsonMatch = jsonText.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }
      
      // 不正なJSONを修正（末尾のカンマを除去）
      let cleanJson = jsonMatch[0];
      // 配列やオブジェクトの末尾のカンマを除去
      cleanJson = cleanJson.replace(/,(\s*[}\]])/g, '$1');
      // 空白や改行を正規化
      cleanJson = cleanJson.replace(/\n\s*\n/g, '\n');

      const suggestions = JSON.parse(cleanJson);
      
      // バリデーション
      if (!Array.isArray(suggestions) || suggestions.length === 0) {
        throw new Error('Invalid response format');
      }

      // 各提案にIDと時間を追加
      return suggestions.map((suggestion: any, index: number) => ({
        id: `gemini-${Date.now()}-${index}`,
        ...suggestion,
        duration: suggestion.duration || duration // パラメータからdurationを取得
      }));
    } catch (error) {
      logger.error('Failed to parse Gemini response', { error, text });
      throw new Error('Failed to parse AI response');
    }
  }
}

// シングルトンインスタンスは初回アクセス時に作成
let instance: GeminiClient | null = null;

export const geminiClient = {
  generateSuggestions: async (situation: 'workplace' | 'home' | 'outside' | 'studying' | 'school' | 'commuting' | 'job_hunting', duration: number, ageGroup?: string, studentContext?: Partial<StudentPromptInput>, jobHuntingContext?: Partial<JobHuntingPromptInput>) => {
    if (!instance) {
      instance = new GeminiClient();
    }
    return instance.generateSuggestions(situation, duration, ageGroup, studentContext, jobHuntingContext);
  },
  
  generateEnhancedSuggestions: async (situation: 'workplace' | 'home' | 'outside', duration: number, ageGroup?: string) => {
    if (!instance) {
      instance = new GeminiClient();
    }
    return instance.generateEnhancedSuggestions(situation, duration, ageGroup);
  }
};