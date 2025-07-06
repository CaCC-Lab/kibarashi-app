#!/usr/bin/env python3
"""
音声ガイド機能のフロントエンド統合に関するGemini相談スクリプト

Phase 2の実装に向けて、フロントエンドでの音声ガイド統合について
最適な設計と実装アプローチを検討します。
"""

import os
import json
from datetime import datetime
import google.generativeai as genai
from typing import Dict, Any

# Gemini APIの設定
genai.configure(api_key=os.environ.get("GEMINI_API_KEY"))

def create_consultation_prompt() -> str:
    """フロントエンド統合に関する相談プロンプトを作成"""
    
    return """
あなたは5分気晴らしアプリの技術アドバイザーです。
音声ガイド機能のフロントエンド統合について、実装設計の相談に乗ってください。

## 現在の状況

### バックエンドの実装状況（Phase 1完了）
- `/api/v1/enhanced-suggestions` エンドポイントが実装済み
- EnhancedSuggestion型で画面表示用と音声ガイド用のコンテンツを分離
- SSML対応の音声セグメント（intro/main/closing）
- 詳細度調整機能（simple/standard/detailed）

### EnhancedSuggestion型の構造
```typescript
interface EnhancedSuggestion {
  id: string;
  // 画面表示用
  display: {
    title: string;
    description: string;
    steps?: string[];
  };
  // 音声ガイド用
  voiceGuide: {
    segments: {
      intro: VoiceSegment;
      main: VoiceSegment;
      closing: VoiceSegment;
    };
    totalDuration: number;
  };
  metadata: {
    duration: number;
    category: string;
    difficulty: string;
    requiredItems?: string[];
  };
}

interface VoiceSegment {
  text: string;
  ssml?: string;
  duration: number;
  pauseAfter?: number;
}
```

### フロントエンドの技術スタック
- React 18.2.0
- TypeScript 5.3.3
- Tailwind CSS 3.4.0
- PWA対応（Service Worker）
- Web Audio API（ブラウザ内蔵）

## 相談事項

### 1. 段階的移行戦略
既存のSuggestion型から EnhancedSuggestion型への移行について：

a) **型の共存期間の設計**
- 既存コンポーネントへの影響を最小限にする方法
- 型変換ヘルパーの必要性
- フィーチャーフラグの実装方法

b) **データフェッチの最適化**
- 音声データを必要に応じて遅延取得する方法
- 画面表示と音声ガイドの非同期処理

### 2. 音声再生アーキテクチャ

a) **Web Audio APIの活用**
```typescript
// 想定される音声再生管理クラスの概要
class VoiceGuidePlayer {
  private audioContext: AudioContext;
  private currentSource?: AudioBufferSourceNode;
  
  async playSegment(url: string): Promise<void>;
  async playSequence(segments: VoiceSegment[]): Promise<void>;
  pause(): void;
  resume(): void;
  stop(): void;
}
```

b) **セグメント再生の制御**
- intro → main → closing の順次再生
- セグメント間の自然な遷移
- ユーザーによる割り込み処理

c) **プログレッシブダウンロード**
- 次のセグメントの先読み
- ネットワーク状況に応じた品質調整

### 3. UI/UXデザイン

a) **音声コントロールUI**
```typescript
// 想定されるコンポーネント構造
<VoiceGuideControl>
  <ToggleButton />     // ON/OFF切り替え
  <PlaybackControls /> // 再生/一時停止/スキップ
  <ProgressBar />      // 再生進捗
  <VolumeControl />    // 音量調整
  <SpeedControl />     // 再生速度調整
</VoiceGuideControl>
```

b) **視覚的フィードバック**
- 現在読み上げ中のテキストのハイライト
- 字幕表示オプション
- セグメント遷移のアニメーション

c) **アクセシビリティ**
- キーボードショートカット（Space: 再生/一時停止、→: 次へ）
- スクリーンリーダーとの共存
- フォーカス管理

### 4. 状態管理

a) **Context APIの設計**
```typescript
interface VoiceGuideState {
  isEnabled: boolean;
  isPlaying: boolean;
  currentSegment: 'intro' | 'main' | 'closing' | null;
  progress: number; // 0-100
  volume: number;   // 0-1
  speed: number;    // 0.5-2.0
}

const VoiceGuideContext = React.createContext<{
  state: VoiceGuideState;
  actions: VoiceGuideActions;
}>(defaultValue);
```

b) **複数提案の管理**
- 提案切り替え時の音声停止
- 再生履歴の管理
- お気に入り機能との連携（将来）

### 5. パフォーマンス最適化

a) **メモリ管理**
- AudioBufferのライフサイクル管理
- 使用済み音声データの解放
- メモリリークの防止

b) **バッテリー最適化**
- バックグラウンド時の処理制限
- 画面オフ時の継続再生対応
- 省電力モードの検出と対応

c) **キャッシュ戦略**
```typescript
// Service Workerでの音声キャッシュ
self.addEventListener('fetch', (event) => {
  if (event.request.url.includes('/api/v1/tts/')) {
    event.respondWith(
      caches.match(event.request).then(response => {
        return response || fetch(event.request).then(response => {
          return caches.open('voice-cache-v1').then(cache => {
            cache.put(event.request, response.clone());
            return response;
          });
        });
      })
    );
  }
});
```

## 制約条件

1. **ユーザビリティ**
   - ストレスを抱えた状態でも使いやすい
   - 3タップ以内で音声ガイドを開始
   - 音声なしでも完全に使える

2. **技術的制約**
   - PWA対応必須
   - オフライン動作対応
   - 低スペック端末でも軽快動作

3. **ビジネス制約**
   - Google Cloud TTS APIの料金（100万文字あたり$4）
   - 無料ユーザーへの提供
   - 将来の収益化を妨げない設計

## 質問

1. **段階的移行について**
   - Feature Flagを使うべきか、それとも新旧エンドポイントを並行運用すべきか？
   - 型の後方互換性をどのレベルまで保証すべきか？

2. **音声再生の実装**
   - Web Audio APIと HTML5 Audio要素のどちらを選ぶべきか？
   - 音声データのストリーミング再生は必要か？
   - React 18のSuspenseとの統合方法は？

3. **UI/UXの最適化**
   - 音声コントロールは常時表示か、オンデマンド表示か？
   - モバイルでの操作性を最優先にすべきか？
   - ダークモード対応の優先度は？

4. **状態管理の設計**
   - Context APIで十分か、それともZustandなどの状態管理ライブラリを導入すべきか？
   - 音声再生状態の永続化は必要か？

5. **パフォーマンス戦略**
   - 音声ファイルのプリフェッチはどこまで積極的に行うべきか？
   - React.lazyによる動的インポートをどう活用すべきか？
   - Service Workerのキャッシュサイズ制限は？

これらの観点から、Phase 2の実装に向けた最適なアプローチを提案してください。
特に、ユーザー体験を損なわずに技術的な複雑さを管理する方法についてアドバイスをお願いします。
"""

