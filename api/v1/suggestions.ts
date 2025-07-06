import { VercelRequest, VercelResponse } from '@vercel/node';
import { z } from 'zod';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { fallbackSuggestions } from './fallbackData';

// バリデーションスキーマ
const suggestionsQuerySchema = z.object({
  situation: z.enum(['workplace', 'home', 'outside', 'studying', 'school', 'commuting']),
  duration: z.enum(['5', '15', '30']).transform(Number),
  ageGroup: z.enum(['office_worker', 'student', 'middle_school', 'housewife', 'elderly']).optional().default('office_worker'),
});

// Geminiクライアントの初期化
let geminiClient: GoogleGenerativeAI | null = null;

function getGeminiClient(): GoogleGenerativeAI {
  if (!geminiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    console.log('Initializing Gemini client, API key present:', !!apiKey);
    if (!apiKey) {
      console.error('GEMINI_API_KEY is not set in environment variables');
      throw new Error('GEMINI_API_KEY is required');
    }
    geminiClient = new GoogleGenerativeAI(apiKey);
  }
  return geminiClient;
}

// 気晴らし提案生成
async function generateSuggestions(situation: string, duration: number, ageGroup: string = 'office_worker') {
  console.log(`Generating suggestions for situation: ${situation}, duration: ${duration}, ageGroup: ${ageGroup}`);
  
  try {
    const client = getGeminiClient();
    const model = client.getGenerativeModel({ model: 'gemini-1.5-flash' });
    console.log('Gemini model initialized successfully');

    // 年齢層別のプロンプト設定を取得
    const promptConfig = getAgeGroupPromptConfig(ageGroup);
    
    // 状況のマッピング（年齢層別）
    const situationMap = getSituationMap(ageGroup);
    
    // 前回の提案を記憶するための時間ベースのシード
    const timeSeed = new Date().toISOString().slice(0, 16); // 分単位で変化
    
    const situationLabel = situationMap[situation] || situation;

    const prompt = `${promptConfig.persona}

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
   - duration（実行時間: ${duration}）

${getActivityGuidelines(ageGroup, situation)}

以下のJSON形式で回答してください：
[
  {
    "title": "提案のタイトル",
    "description": "提案の説明",
    "category": "認知的",
    "steps": ["ステップ1", "ステップ2", "ステップ3"],
    "guide": "この気晴らし方法の詳しい実行方法と注意点を説明する案内文",
    "duration": ${duration}
  }
]

重要: コードブロック記法(\\\`\\\`\\\`)を使わず、純粋なJSON配列のみを返してください。説明文や余計な文字を含めないでください。`;

    console.log('Sending request to Gemini API...');
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    console.log('Gemini API response received, length:', text.length);
    
    // JSONパースを試行
    try {
      // Markdownコードブロックを除去
      const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/);
      const jsonText = jsonMatch ? jsonMatch[1] : text;
      
      // 直接配列をパース（suggestions プロパティではなく）
      const suggestions = JSON.parse(jsonText);
      console.log('Successfully parsed Gemini response, suggestions count:', suggestions?.length || 0);
      
      // IDを追加して返す
      return suggestions.map((suggestion: any, index: number) => ({
        ...suggestion,
        id: generateId(situation, duration, index)
      }));
    } catch (parseError) {
      console.warn('Failed to parse Gemini response as JSON:', parseError);
      console.log('Raw response:', text.substring(0, 200) + '...');
      console.log('Using fallback suggestions');
      return getFallbackSuggestions(situation, duration, ageGroup);
    }
  } catch (error) {
    console.error('Gemini API error:', error);
    console.error('Error type:', error.constructor.name);
    console.error('Error message:', error.message);
    console.log('Using fallback suggestions due to Gemini API error');
    return getFallbackSuggestions(situation, duration, ageGroup);
  }
}

/**
 * 年齢層別のプロンプト設定を取得
 */
function getAgeGroupPromptConfig(ageGroup: string) {
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
function getSituationMap(ageGroup: string): Record<string, string> {
  const baseMaps = {
    workplace: '職場',
    home: '家・自宅',
    outside: '外出先'
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
function getActivityGuidelines(ageGroup: string, situation: string): string {
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

// ユニークID生成
function generateId(situation: string, duration: number, index: number): string {
  const timestamp = Date.now();
  return `suggestion_${situation}_${duration}min_${index}_${timestamp}`;
}

// フォールバック提案
function getFallbackSuggestions(situation: string, duration: number, ageGroup: string = 'office_worker') {
  console.log(`Getting fallback suggestions for ${situation}, ${duration} minutes, ageGroup: ${ageGroup}`);
  
  const suggestions = fallbackSuggestions[situation as keyof typeof fallbackSuggestions]?.[duration as keyof any] || [];
  
  // Fisher-Yatesシャッフルで順番をランダマイズ
  function shuffle<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }
  
  // ユニークなIDを生成（タイムスタンプ + ランダム値）
  function generateUniqueId(baseId: string): string {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    return `${baseId}_${timestamp}_${random}`;
  }
  
  // シャッフルして最初の3つを選択し、ユニークなIDを付与
  const shuffled = shuffle(suggestions);
  const selected = shuffled.slice(0, 3).map(suggestion => ({
    ...suggestion,
    id: generateUniqueId(suggestion.id)
  }));
  
  console.log(`Returning ${selected.length} fallback suggestions`);
  return selected;
}

// メインハンドラー
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS設定
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({
      error: {
        message: 'Method not allowed',
        code: 'METHOD_NOT_ALLOWED'
      }
    });
  }

  try {
    // バリデーション
    const validatedQuery = suggestionsQuerySchema.parse(req.query);
    const { situation, duration, ageGroup } = validatedQuery;

    console.log(`API endpoint called - Generating suggestions for situation: ${situation}, duration: ${duration}, ageGroup: ${ageGroup}`);

    // 提案生成
    const suggestions = await generateSuggestions(situation, duration, ageGroup);
    
    console.log(`Returning ${suggestions.length} suggestions, source: ${suggestions.length > 0 ? 'gemini or fallback' : 'empty'}`);

    return res.status(200).json({
      suggestions,
      metadata: {
        situation,
        duration,
        ageGroup,
        timestamp: new Date().toISOString(),
        source: suggestions.length > 0 ? 'gemini' : 'fallback'
      }
    });
  } catch (error) {
    console.error('Error generating suggestions:', error);

    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: {
          message: 'Invalid request parameters',
          code: 'VALIDATION_ERROR',
          details: error.errors
        }
      });
    }

    return res.status(500).json({
      error: {
        message: 'Internal server error',
        code: 'INTERNAL_SERVER_ERROR'
      }
    });
  }
}