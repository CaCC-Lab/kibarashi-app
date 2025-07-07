# 5分気晴らしアプリ アーキテクチャ設計書

## 概要

本ドキュメントは、5分気晴らしアプリ（kibarashi-app）のシステムアーキテクチャを定義します。PWA対応のReactフロントエンドとVercel Functionsベースのサーバーレスバックエンドを中心に、外部APIとの統合を含む全体構成を説明します。

## システム全体図

```mermaid
graph TB
    subgraph "Client Layer (PWA)"
        UI[React UI Components<br/>・状況/時間選択<br/>・提案表示<br/>・音声再生制御]
        SW[Service Worker<br/>・オフライン対応<br/>・キャッシュ管理<br/>・バックグラウンド同期]
        LS[Local Storage/IndexedDB<br/>・お気に入り保存<br/>・履歴記録<br/>・統計データ]
        WA[Web Audio API<br/>・音声再生<br/>・ボリューム制御<br/>・再生状態管理]
        
        UI --> SW
        UI --> LS
        UI --> WA
    end
    
    subgraph "Network Layer"
        CDN[CDN (Vercel Edge Network)<br/>・静的アセット配信<br/>・音声ファイルキャッシュ<br/>・グローバル配信]
        API[API Gateway<br/>Vercel Functions<br/>・ルーティング<br/>・レート制限]
    end
    
    subgraph "Backend Layer (Vercel Functions)"
        VF1[/api/v1/suggestions<br/>気晴らし提案生成<br/>・年齢層対応<br/>・フォールバック]
        VF2[/api/v1/enhanced-suggestions<br/>拡張提案<br/>・音声ガイド付き<br/>・詳細ステップ]
        VF3[/api/v1/tts<br/>音声合成<br/>・テキスト変換<br/>・音声設定]
        VF4[/api/v1/health<br/>ヘルスチェック<br/>・API状態確認<br/>・環境情報]
        
        Cache[In-Memory Cache<br/>・提案キャッシュ<br/>・APIレスポンス<br/>・一時データ]
        
        VF1 --> Cache
        VF2 --> Cache
    end
    
    subgraph "External Services"
        GEMINI[Gemini API<br/>・AI提案生成<br/>・プロンプト処理<br/>・多様性確保]
        TTS[Google Cloud TTS<br/>・音声合成<br/>・SSML対応<br/>・多言語対応]
        VERCEL[Vercel Platform<br/>・ホスティング<br/>・Functions実行<br/>・自動スケーリング]
    end
    
    %% Client to Network connections
    UI -->|HTTPS/HTTP2| API
    UI -->|HTTPS/HTTP2| CDN
    SW -->|Cache First| CDN
    SW -->|Network First| API
    
    %% API Gateway routing
    API --> VF1
    API --> VF2
    API --> VF3
    API --> VF4
    
    %% Backend to External
    VF1 -->|REST API| GEMINI
    VF2 -->|REST API| GEMINI
    VF3 -->|gRPC/REST| TTS
    
    %% Response flow
    GEMINI -->|JSON Response| VF1
    GEMINI -->|JSON Response| VF2
    TTS -->|Audio Stream| VF3
    VF1 -->|Suggestions JSON| API
    VF2 -->|Enhanced JSON| API
    VF3 -->|Base64 Audio| API
    API -->|JSON/Binary| UI
    
    %% Offline support
    LS -.->|Offline Mode| UI
    SW -.->|Cached Data| UI
    
    %% Deployment
    VERCEL -->|Deploy| API
    VERCEL -->|Host| CDN
    
    classDef client fill:#e1f5fe,stroke:#01579b,stroke-width:2px
    classDef backend fill:#f3e5f5,stroke:#4a148c,stroke-width:2px
    classDef external fill:#fff3e0,stroke:#e65100,stroke-width:2px
    classDef network fill:#e8f5e9,stroke:#1b5e20,stroke-width:2px
    
    class UI,SW,LS,WA client
    class VF1,VF2,VF3,VF4,Cache backend
    class GEMINI,TTS,VERCEL external
    class CDN,API network
```

## データフロー

### 1. オンライン時の提案取得フロー