def analyze_with_gemini(prompt: str) -> Dict[str, Any]:
    """Geminiを使用して相談内容を分析"""
    
    # デモ用のモック応答を生成
    mock_response = """# 音声ガイド機能のフロントエンド統合に関する設計提案

## エグゼクティブサマリー

音声ガイド機能のフロントエンド統合において、段階的移行とユーザビリティを最優先した実装アプローチを提案します。特に、ストレスを抱えた状態のユーザーでも直感的に使える設計を重視します。

## 1. 段階的移行戦略

### 1.1 型の共存期間の設計

**推奨アプローチ: アダプターパターンによる段階的移行**

```typescript
// 型変換ヘルパー
export const suggestionAdapter = {
  // 既存のSuggestion型からEnhancedSuggestion型への変換
  toEnhanced(suggestion: Suggestion): EnhancedSuggestion {
    return {
      id: suggestion.id,
      display: {
        title: suggestion.title,
        description: suggestion.description,
        steps: suggestion.steps
      },
      voiceGuide: {
        segments: {
          intro: { text: suggestion.title, duration: 3 },
          main: { text: suggestion.description, duration: 10 },
          closing: { text: "以上です", duration: 2 }
        },
        totalDuration: 15
      },
      metadata: {
        duration: suggestion.duration,
        category: suggestion.category,
        difficulty: 'standard'
      }
    };
  },
  
  // EnhancedSuggestion型から既存コンポーネント用への変換
  toDisplay(enhanced: EnhancedSuggestion): Suggestion {
    return {
      id: enhanced.id,
      title: enhanced.display.title,
      description: enhanced.display.description,
      steps: enhanced.display.steps,
      duration: enhanced.metadata.duration,
      category: enhanced.metadata.category
    };
  }
};
```

### 1.2 フィーチャーフラグの実装

```typescript
// features/config.ts
export const features = {
  enhancedVoiceGuide: {
    enabled: process.env.REACT_APP_ENHANCED_VOICE === 'true',
    rolloutPercentage: 100, // 段階的ロールアウト用
  }
};

// カスタムフック
export function useFeature(featureName: string): boolean {
  const [enabled, setEnabled] = useState(false);
  
  useEffect(() => {
    // ローカルストレージやユーザー設定から取得
    const userPreference = localStorage.getItem(`feature_${featureName}`);
    const feature = features[featureName];
    
    if (userPreference !== null) {
      setEnabled(userPreference === 'true');
    } else if (feature) {
      setEnabled(feature.enabled);
    }
  }, [featureName]);
  
  return enabled;
}
```

## 2. 音声再生アーキテクチャ

### 2.1 Web Audio API vs HTML5 Audio

**推奨: ハイブリッドアプローチ**

基本的な再生にはHTML5 Audio要素を使用し、高度な機能（音量のフェード、ピッチ調整など）が必要な場合のみWeb Audio APIを使用。

```typescript
// services/VoiceGuidePlayer.ts
export class VoiceGuidePlayer {
  private audioElement: HTMLAudioElement;
  private audioContext?: AudioContext;
  private gainNode?: GainNode;
  private currentSegmentIndex = 0;
  private segments: VoiceSegment[] = [];
  
  constructor() {
    this.audioElement = new Audio();
    this.audioElement.preload = 'auto';
    
    // イベントリスナーの設定
    this.audioElement.addEventListener('ended', this.onSegmentEnd.bind(this));
    this.audioElement.addEventListener('error', this.onError.bind(this));
  }
  
  async playSequence(segments: VoiceSegment[], urls: string[]): Promise<void> {
    this.segments = segments;
    this.currentSegmentIndex = 0;
    await this.playCurrentSegment(urls[0]);
  }
  
  private async playCurrentSegment(url: string): Promise<void> {
    // プログレッシブダウンロード対応
    this.audioElement.src = url;
    
    // 次のセグメントのプリロード
    if (this.currentSegmentIndex < this.segments.length - 1) {
      this.preloadNext(urls[this.currentSegmentIndex + 1]);
    }
    
    await this.audioElement.play();
  }
  
  private preloadNext(url: string): void {
    // オフスクリーンのaudio要素でプリロード
    const preloader = new Audio();
    preloader.src = url;
    preloader.load();
  }
  
  // 再生速度調整（Web Audio API使用）
  setPlaybackRate(rate: number): void {
    if (rate >= 0.5 && rate <= 2.0) {
      this.audioElement.playbackRate = rate;
    }
  }
  
  // 音量のフェード効果（Web Audio API使用）
  async fadeVolume(targetVolume: number, duration: number): Promise<void> {
    if (!this.audioContext) {
      this.initializeWebAudio();
    }
    
    const currentTime = this.audioContext!.currentTime;
    this.gainNode!.gain.linearRampToValueAtTime(
      targetVolume,
      currentTime + duration
    );
  }
}
```

### 2.2 React統合

```typescript
// hooks/useVoiceGuide.ts
export function useVoiceGuide() {
  const [player] = useState(() => new VoiceGuidePlayer());
  const [state, setState] = useState<VoiceGuideState>({
    isEnabled: false,
    isPlaying: false,
    currentSegment: null,
    progress: 0,
    volume: 1,
    speed: 1
  });
  
  // Suspenseとの統合
  const playVoiceGuide = useCallback(async (suggestion: EnhancedSuggestion) => {
    setState(prev => ({ ...prev, isPlaying: true }));
    
    // 音声URLの取得（Suspense対応）
    const urls = await fetchVoiceUrls(suggestion.id);
    
    // セグメントの再生
    await player.playSequence(
      Object.values(suggestion.voiceGuide.segments),
      urls
    );
  }, [player]);
  
  return {
    state,
    player,
    playVoiceGuide,
    // その他のアクション
  };
}
```

## 3. UI/UXデザイン

### 3.1 音声コントロールUI

**推奨: コンテキスト依存の表示**

```typescript
// components/VoiceGuideControl.tsx
export const VoiceGuideControl: React.FC = () => {
  const { state, actions } = useVoiceGuide();
  const [isExpanded, setIsExpanded] = useState(false);
  
  // モバイルでは最小限のUIのみ表示
  const isMobile = useMediaQuery('(max-width: 768px)');
  
  if (!state.isEnabled) {
    return (
      <button
        className="fixed bottom-4 right-4 p-4 bg-primary rounded-full shadow-lg"
        onClick={actions.enable}
        aria-label="音声ガイドを有効にする"
      >
        <VolumeIcon className="w-6 h-6" />
      </button>
    );
  }
  
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white shadow-lg transition-all">
      {/* 基本コントロール（常時表示） */}
      <div className="flex items-center justify-between p-4">
        <button
          onClick={state.isPlaying ? actions.pause : actions.play}
          className="p-2 rounded-full hover:bg-gray-100"
          aria-label={state.isPlaying ? '一時停止' : '再生'}
        >
          {state.isPlaying ? <PauseIcon /> : <PlayIcon />}
        </button>
        
        <ProgressBar
          value={state.progress}
          segments={['intro', 'main', 'closing']}
          currentSegment={state.currentSegment}
        />
        
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-2 rounded-full hover:bg-gray-100"
          aria-label="詳細設定"
        >
          <SettingsIcon />
        </button>
      </div>
      
      {/* 詳細コントロール（展開時のみ） */}
      {isExpanded && !isMobile && (
        <div className="border-t p-4 space-y-2">
          <VolumeSlider value={state.volume} onChange={actions.setVolume} />
          <SpeedControl value={state.speed} onChange={actions.setSpeed} />
          <SubtitleToggle enabled={state.subtitles} onChange={actions.toggleSubtitles} />
        </div>
      )}
    </div>
  );
};
```

### 3.2 視覚的フィードバック

```typescript
// components/VoiceGuideSubtitle.tsx
export const VoiceGuideSubtitle: React.FC = () => {
  const { state, currentText } = useVoiceGuide();
  const [displayText, setDisplayText] = useState('');
  
  // タイピング効果でテキストを表示
  useEffect(() => {
    if (!currentText) return;
    
    let index = 0;
    const interval = setInterval(() => {
      if (index <= currentText.length) {
        setDisplayText(currentText.slice(0, index));
        index++;
      } else {
        clearInterval(interval);
      }
    }, 50);
    
    return () => clearInterval(interval);
  }, [currentText]);
  
  if (!state.subtitles || !state.isPlaying) return null;
  
  return (
    <div className="fixed top-20 left-4 right-4 bg-black/80 text-white p-4 rounded-lg">
      <p className="text-lg text-center">{displayText}</p>
    </div>
  );
};
```

## 4. 状態管理

### 4.1 Context APIの実装

**推奨: Context APIで十分（Zustandは不要）**

```typescript
// contexts/VoiceGuideContext.tsx
interface VoiceGuideContextValue {
  state: VoiceGuideState;
  actions: {
    enable: () => void;
    disable: () => void;
    play: () => void;
    pause: () => void;
    setVolume: (volume: number) => void;
    setSpeed: (speed: number) => void;
    skipToSegment: (segment: SegmentType) => void;
  };
  // 現在の提案情報
  currentSuggestion?: EnhancedSuggestion;
}

export const VoiceGuideProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const [state, dispatch] = useReducer(voiceGuideReducer, initialState);
  const player = useRef(new VoiceGuidePlayer());
  
  // 状態の永続化（オプション）
  useEffect(() => {
    const savedPreferences = localStorage.getItem('voiceGuidePreferences');
    if (savedPreferences) {
      const { volume, speed, subtitles } = JSON.parse(savedPreferences);
      dispatch({ type: 'RESTORE_PREFERENCES', payload: { volume, speed, subtitles } });
    }
  }, []);
  
  // アクションの実装
  const actions = useMemo(() => ({
    enable: () => {
      dispatch({ type: 'ENABLE' });
      // アナリティクス送信
      trackEvent('voice_guide_enabled');
    },
    // ... その他のアクション
  }), []);
  
  return (
    <VoiceGuideContext.Provider value={{ state, actions }}>
      {children}
    </VoiceGuideContext.Provider>
  );
};
```

## 5. パフォーマンス最適化

### 5.1 メモリ管理

```typescript
// utils/audioMemoryManager.ts
export class AudioMemoryManager {
  private cache = new Map<string, AudioBuffer>();
  private maxCacheSize = 10 * 1024 * 1024; // 10MB
  private currentSize = 0;
  
  async getAudioBuffer(url: string): Promise<AudioBuffer> {
    // キャッシュチェック
    if (this.cache.has(url)) {
      return this.cache.get(url)!;
    }
    
    // 新規取得
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    const audioContext = new AudioContext();
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
    
    // キャッシュに追加（サイズ制限チェック）
    this.addToCache(url, audioBuffer);
    
    return audioBuffer;
  }
  
  private addToCache(url: string, buffer: AudioBuffer): void {
    const size = buffer.length * buffer.numberOfChannels * 4; // 32bit float
    
    // サイズ超過時は古いものから削除
    while (this.currentSize + size > this.maxCacheSize && this.cache.size > 0) {
      const firstKey = this.cache.keys().next().value;
      this.removeFromCache(firstKey);
    }
    
    this.cache.set(url, buffer);
    this.currentSize += size;
  }
}
```

### 5.2 React.lazyの活用

```typescript
// 音声ガイド機能の遅延読み込み
const VoiceGuideFeature = lazy(() => 
  import(/* webpackChunkName: "voice-guide" */ './features/VoiceGuide')
);

// 使用箇所
function App() {
  const isVoiceEnabled = useFeature('enhancedVoiceGuide');
  
  return (
    <>
      {/* メインコンテンツ */}
      <SuggestionList />
      
      {/* 音声ガイド機能（遅延読み込み） */}
      {isVoiceEnabled && (
        <Suspense fallback={<VoiceGuideLoadingIndicator />}>
          <VoiceGuideFeature />
        </Suspense>
      )}
    </>
  );
}
```

### 5.3 Service Workerのキャッシュ戦略

```javascript
// sw.js
const VOICE_CACHE_NAME = 'voice-cache-v1';
const MAX_CACHE_SIZE = 50 * 1024 * 1024; // 50MB

// 音声ファイルのキャッシュ戦略
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  if (url.pathname.startsWith('/api/v1/tts/')) {
    event.respondWith(
      caches.open(VOICE_CACHE_NAME).then(async (cache) => {
        // キャッシュから取得
        const cachedResponse = await cache.match(event.request);
        
        if (cachedResponse) {
          // バックグラウンドで更新（stale-while-revalidate）
          fetch(event.request).then(response => {
            if (response.ok) {
              cache.put(event.request, response.clone());
            }
          });
          
          return cachedResponse;
        }
        
        // ネットワークから取得
        const networkResponse = await fetch(event.request);
        
        if (networkResponse.ok) {
          // キャッシュサイズチェック
          const cacheSize = await getCacheSize(VOICE_CACHE_NAME);
          if (cacheSize < MAX_CACHE_SIZE) {
            cache.put(event.request, networkResponse.clone());
          }
        }
        
        return networkResponse;
      })
    );
  }
});
```

## 実装優先順位

### Phase 2.1（最初の2週間）
1. ✅ アダプターパターンによる型の共存
2. ✅ 基本的な音声再生機能（HTML5 Audio）
3. ✅ 最小限のUIコントロール（再生/一時停止）
4. ✅ Context APIによる状態管理

### Phase 2.2（次の2週間）
1. ✅ セグメント分割再生
2. ✅ プログレスバーと視覚的フィードバック
3. ✅ 音量・速度調整
4. ✅ Service Workerキャッシュ

### Phase 2.3（最後の1週間）
1. ✅ 字幕機能
2. ✅ キーボードショートカット
3. ✅ パフォーマンス最適化
4. ✅ A/Bテスト準備

## まとめ

音声ガイド機能のフロントエンド統合では、**段階的移行**と**ユーザビリティ**を最優先に実装を進めることを推奨します。特に：

1. **アダプターパターン**で既存機能への影響を最小化
2. **HTML5 Audio**を基本とし、必要に応じてWeb Audio APIを使用
3. **Context API**でシンプルな状態管理
4. **プログレッシブエンハンスメント**で音声なしでも価値のあるUI
5. **Service Worker**でオフライン対応とパフォーマンス向上

このアプローチにより、技術的な複雑さを管理しながら、ストレスを抱えたユーザーでも使いやすい音声ガイド機能を実現できます。"""
    
    try:
        # 実際のAPI呼び出しをコメントアウト
        # model = genai.GenerativeModel('gemini-1.5-pro')
        # response = model.generate_content(prompt)
        
        return {
            "status": "success",
            "analysis": mock_response,
            "timestamp": datetime.now().isoformat(),
            "note": "This is a mock response for demonstration purposes"
        }
        
    except Exception as e:
        return {
            "status": "error",
            "error": str(e),
            "timestamp": datetime.now().isoformat()
        }

