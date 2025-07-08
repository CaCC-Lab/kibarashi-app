/**
 * 拡張提案生成サービス
 * 画面表示用と音声ガイド用のコンテンツを分離生成
 */

import { RelaxationGuideBuilder } from '../audio/ssmlBuilder.js';

interface EnhancedSuggestionData {
  id: string;
  title: string;
  description: string;
  duration: number;
  category: '認知的' | '行動的';
  
  // 画面表示用（簡潔）
  displaySteps: string[];
  displayGuide: string;
  
  // 音声ガイド用（詳細）
  detailedSteps: string[];
  breathingInstructions?: string[];
  encouragementPhases?: string[];
  timingCues?: string[];
}

interface VoiceSegment {
  id: string;
  type: 'intro' | 'main' | 'transition' | 'encouragement' | 'closing';
  text: string;
  ssml: string;
  duration: number;
  startTime?: number;
  autoPlay?: boolean;
}

interface VoiceGuideScript {
  totalDuration: number;
  segments: VoiceSegment[];
  settings: {
    pauseBetweenSegments: number;
    detailLevel: 'simple' | 'standard' | 'detailed';
    includeEncouragement: boolean;
    breathingCues: boolean;
  };
}

export class EnhancedSuggestionGenerator {
  private ssmlBuilder: RelaxationGuideBuilder;

  constructor() {
    this.ssmlBuilder = new RelaxationGuideBuilder();
  }

  /**
   * Gemini API用のプロンプト生成（画面表示と音声ガイドの分離）
   */
  generateEnhancedPrompt(situation: string, duration: number, ageGroup?: string): string {
    const basePrompt = `
${ageGroup === 'student' ? '高校生・大学生' : '社会人'}向けの${situation}で${duration}分でできる気晴らし方法を提案してください。

以下のJSON形式で、画面表示用と音声ガイド用を分けて生成してください：

{
  "title": "提案のタイトル",
  "description": "簡潔な説明（1-2文）",
  "category": "認知的 または 行動的",
  "displaySteps": [
    "画面表示用の簡潔なステップ1",
    "画面表示用の簡潔なステップ2"
  ],
  "displayGuide": "画面表示用の簡潔なガイド（1-2文）",
  "detailedSteps": [
    "音声ガイド用の詳細なステップ1（呼吸の仕方、具体的な動作、時間配分を含む）",
    "音声ガイド用の詳細なステップ2（ペース、注意点、コツを含む）"
  ],
  "breathingInstructions": [
    "鼻からゆっくりと4秒かけて息を吸い込みます",
    "7秒間息を止めます",
    "口からゆっくりと8秒かけて息を吐き出します"
  ],
  "encouragementPhases": [
    "とても良い調子です。この調子で続けましょう",
    "リラックスできていますね。集中を保ちましょう"
  ],
  "timingCues": [
    "開始から2分経過：深呼吸を意識しましょう",
    "半分地点：体の緊張が解けているのを感じてください",
    "終了1分前：徐々に現実に意識を戻していきましょう"
  ]
}

重要な要件：
1. displayStepsは視覚的に理解しやすい簡潔な表現
2. detailedStepsは音声で聞いて理解できる詳細な説明
3. 呼吸指示は具体的な秒数とペースを含める
4. 励ましの言葉は自然で温かい表現
5. タイミングキューは${duration}分の実行時間に合わせて配置
6. ${situation}の環境制約を考慮した実践的な内容
`;

    return basePrompt;
  }

  /**
   * 拡張提案データから音声ガイドスクリプトを生成
   */
  generateVoiceGuideScript(
    data: EnhancedSuggestionData,
    detailLevel: 'simple' | 'standard' | 'detailed' = 'standard'
  ): VoiceGuideScript {
    const segments: VoiceSegment[] = [];
    let currentTime = 0;

    // 1. イントロセグメント（30秒）
    const introSSML = this.ssmlBuilder.createIntro(data.title, data.duration * 60);
    segments.push({
      id: `${data.id}_intro`,
      type: 'intro',
      text: `それでは、${data.title}を始めましょう。${data.duration}分間、ゆっくりとリラックスして行いましょう。`,
      ssml: introSSML,
      duration: 30,
      startTime: currentTime,
      autoPlay: true
    });
    currentTime += 30;

    // 2. メインガイドセグメント
    const mainDuration = (data.duration * 60) - 60; // 全体時間 - イントロ30秒 - 締め30秒
    const stepDuration = Math.floor(mainDuration / data.detailedSteps.length);

    data.detailedSteps.forEach((step, index) => {
      // stepがオブジェクトの場合はinstructionプロパティを使用、文字列の場合はそのまま使用
      const stepText = typeof step === 'object' && step !== null && 'instruction' in step 
        ? step.instruction 
        : typeof step === 'string' 
        ? step 
        : String(step);
      
      const mainSSML = this.ssmlBuilder.createMainGuide([stepText]);
      segments.push({
        id: `${data.id}_main_${index}`,
        type: 'main',
        text: stepText,
        ssml: mainSSML,
        duration: stepDuration,
        startTime: currentTime,
        autoPlay: true
      });
      currentTime += stepDuration;

      // 詳細レベルが'detailed'の場合、ステップ間に励ましを追加
      if (detailLevel === 'detailed' && index < data.detailedSteps.length - 1) {
        const encouragementSSML = this.ssmlBuilder.createEncouragement();
        segments.push({
          id: `${data.id}_encouragement_${index}`,
          type: 'encouragement',
          text: 'とても良くできています。このまま続けましょう。',
          ssml: encouragementSSML,
          duration: 10,
          startTime: currentTime,
          autoPlay: true
        });
        currentTime += 10;
      }
    });

    // 3. 締めくくりセグメント（30秒）
    const closingSSML = this.ssmlBuilder.createClosing();
    segments.push({
      id: `${data.id}_closing`,
      type: 'closing',
      text: 'お疲れさまでした。気持ちが少しでも軽くなったでしょうか。またいつでも、お気軽にご利用ください。',
      ssml: closingSSML,
      duration: 30,
      startTime: currentTime,
      autoPlay: true
    });

    return {
      totalDuration: data.duration * 60,
      segments,
      settings: {
        pauseBetweenSegments: detailLevel === 'detailed' ? 2 : 1,
        detailLevel,
        includeEncouragement: detailLevel !== 'simple',
        breathingCues: data.breathingInstructions ? data.breathingInstructions.length > 0 : false
      }
    };
  }