```mermaid
sequenceDiagram
    participant U as User
    participant UI as React App
    participant SW as Service Worker
    participant LS as Local Storage
    participant API as Vercel Functions
    participant G as Gemini API
    participant TTS as Google TTS
    
    U->>UI: 状況・時間を選択
    UI->>UI: 年齢層プロファイル確認
    UI->>SW: fetch(/api/v1/suggestions)
    SW->>SW: キャッシュ確認
    
    alt キャッシュヒット（5分以内）
        SW-->>UI: キャッシュデータ返却
    else キャッシュミスまたは期限切れ
        SW->>API: GET /api/v1/suggestions
        API->>API: APIキーローテーション確認
        
        alt Gemini API利用可能
            API->>G: 提案生成リクエスト
            Note over API,G: プロンプトに年齢層・状況を含む
            G-->>API: AI生成提案（3つ）
            API->>API: レスポンス検証・整形
        else Gemini API利用不可
            API->>API: フォールバックデータ使用
            Note over API: 事前定義の提案データ
        end
        
        API-->>SW: 提案データ（JSON）
        SW->>SW: キャッシュ保存
        SW-->>UI: 提案データ
    end
    
    UI->>LS: 履歴として保存
    UI->>U: 提案カードを表示
    
    opt 音声ガイド再生
        U->>UI: 音声再生ボタンクリック
        UI->>API: POST /api/v1/tts
        API->>TTS: テキスト送信（SSML形式）
        TTS-->>API: 音声データ（WAV/MP3）
        API-->>UI: Base64音声データ
        UI->>WA: 音声再生
        WA->>U: 音声出力
    end
```

### 2. オフライン時のフォールバックフロー

```mermaid
sequenceDiagram
    participant U as User
    participant UI as React App
    participant SW as Service Worker
    participant LS as Local Storage
    
    U->>UI: 状況・時間を選択
    UI->>SW: fetch(/api/v1/suggestions)
    SW->>SW: ネットワーク状態確認
    
    Note over SW: オフライン検知
    
    SW->>LS: ローカルデータ検索
    
    alt 該当データあり
        LS-->>SW: 保存済み提案
        SW-->>UI: オフラインデータ
        UI->>UI: オフラインバッジ表示
    else 該当データなし
        SW->>SW: 汎用フォールバック生成
        SW-->>UI: 基本提案セット
    end
    
    UI->>U: 提案表示（オフラインモード）
    
    opt ブラウザTTS使用
        U->>UI: 音声再生ボタン
        UI->>UI: Web Speech API確認
        UI->>U: ブラウザ音声で読み上げ
    end
```

## エラーハンドリングアーキテクチャ

```mermaid
graph TD
    START[API Request] --> TRY{Try API Call}
    
    TRY -->|Success| PROCESS[Process Response]
    TRY -->|Error| CATCH{Error Type?}
    
    CATCH -->|Network Error| OFFLINE[Switch to Offline Mode]
    CATCH -->|429 Rate Limit| ROTATE[Rotate API Key]
    CATCH -->|401/403 Auth| CHECK_KEY[Check API Key Status]
    CATCH -->|500 Server Error| RETRY[Retry with Backoff]
    CATCH -->|Timeout| FALLBACK[Use Fallback Data]
    
    OFFLINE --> LOCAL[Load Local Data]
    ROTATE --> NEXT_KEY{Next Key Available?}
    CHECK_KEY --> REFRESH[Refresh Credentials]
    RETRY --> COUNT{Retry Count?}
    
    NEXT_KEY -->|Yes| TRY
    NEXT_KEY -->|No| FALLBACK
    COUNT -->|< 3| WAIT[Wait & Retry]
    COUNT -->|>= 3| FALLBACK
    WAIT --> TRY
    
    LOCAL --> NOTIFY1[Notify: Offline Mode]
    FALLBACK --> NOTIFY2[Notify: Limited Features]
    REFRESH --> TRY
    
    PROCESS --> SUCCESS[Display Data]
    NOTIFY1 --> SUCCESS
    NOTIFY2 --> SUCCESS
    
    style CATCH fill:#ffebee,stroke:#c62828
    style OFFLINE fill:#fff3e0,stroke:#e65100
    style FALLBACK fill:#fce4ec,stroke:#880e4f
    style SUCCESS fill:#e8f5e9,stroke:#2e7d32
```

## キャッシュ戦略

### キャッシュレイヤー構成

```mermaid
graph LR
    subgraph "Client Side Caching"
        BC[Browser Cache<br/>静的アセット]
        SW[Service Worker<br/>API レスポンス]
        LS[Local Storage<br/>ユーザーデータ]
        IDB[IndexedDB<br/>大容量データ]
    end
    
    subgraph "Edge Caching"
        CDN[Vercel Edge<br/>グローバル配信]
        CF[Functions Cache<br/>計算結果]
    end
    
    subgraph "Cache Duration"
        T1[即時<br/>リアルタイムデータ]
        T2[5分<br/>提案データ]
        T3[1時間<br/>音声ファイル]
        T4[24時間<br/>静的リソース]
        T5[7日<br/>PWAアセット]
    end
    
    BC --> T4
    SW --> T2
    LS --> T5
    IDB --> T3
    CDN --> T4
    CF --> T2
    
    style BC fill:#e3f2fd,stroke:#1976d2
    style SW fill:#f3e5f5,stroke:#7b1fa2
    style LS fill:#e8f5e9,stroke:#388e3c
    style CDN fill:#fff3e0,stroke:#f57c00
```