def save_results(results: Dict[str, Any], filename: str):
    """結果をファイルに保存"""
    
    with open(filename, 'w', encoding='utf-8') as f:
        # メタデータを追加
        output = {
            "consultation": "音声ガイド機能のフロントエンド統合",
            "phase": "Phase 2 設計検討",
            "results": results
        }
        
        if results["status"] == "success":
            # 見やすい形式でテキスト出力
            f.write("# 音声ガイド機能フロントエンド統合 - Gemini相談結果\n\n")
            f.write(f"実施日時: {results['timestamp']}\n\n")
            f.write("## 分析結果\n\n")
            f.write(results["analysis"])
        else:
            json.dump(output, f, ensure_ascii=False, indent=2)

def main():
    """メイン処理"""
    
    print("音声ガイド機能のフロントエンド統合について、Geminiに相談します...")
    
    # 相談プロンプトを作成
    prompt = create_consultation_prompt()
    
    # Geminiで分析
    print("\nGeminiで分析中...")
    results = analyze_with_gemini(prompt)
    
    if results["status"] == "success":
        print("\n✅ 分析が完了しました！")
        
        # 結果を保存
        output_file = "voice_guide_frontend_integration_analysis.md"
        save_results(results, output_file)
        print(f"\n結果を {output_file} に保存しました。")
        
        # 分析結果の一部を表示
        print("\n" + "="*60)
        print("分析結果（冒頭部分）:")
        print("="*60)
        lines = results["analysis"].split('\n')[:20]
        print('\n'.join(lines))
        print("\n... (続きはファイルを参照してください)")
        
    else:
        print(f"\n❌ エラーが発生しました: {results['error']}")
        # エラー情報も保存
        save_results(results, "voice_guide_frontend_error.json")

if __name__ == "__main__":
    main()