# OpenWeatherMap API実装ガイド

## 概要

このガイドでは、OpenWeatherMap APIを使用して47都道府県の実際の気象データを取得する実装について説明します。

## 1. OpenWeatherMap APIの基本情報

### API仕様
- **ベースURL**: `https://api.openweathermap.org/data/2.5/weather`
- **メソッド**: GET
- **レスポンス形式**: JSON
- **言語**: 日本語対応（`lang=ja`）
- **単位**: メートル法（`units=metric`）

### 無料プランの制限事項

| 項目 | 制限 |
|------|------|
| 1分あたりのリクエスト数 | 60回 |
| 1ヶ月あたりのリクエスト数 | 1,000,000回 |
| データ更新頻度 | 10分ごと |
| 履歴データ | なし（現在の天候のみ） |
| サポート | コミュニティのみ |

### 有料プランの比較

| プラン | 月額料金 | 1分あたりリクエスト | 月間リクエスト | 履歴データ |
|--------|----------|-------------------|----------------|------------|
| Startup | $40 | 600 | 無制限 | 5日間 |
| Developer | $180 | 3000 | 無制限 | 40日間 |
| Professional | $500 | 30000 | 無制限 | 365日間 |

## 2. APIキーの取得方法

### 手順
1. [OpenWeatherMap](https://openweathermap.org/)にアクセス
2. "Sign up"でアカウント作成
3. メール認証を完了
4. [My API keys](https://home.openweathermap.org/api_keys)からAPIキーを取得
5. 初期設定では制限がかかっているため、数時間後に有効化

### セキュリティ注意事項
- APIキーは環境変数で管理
- GitHubリポジトリにコミットしない
- 必要に応じてキーのローテーション実施

## 3. 実装された機能

### 47都道府県の座標データ
```typescript
// backend/src/data/japanCities.ts で定義
export const JAPAN_CITIES: Record<string, CityData> = {
  'Tokyo': {
    name: '東京都',
    nameEn: 'Tokyo',
    prefecture: '東京都',
    lat: 35.6762,
    lon: 139.6503,
    isCapital: true
  },
  // ... 47都道府県すべて
};
```

### 天候データ取得メソッド

#### 1. 都道府県キーで取得
```typescript
const weather = await weatherClient.getWeatherByPrefecture('Tokyo');
```

#### 2. 座標で取得
```typescript
const weather = await weatherClient.getCurrentWeatherByCoordinates(35.6762, 139.6503, '東京都');
```

#### 3. 都市名で取得（従来方式）
```typescript
const weather = await weatherClient.getCurrentWeather('Tokyo');
```

## 4. レート制限への対応

### 実装された対策
1. **キャッシュシステム**: 10分間のメモリキャッシュ
2. **レート制限**: API呼び出し間隔を1秒に制限
3. **エラーハンドリング**: 429エラー時の適切な処理
4. **タイムアウト**: 8秒のリクエストタイムアウト

### キャッシュ戦略
```typescript
private readonly cache = new Map<string, { data: WeatherData; timestamp: number }>();
private readonly cacheTimeout = 10 * 60 * 1000; // 10分キャッシュ
```

### レート制限チェック
```typescript
private async waitForRateLimit(): Promise<void> {
  const now = Date.now();
  const timeElapsed = now - this.lastApiCall;
  
  if (timeElapsed < this.rateLimitDelay) {
    const waitTime = this.rateLimitDelay - timeElapsed;
    await new Promise(resolve => setTimeout(resolve, waitTime));
  }
  
  this.lastApiCall = Date.now();
}
```

## 5. エラーハンドリング

### エラーの種類と対応

| エラーコード | 説明 | 対応方法 |
|-------------|------|----------|
| 401 | 無効なAPIキー | APIキーの確認・再設定 |
| 404 | 都市が見つからない | 座標での再試行またはモックデータ |
| 429 | レート制限超過 | 待機後の再試行 |
| 500 | サーバーエラー | モックデータにフォールバック |

### フォールバック機能
```typescript
// エラー時はモックデータを返す
catch (error) {
  logger.error('Failed to fetch weather data', {
    error: error instanceof Error ? error.message : 'Unknown error',
    location
  });
  return this.getMockWeatherData(location);
}
```

## 6. 使用方法

### 環境変数の設定
```bash
# .envファイルに追加
OPENWEATHER_API_KEY=your-actual-api-key-here
```

### APIの呼び出し例
```typescript
import { weatherClient } from './services/external/weatherClient';

// 47都道府県のデータ取得
const tokyoWeather = await weatherClient.getWeatherByPrefecture('Tokyo');
const osakaWeather = await weatherClient.getWeatherByPrefecture('Osaka');

// レスポンス例
{
  temperature: 22,
  condition: 'sunny',
  description: '晴れ',
  humidity: 65,
  location: '東京都',
  icon: '01d'
}
```

## 7. 天候状態のマッピング

### OpenWeatherMapから内部形式への変換
```typescript
private mapWeatherCondition(weatherMain: string): WeatherData['condition'] {
  const conditionMap: Record<string, WeatherData['condition']> = {
    'clear': 'sunny',
    'clouds': 'cloudy', 
    'rain': 'rainy',
    'drizzle': 'rainy',
    'thunderstorm': 'rainy',
    'snow': 'snowy',
    'mist': 'cloudy',
    'fog': 'cloudy',
    'haze': 'cloudy'
  };

  return conditionMap[weatherMain] || 'unknown';
}
```

## 8. パフォーマンス最適化

### キャッシュ効果
- 同一都道府県への連続リクエストは10分間キャッシュから返却
- API使用量を大幅に削減
- レスポンス速度の向上

### バッチ処理（将来の拡張）
```typescript
// 複数都道府県の一括取得（実装例）
async getBatchWeatherData(prefectureKeys: string[]): Promise<WeatherData[]> {
  const promises = prefectureKeys.map(key => 
    this.getWeatherByPrefecture(key)
  );
  
  // レート制限を考慮して順次実行
  const results = [];
  for (const promise of promises) {
    results.push(await promise);
  }
  
  return results.filter(Boolean);
}
```

## 9. 監視とログ

### ログ出力例
```typescript
// 成功時
logger.info('Weather data fetched successfully', {
  location: weatherData.location,
  condition: weatherData.condition,
  temperature: weatherData.temperature,
  coordinates: { lat, lon }
});

// エラー時
logger.error('Failed to fetch weather data by coordinates', {
  error: error instanceof Error ? error.message : 'Unknown error',
  lat,
  lon,
  locationName
});
```

### 監視すべきメトリクス
- API呼び出し回数
- キャッシュヒット率
- エラー発生率
- レスポンス時間

## 10. 本番環境での注意事項

### セキュリティ
- APIキーの適切な管理
- HTTPS通信の使用
- 環境変数での設定

### パフォーマンス
- キャッシュの活用
- レート制限の遵守
- 適切なタイムアウト設定

### 運用
- API使用量の監視
- エラーログの確認
- フォールバック機能の動作確認

## 11. トラブルシューティング

### よくある問題

#### APIキーが無効
```bash
# エラーメッセージ例
Weather API error: 401

# 対処法
1. APIキーの再確認
2. アカウントの有効化確認
3. 新しいAPIキーの生成
```

#### レート制限超過
```bash
# エラーメッセージ例
API rate limit exceeded

# 対処法
1. キャッシュ時間の延長
2. リクエスト間隔の調整
3. 有料プランの検討
```

#### 都市が見つからない
```bash
# エラーメッセージ例
Weather API error: 404

# 対処法
1. 座標での再試行
2. 都市名の確認
3. モックデータへのフォールバック
```

## 12. 今後の改善案

### 短期改善
- バッチ処理の実装
- より詳細な天候情報の追加
- キャッシュ戦略の最適化

### 長期改善
- 複数の天候APIの併用
- 機械学習による天候予測
- リアルタイム天候アラート

## まとめ

OpenWeatherMap APIの実装により、47都道府県の実際の天候データを取得できるようになりました。無料プランの制限内で効率的に動作するよう、キャッシュとレート制限対策を実装しています。APIキーが設定されていない場合は自動的にモックデータにフォールバックするため、開発環境でも問題なく動作します。