### キャッシュ無効化戦略

1. **時間ベース無効化**
   - 提案データ: 5分後に自動無効化
   - 音声データ: 1時間保持
   - 静的アセット: ビルドハッシュで管理

2. **イベントベース無効化**
   - ユーザープロファイル変更時
   - 新バージョンデプロイ時
   - 手動リフレッシュ操作時

3. **容量ベース無効化**
   - Local Storage: 5MB制限
   - IndexedDB: 50MB制限
   - LRU（Least Recently Used）アルゴリズム

## セキュリティアーキテクチャ

### セキュリティレイヤー

```mermaid
graph TB
    subgraph "Security Layers"
        WAF[Web Application Firewall<br/>・DDoS防御<br/>・不正リクエストブロック]
        HTTPS[HTTPS/TLS 1.3<br/>・通信暗号化<br/>・証明書管理]
        CORS[CORS Policy<br/>・オリジン制限<br/>・認証ヘッダー]
        CSP[Content Security Policy<br/>・XSS防止<br/>・インジェクション対策]
        AUTH[API Key Management<br/>・ローテーション<br/>・レート制限]
    end
    
    subgraph "Data Protection"
        ENC[Encryption at Rest<br/>・ローカルデータ暗号化]
        MASK[Data Masking<br/>・PII保護<br/>・ログサニタイズ]
        VALID[Input Validation<br/>・SQLインジェクション防止<br/>・XSS対策]
    end
    
    WAF --> HTTPS
    HTTPS --> CORS
    CORS --> CSP
    CSP --> AUTH
    
    AUTH --> ENC
    ENC --> MASK
    MASK --> VALID
    
    style WAF fill:#ffebee,stroke:#b71c1c
    style AUTH fill:#e3f2fd,stroke:#0d47a1
    style ENC fill:#f3e5f5,stroke:#4a148c
```

## デプロイメントアーキテクチャ

### CI/CDパイプライン

```mermaid
graph LR
    subgraph "Development"
        DEV[Local Development<br/>・Hot Reload<br/>・Mock APIs]
        TEST[Unit/Integration Tests<br/>・Vitest<br/>・Coverage 80%+]
    end
    
    subgraph "CI Pipeline"
        GH[GitHub Actions<br/>・自動テスト<br/>・ビルド検証]
        SEC[Security Scan<br/>・依存関係チェック<br/>・脆弱性スキャン]
        BUILD[Build Process<br/>・TypeScript<br/>・Bundle最適化]
    end
    
    subgraph "CD Pipeline"
        STAGE[Staging Deploy<br/>・Vercel Preview<br/>・E2Eテスト]
        PROD[Production Deploy<br/>・Vercel Production<br/>・自動スケーリング]
        MON[Monitoring<br/>・パフォーマンス<br/>・エラートラッキング]
    end
    
    DEV --> TEST
    TEST --> GH
    GH --> SEC
    SEC --> BUILD
    BUILD --> STAGE
    STAGE --> PROD
    PROD --> MON
    
    style DEV fill:#e8f5e9,stroke:#1b5e20
    style PROD fill:#fff3e0,stroke:#e65100
    style MON fill:#e3f2fd,stroke:#0d47a1
```

## スケーラビリティ考慮事項

### 現在の構成（Phase 1-3）
- **ユーザー数**: 〜50万人
- **同時接続**: 〜5,000
- **API呼び出し**: 〜100,000/日

### 将来の拡張計画（Phase 4+）
1. **データベース層の追加**
   - PostgreSQL（ユーザーデータ永続化）
   - Redis（セッションキャッシュ）

2. **マイクロサービス化**
   - 提案生成サービス
   - 音声処理サービス
   - 分析サービス

3. **グローバル展開**
   - マルチリージョン対応
   - 言語別コンテンツ配信
   - 地域別フォールバック

## パフォーマンス目標

### Core Web Vitals
- **LCP (Largest Contentful Paint)**: < 2.5s
- **FID (First Input Delay)**: < 100ms
- **CLS (Cumulative Layout Shift)**: < 0.1

### API レスポンスタイム
- **提案取得**: < 500ms（キャッシュヒット時 < 50ms）
- **音声生成**: < 1000ms
- **ヘルスチェック**: < 100ms

## モニタリング・可観測性

### メトリクス収集
- **フロントエンド**: Web Vitals、エラー率、ユーザー行動
- **バックエンド**: レスポンスタイム、API使用率、エラー率
- **インフラ**: CPU使用率、メモリ使用量、ネットワーク帯域

### ログ管理
- **構造化ログ**: JSON形式
- **ログレベル**: ERROR, WARN, INFO, DEBUG
- **保持期間**: 30日（コンプライアンス要件に応じて調整）

---

最終更新: 2025-01-07