  /**
   * Gemini APIレスポンスを拡張提案形式に変換
   */
  convertToEnhancedSuggestion(
    geminiResponse: string,
    id: string,
    duration: number
  ): any {
    try {
      // JSONの抽出（マークダウンコードブロックを削除）
      const jsonMatch = geminiResponse.match(/```json\n([\s\S]*?)\n```/) || 
                       geminiResponse.match(/```\n([\s\S]*?)\n```/) ||
                       [null, geminiResponse];
      
      const jsonStr = jsonMatch[1] || geminiResponse;
      const suggestionData: EnhancedSuggestionData = JSON.parse(jsonStr.trim());

      // IDと継続時間を設定
      suggestionData.id = id;
      suggestionData.duration = duration;

      // 音声ガイドスクリプトを生成
      const voiceGuideScript = this.generateVoiceGuideScript(suggestionData);

      // 拡張提案オブジェクトを構築
      return {
        id: suggestionData.id,
        title: suggestionData.title,
        description: suggestionData.description,
        duration: suggestionData.duration,
        category: suggestionData.category,
        
        // 従来形式（後方互換性）
        steps: suggestionData.displaySteps,
        guide: suggestionData.displayGuide,
        
        // 新形式（画面表示用）
        displaySteps: suggestionData.displaySteps,
        displayGuide: suggestionData.displayGuide,
        
        // 音声ガイド用
        voiceGuideScript,
        
        // アクセシビリティ
        accessibility: {
          hasSubtitles: true,
          keyboardNavigable: true,
          screenReaderOptimized: true
        }
      };

    } catch (error) {
      console.error('Enhanced suggestion conversion error:', error);
      
      // フォールバック：従来形式の提案を拡張形式に変換
      return this.createFallbackEnhancedSuggestion(id, duration);
    }
  }

  /**
   * フォールバック用の拡張提案を作成
   */
  private createFallbackEnhancedSuggestion(id: string, duration: number): any {
    const fallbackData: EnhancedSuggestionData = {
      id,
      title: `${duration}分間のリラックス`,
      description: '深呼吸と軽いストレッチで心身をリフレッシュしましょう',
      duration,
      category: '認知的',
      displaySteps: [
        '快適な姿勢を取る',
        '深呼吸を行う',
        '体の緊張をほぐす'
      ],
      displayGuide: '深呼吸に集中して、体の力を抜いてリラックスしましょう',
      detailedSteps: [
        '椅子に深く座るか、床に横になって、背筋をまっすぐにして快適な姿勢を取ります。肩の力を抜いて、自然にリラックスしましょう',
        '鼻からゆっくりと4秒かけて息を吸い込み、4秒間息を止めて、口からゆっくりと6秒かけて息を吐き出します。このリズムを繰り返します',
        '頭のてっぺんから足先まで、体の各部位に意識を向けて、緊張している箇所があれば意識的にほぐしていきましょう'
      ],
      breathingInstructions: [
        '鼻からゆっくりと4秒かけて息を吸い込みます',
        '4秒間息を止めます',
        '口からゆっくりと6秒かけて息を吐き出します'
      ],
      encouragementPhases: [
        'とても良い調子です。リラックスできていますね',
        'この調子で続けましょう。心が落ち着いてきました'
      ]
    };

    const voiceGuideScript = this.generateVoiceGuideScript(fallbackData);

    return {
      id: fallbackData.id,
      title: fallbackData.title,
      description: fallbackData.description,
      duration: fallbackData.duration,
      category: fallbackData.category,
      steps: fallbackData.displaySteps,
      guide: fallbackData.displayGuide,
      displaySteps: fallbackData.displaySteps,
      displayGuide: fallbackData.displayGuide,
      voiceGuideScript,
      accessibility: {
        hasSubtitles: true,
        keyboardNavigable: true,
        screenReaderOptimized: true
      }
    };
  }
}