# API レスポンス構造仕様

このドキュメントは、kibarashi-app のAPIレスポンス構造を定義します。

## 基本原則

1. **シンプルで直感的な構造**
   - 不要なラッパーを避ける
   - データは可能な限りフラットに

2. **一貫性のあるエラーハンドリング**
   - すべてのエラーは`error`オブジェクトで返す
   - エラーには`message`と`code`を含める

## エンドポイント仕様

### GET /api/v1/suggestions

#### 成功レスポンス (200 OK)
```json
{
  "suggestions": [
    {
      "id": "string",
      "title": "string",
      "description": "string",
      "duration": "number (minutes)",
      "category": "認知的 | 行動的",
      "steps": ["string"]
    }
  ],
  "metadata": {
    "situation": "string",
    "duration": "number",
    "ageGroup": "string",
    "location": "string",
    "timestamp": "ISO 8601 string",
    "source": "string"
  }
}
```

#### エラーレスポンス (4xx/5xx)
```json
{
  "error": {
    "message": "エラーの説明（日本語）",
    "code": "ERROR_CODE"
  }
}
```

### GET /api/v1/context

#### 成功レスポンス (200 OK)
```json
{
  "success": true,
  "data": {
    "weather": {
      "temperature": "number",
      "condition": "sunny | cloudy | rainy | snowy | unknown",
      "description": "string",
      "humidity": "number",
      "location": "string",
      "icon": "string"
    },
    "seasonal": {
      "season": "spring | summer | autumn | winter",
      "month": "number",
      "seasonalEvents": ["string"],
      "holidays": ["string"],
      "specialPeriods": ["string"],
      "seasonalTips": ["string"]
    },
    "timestamp": "ISO 8601 string"
  }
}
```

#### エラーレスポンス (4xx/5xx)
```json
{
  "error": {
    "message": "エラーの説明（日本語）",
    "code": "ERROR_CODE"
  }
}
```

## フロントエンドとの契約

フロントエンドコードは以下の前提でAPIレスポンスを処理します：

1. **suggestions API**
   - `response.suggestions` で提案配列に直接アクセス
   - `response.metadata` でメタデータにアクセス

2. **context API**
   - `response.data` でデータオブジェクトにアクセス
   - `response.data.weather` で天候データにアクセス
   - `response.data.seasonal` で季節データにアクセス

## 変更履歴

### 2025-07-09
- suggestions APIのレスポンス構造を簡略化
  - `status`と`data`ラッパーを削除
  - `suggestions`と`metadata`を直接トップレベルに配置
- エラーレスポンスを統一