// 気晴らし提案: プロンプト生成と AI 応答パースの共有ロジック（Gemini / Ollama クライアント用）

function createPrompt(situation, duration, ageGroup) {
  const situationMap = {
    workplace: '職場',
    home: '家',
    outside: '外出先',
    job_hunting: '就職・転職活動中'
  };

  const ageGroupMap = {
    office_worker: '20-40代の社会人',
    job_hunting: '就職・転職活動中の方',
    job_hunting_new_grad: '就職活動中の学生',
    job_hunting_career: '転職活動中の方',
    student: '学生',
    general: '一般の方',
    senior: 'シニア世代'
  };

  const locationText = situationMap[situation] || '職場';
  const targetText = ageGroupMap[ageGroup] || '20-40代の社会人';

  if (ageGroup === 'job_hunting' || ageGroup === 'job_hunting_new_grad' || ageGroup === 'job_hunting_career' || situation === 'job_hunting') {
    return createJobHuntingPrompt(duration);
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

function createJobHuntingPrompt(duration) {
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

function parseResponse(text, duration, logPrefix, idPrefix) {
  try {
    console.log(`[${logPrefix}] Parsing response, length:`, text?.length);

    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch (e1) {
      const codeBlockMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
      const cleanText = codeBlockMatch ? codeBlockMatch[1].trim() : text.trim();
      const fixedText = cleanText.replace(/,(\s*[}\]])/g, '$1');
      try {
        parsed = JSON.parse(fixedText);
      } catch (e2) {
        const arrayMatch = fixedText.match(/\[[\s\S]*\]/);
        if (arrayMatch) {
          parsed = JSON.parse(arrayMatch[0].replace(/,(\s*[}\]])/g, '$1'));
        } else {
          console.error(`[${logPrefix}] Cannot parse. Raw:`, text?.substring(0, 1000));
          throw new Error('No valid JSON found');
        }
      }
    }

    let suggestions;
    if (Array.isArray(parsed)) {
      suggestions = parsed;
    } else if (parsed && Array.isArray(parsed.suggestions)) {
      suggestions = parsed.suggestions;
    } else if (parsed && typeof parsed === 'object') {
      const arrayKey = Object.keys(parsed).find(k => Array.isArray(parsed[k]));
      suggestions = arrayKey ? parsed[arrayKey] : null;
    }

    if (!suggestions || !Array.isArray(suggestions) || suggestions.length === 0) {
      console.error(`[${logPrefix}] No suggestions found in:`, JSON.stringify(parsed)?.substring(0, 500));
      throw new Error('No suggestions in parsed response');
    }

    console.log(`[${logPrefix}] Parsed`, suggestions.length, 'suggestions');
    return normalizeSuggestions(suggestions, duration, idPrefix);

  } catch (error) {
    console.error(`[${logPrefix}] Parse error:`, error.message);
    throw new Error(`Failed to parse AI response: ${error.message}`);
  }
}

function normalizeSuggestions(suggestions, duration, idPrefix) {
  if (!Array.isArray(suggestions) || suggestions.length === 0) {
    throw new Error('No suggestions in response');
  }
  return suggestions.slice(0, 3).map((suggestion, index) => ({
    id: `${idPrefix}-${Date.now()}-${index}`,
    title: suggestion.title || '気晴らし提案',
    description: suggestion.description || '',
    duration: duration,
    category: suggestion.category || '認知的',
    steps: Array.isArray(suggestion.steps) ? suggestion.steps : []
  }));
}

module.exports = {
  createPrompt,
  createJobHuntingPrompt,
  parseResponse,
  normalizeSuggestions
};
