# 実装計画: みんなの気晴らし（コミュニティ共有機能）

## 概要

既存の「気晴らしレシピ」アプリに、ユーザーが気晴らし方法をコミュニティに共有・閲覧できる機能を追加する。既存の Express バックエンド + React フロントエンドの構成に、Supabase（PostgreSQL）を新たに統合し、投稿・閲覧・通報・モデレーションの一連のフローを実装する。

実装言語: TypeScript（フロントエンド: React + Vite、バックエンド: Express）

## Tasks

- [ ] 1. 型定義・定数・Supabase クライアント初期化
  - [ ] 1.1 共有機能の型定義を追加する（SharedSuggestion, Report, FixedTag, ModerationStatus, CommunityError）
    - `backend/src/types/community.ts` を新規作成
    - SharedSuggestion, SharedSuggestionListItem, Report, FixedTag, ModerationStatus, ReportReason, CreateSharedSuggestionRequest, CreateReportRequest, ModerateSuggestionRequest の各インターフェース・型を定義
    - FIXED_TAGS 定数配列を定義
    - CommunityError クラスを定義（statusCode, isOperational プロパティ付き）
    - _Requirements: 8.1, 8.3_

  - [ ] 1.2 フロントエンド用の型定義を追加する
    - `frontend/src/types/community.ts` を新規作成
    - SharedSuggestionListItem, FixedTag, FIXED_TAGS, CreateSharedSuggestionRequest, CreateReportRequest, ReportReason, GetSharedSuggestionsQuery, PaginationInfo の型を定義
    - _Requirements: 8.1, 8.2, 8.3_

  - [ ] 1.3 Supabase クライアントを初期化する
    - `backend/src/services/community/supabaseClient.ts` を新規作成
    - `@supabase/supabase-js` パッケージをインストール（`npm install @supabase/supabase-js`）
    - 環境変数 `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` を使用してクライアントを初期化
    - `.env.example` に環境変数を追記
    - _Requirements: 9.1_

  - [ ] 1.4 DB スキーマを作成する（shared_suggestions, reports テーブル + RLS + インデックス）
    - `backend/src/services/community/schema.sql` にマイグレーション SQL を記述
    - shared_suggestions テーブル: id(UUID), title, description, category, duration, steps(JSONB), fixed_tags(JSONB), author_hash, nickname, moderation_status, moderation_reason, report_count, created_at, updated_at
    - reports テーブル: id(UUID), shared_suggestion_id(FK), reporter_hash, reason, created_at, UNIQUE(shared_suggestion_id, reporter_hash)
    - インデックス: idx_shared_suggestions_status_created, idx_shared_suggestions_author, idx_shared_suggestions_tags(GIN)
    - RLS ポリシー: approved_read, anon_insert, anon_report_insert
    - updated_at 自動更新トリガー
    - _Requirements: 9.1, 9.2, 9.3, 9.5_

- [ ] 2. バックエンド コアロジック実装
  - [ ] 2.1 サニタイズ関数を実装する（sanitizer.ts）
    - `backend/src/services/community/sanitizer.ts` を新規作成
    - HTML タグ・スクリプトタグの除去、XSS 対策のエスケープ処理
    - sanitizeInput(text: string): string 関数を実装
    - 冪等性を保証する（2回適用しても結果が同じ）
    - _Requirements: 6.2, 6.6_

  - [ ]\* 2.2 サニタイズ関数のプロパティテストを作成する
    - **Property 5: サニタイズのラウンドトリップ安全性と冪等性**
    - fast-check を使用（`npm install -D fast-check`）
    - 任意の文字列に対して、サニタイズ後に HTML/script タグが含まれないこと、2回適用で結果が同一であることを検証
    - **Validates: Requirements 6.2**

  - [ ] 2.3 バリデーション関数を実装する（communityValidator.ts）
    - `backend/src/services/community/communityValidator.ts` を新規作成
    - validateSharedSuggestion(data): ValidationResult を実装
    - validateReportRequest(data): ValidationResult を実装
    - validateQueryParams(query): ValidationResult を実装
    - CustomStorage.validateFormData と同等のルール（title 100文字、description 500文字、steps 10個、duration 1〜120）をサーバーサイドで適用
    - author_hash: 64文字の16進数文字列チェック
    - fixed_tags: FIXED_TAGS に含まれる値のみ許可
    - ペイロードサイズ 10KB 制限
    - _Requirements: 1.6, 6.3, 7.6_

  - [ ]\* 2.4 バリデーション関数のプロパティテストを作成する
    - **Property 2: バリデーションの冪等性**
    - 任意の投稿データに対して、バリデーション関数を1回適用した結果と2回適用した結果が同一であることを検証
    - **Validates: Requirements 1.6, 7.6**

  - [ ] 2.5 モデレーションサービスを実装する（moderationService.ts）
    - `backend/src/services/community/moderationService.ts` を新規作成
    - checkModeration(text: string): ModerationResult を実装
    - 禁止語カテゴリ: 暴言・差別用語、性的表現、自傷・自殺、薬物・違法行為、医療的断定、スパムパターン（URL、連続同一文字）
    - 禁止語リストは別ファイル `bannedWords.ts` に分離
    - title + description + steps を結合してチェック
    - _Requirements: 4.5, 4.6_

  - [ ]\* 2.6 モデレーションサービスのプロパティテストを作成する
    - **Property 7: 禁止語チェックの正確性**
    - 禁止語を含むテキストに対して passed: false、含まないテキストに対して passed: true を返すことを検証
    - **Validates: Requirements 4.5, 4.6**

  - [ ] 2.7 変換レイヤーを実装する（toSuggestion / fromSuggestion）
    - `backend/src/services/community/converter.ts` を新規作成
    - toSuggestion(shared: SharedSuggestionListItem): Suggestion 互換オブジェクトを返す
    - fromSuggestion(suggestion): Pick<SharedSuggestion, 共通フィールド> を返す
    - dataSource: 'community' を設定
    - _Requirements: 8.2, 8.4_

  - [ ]\* 2.8 変換レイヤーのプロパティテストを作成する
    - **Property 1: SharedSuggestion ↔ Suggestion 変換のラウンドトリップ**
    - 任意の有効な SharedSuggestion に対して、toSuggestion → fromSuggestion で元の title, description, category, duration, steps が一致することを検証
    - **Validates: Requirements 3.3, 7.3, 8.2, 8.4**

- [ ] 3. チェックポイント - コアロジックの確認
  - Ensure all tests pass, ask the user if questions arise.
  - サニタイズ・バリデーション・モデレーション・変換レイヤーの各関数が正しく動作することを確認

- [ ] 4. バックエンド API 実装
  - [ ] 4.1 コミュニティ用レートリミットを追加する
    - `backend/src/api/middleware/rateLimit.ts` に communityPost（author_hash ベース、1時間5件）と communityReport（author_hash ベース、1時間10件）を追加
    - keyGenerator で req.body.author_hash を使用
    - _Requirements: 6.1, 6.5_

  - [ ]\* 4.2 レートリミットのプロパティテストを作成する
    - **Property 4: レートリミットの不変条件**
    - 同一 author_hash から1時間以内に受理された投稿数が5件以下、通報が10件以下であることを検証
    - **Validates: Requirements 6.1, 6.5**

  - [ ] 4.3 投稿 API を実装する（POST /api/v1/community-suggestions）
    - `backend/src/api/controllers/communityController.ts` を新規作成
    - `backend/src/api/routes/communityRoutes.ts` を新規作成
    - リクエスト受信 → サニタイズ → バリデーション → 自動モデレーション → Supabase INSERT
    - 自動モデレーション NG → rejected、OK → pending
    - レスポンス: 201 Created（id, moderation_status, created_at, message）
    - エラー: 400（バリデーション）、413（ペイロード超過）、429（レートリミット）
    - _Requirements: 1.1, 1.3, 1.4, 1.6, 4.1, 4.5, 4.6_

  - [ ] 4.4 一覧取得 API を実装する（GET /api/v1/community-suggestions）
    - communityController に getSharedSuggestions を追加
    - クエリパラメータ: page, limit, tag, search, sort
    - Supabase クエリ: moderation_status = 'approved'、created_at DESC
    - タグフィルタ: fixed_tags @> [tag] で GIN インデックスを活用
    - キーワード検索: title, description に対する ILIKE
    - ページネーション: page, limit, total, has_next を返却
    - _Requirements: 3.1, 3.2, 3.4, 3.5, 3.6, 9.4_

  - [ ]\* 4.5 一覧取得のプロパティテストを作成する
    - **Property 8: 一覧取得は承認済みのみ**
    - 返却結果の全投稿が moderation_status = 'approved' であり、created_at 降順でソートされていることを検証
    - **Validates: Requirements 3.1, 3.2, 4.2**

  - [ ]\* 4.6 フィルタリングのプロパティテストを作成する
    - **Property 3: フィルタリングのメタモルフィックプロパティ**
    - タグフィルタ後の結果が全て指定タグを含み、件数がフィルタ前以下であることを検証
    - キーワード検索結果が全て title または description にキーワードを含むことを検証
    - **Validates: Requirements 3.4, 3.5**

  - [ ] 4.7 通報 API を実装する（POST /api/v1/community-suggestions/:id/report）
    - communityController に createReport を追加
    - 対象の SharedSuggestion が存在し approved 状態であることを確認
    - 重複通報チェック（同一 author_hash + shared_suggestion_id）
    - reports テーブルに INSERT
    - report_count をインクリメント
    - report_count >= 3 の場合、moderation_status を 'pending' に自動変更
    - エラー: 400, 404, 409（重複通報）, 429
    - _Requirements: 5.2, 5.3, 5.4_

  - [ ]\* 4.8 通報による自動非公開のプロパティテストを作成する
    - **Property 6: 通報による自動非公開の不変条件**
    - report_count が3以上の SharedSuggestion の moderation_status が approved でないことを検証
    - **Validates: Requirements 5.3**

  - [ ] 4.9 タグ一覧 API を実装する（GET /api/v1/community-suggestions/tags）
    - communityController に getTags を追加
    - FIXED_TAGS 定数を返却
    - _Requirements: 8.3_

  - [ ] 4.10 管理用承認 API を実装する（PATCH /api/v1/admin/community-suggestions/:id/moderate）
    - communityController に moderateSuggestion を追加
    - Authorization: Bearer <ADMIN_TOKEN> ヘッダーで簡易認証
    - ADMIN_TOKEN は環境変数 `COMMUNITY_ADMIN_TOKEN` で設定
    - status を approved / rejected に更新、reason を任意で設定
    - _Requirements: 4.3, 4.4_

  - [ ] 4.11 コミュニティルートを Express に登録する
    - `backend/src/api/routes/communityRoutes.ts` でルーティングを定義
    - `backend/src/api/routes/index.ts` に `router.use('/community-suggestions', communityRouter)` を追加
    - 管理用ルートは `/admin/community-suggestions` に配置
    - _Requirements: 9.4_

- [ ] 5. チェックポイント - バックエンド API の確認
  - Ensure all tests pass, ask the user if questions arise.
  - 全 API エンドポイントが正しくレスポンスを返すことを確認
  - Supabase 接続・RLS・インデックスが正しく機能することを確認

- [ ] 6. フロントエンド API クライアント・匿名識別子・フック
  - [ ] 6.1 匿名識別子管理を実装する（getOrCreateAnonymousId, hashAnonymousId）
    - `frontend/src/services/community/anonymousId.ts` を新規作成
    - getOrCreateAnonymousId(): string — localStorage から UUID v4 を取得、なければ生成して保存
    - hashAnonymousId(id: string): Promise<string> — crypto.subtle.digest で SHA-256 ハッシュ化
    - ANON_ID_KEY = 'kibarashi_anonymous_id'
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

  - [ ] 6.2 コミュニティ API クライアントを実装する（communityApi.ts）
    - `frontend/src/services/community/communityApi.ts` を新規作成
    - fetchSharedSuggestions(query): Promise<{ data, pagination }>
    - createSharedSuggestion(data): Promise<{ data, message }>
    - reportSuggestion(id, data): Promise<{ data, message }>
    - fetchTags(): Promise<FixedTag[]>
    - 既存の `frontend/src/services/api/client.ts` の API ベース URL 設定を再利用
    - エラーハンドリング: 400, 404, 409, 413, 429, 500 の各ステータスに対応
    - _Requirements: 1.1, 1.5, 3.7, 5.5, 9.4_

  - [ ] 6.3 useCommunity フックを作成する
    - `frontend/src/features/community/useCommunity.ts` を新規作成
    - 状態管理: suggestions, loading, error, pagination, selectedTag, searchKeyword
    - fetchSuggestions(query): 一覧取得 + ページネーション
    - loadMore(): 次ページ読み込み（無限スクロール用）
    - submitSuggestion(data): 投稿作成（author_hash 自動付与）
    - reportSuggestion(id, reason): 通報送信（author_hash 自動付与）
    - filterByTag(tag): タグフィルタ
    - searchByKeyword(keyword): キーワード検索
    - _Requirements: 1.1, 3.2, 3.4, 3.5, 3.6, 5.2_

- [ ] 7. フロントエンド UI コンポーネント実装
  - [ ] 7.1 CommunityTagFilter コンポーネントを追加する
    - `frontend/src/features/community/CommunityTagFilter.tsx` を新規作成
    - FIXED_TAGS をチップ UI で表示
    - 選択/解除でフィルタリング
    - キーワード検索テキスト入力
    - _Requirements: 3.4, 3.5_

  - [ ] 7.2 CommunityList コンポーネントを追加する
    - `frontend/src/features/community/CommunityList.tsx` を新規作成
    - useCommunity フックを使用
    - 承認済み SharedSuggestion を新着順で表示
    - 既存 SuggestionCard を再利用（toSuggestion 変換後に渡す）
    - 各カードにニックネーム、タグ、通報ボタンを追加表示
    - CommunityTagFilter を組み込み
    - 無限スクロール（Intersection Observer API）
    - ローディング・エラー・空状態の UI
    - _Requirements: 3.1, 3.2, 3.3, 3.6, 3.7, 7.3_

  - [ ] 7.3 CommunityShareForm コンポーネントを追加する
    - `frontend/src/features/community/CommunityShareForm.tsx` を新規作成
    - モーダル形式で表示
    - CustomSuggestion のデータ（title, description, category, duration, steps）を初期値として自動入力
    - 追加フィールド: ニックネーム（任意、プレースホルダー「名無しさん」）、固定タグ選択（チップ UI、複数可）
    - CustomStorage.validateFormData と同等のバリデーション
    - 投稿成功時: 「投稿しました。承認後に公開されます」トースト表示
    - 投稿失敗時: エラーメッセージ + 再試行ボタン
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 7.6_

  - [ ] 7.4 CommunityReportDialog コンポーネントを追加する
    - `frontend/src/features/community/CommunityReportDialog.tsx` を新規作成
    - 通報理由の選択肢: 不適切な内容、スパム、その他
    - 送信後に「通報を受け付けました」フィードバック表示
    - 重複通報時（409）: 「すでに通報済みです」メッセージ
    - レートリミット時（429）: 「しばらく時間をおいてから再度お試しください」メッセージ
    - _Requirements: 5.1, 5.4, 5.5_

  - [ ] 7.5 フロントエンド変換レイヤーを実装する
    - `frontend/src/features/community/converter.ts` を新規作成
    - toSuggestion(shared: SharedSuggestionListItem): Suggestion 互換オブジェクト
    - fromCustomSuggestion(custom: CustomSuggestion): CreateSharedSuggestionRequest の共通フィールド部分
    - _Requirements: 3.3, 7.3, 8.2, 8.4_

- [ ] 8. 既存画面への統合・ナビゲーション追加
  - [ ] 8.1 ナビゲーションに「みんなの気晴らし」タブを追加する
    - `frontend/src/components/layout/MainLayout.tsx` に onCommunityClick コールバックを追加
    - `frontend/src/App.tsx` の Step 型に `'community'` を追加
    - App.tsx に handleCommunityClick ハンドラーと CommunityList の遅延読み込みを追加
    - renderStep の switch に community ケースを追加
    - BottomNavigation または MainLayout のヘッダーナビに「みんなの気晴らし」アイコン+ラベルを追加
    - 3タップ以内でアクセス可能な導線を確保
    - _Requirements: 7.1, 7.2, 7.4, 7.5_

  - [ ] 8.2 既存 CustomSuggestionList 画面に「みんなに共有する」導線を追加する
    - `frontend/src/features/custom/CustomSuggestionList.tsx` に「みんなに共有する」ボタンを追加
    - ボタンタップで CommunityShareForm モーダルを開く
    - 選択された CustomSuggestion のデータをフォームに渡す
    - _Requirements: 1.1, 1.2_

- [ ] 9. チェックポイント - フロントエンド統合の確認
  - Ensure all tests pass, ask the user if questions arise.
  - ナビゲーションから「みんなの気晴らし」一覧にアクセスできることを確認
  - マイ気晴らしから「みんなに共有する」フローが動作することを確認
  - AI提案の主導線に影響がないことを確認

- [ ] 10. テスト追加
  - [ ]\* 10.1 バックエンド API のユニットテストを作成する
    - `backend/src/services/community/__tests__/` ディレクトリに各テストファイルを作成
    - sanitizer.test.ts: 正常系、HTMLタグ除去、scriptタグ除去、Unicode、空文字列、冪等性
    - communityValidator.test.ts: 正常系、各フィールドの境界値（0文字、100文字、101文字等）、不正な型
    - moderationService.test.ts: 禁止語検出、安全テキスト通過、医療的断定検出、スパムパターン
    - converter.test.ts: toSuggestion / fromSuggestion の具体例
    - _Requirements: 1.6, 4.5, 4.6, 6.2, 8.2, 8.4_

  - [ ]\* 10.2 バックエンド API の統合テストを作成する
    - `backend/tests/integration/community.integration.test.ts` を新規作成
    - Supertest を使用
    - POST /community-suggestions: 正常系、バリデーションエラー、自動モデレーション却下、レートリミット
    - GET /community-suggestions: 正常系、タグフィルタ、キーワード検索、ページネーション
    - POST /community-suggestions/:id/report: 正常系、重複通報、存在しない投稿、自動非公開
    - GET /community-suggestions/tags: 正常系
    - PATCH /admin/community-suggestions/:id/moderate: 正常系、認証エラー
    - _Requirements: 9.4_

  - [ ]\* 10.3 フロントエンド UI テストを作成する
    - @testing-library/react を使用
    - CommunityList.test.tsx: 一覧表示、フィルタ操作、無限スクロール、エラー状態、空状態
    - CommunityShareForm.test.tsx: フォーム表示、バリデーション、投稿成功/失敗
    - CommunityReportDialog.test.tsx: 通報理由選択、送信、重複通報エラー
    - CommunityTagFilter.test.tsx: タグ選択/解除、キーワード入力
    - _Requirements: 3.1, 3.4, 5.1, 7.3_

  - [ ]\* 10.4 既存機能の回帰テストを確認する
    - AI 提案フロー（状況選択 → 時間選択 → 提案表示）が正常に動作すること
    - マイ気晴らし（CustomSuggestion）の CRUD が正常に動作すること
    - SuggestionCard の既存表示が壊れていないこと
    - BottomNavigation / MainLayout の既存動作が維持されること
    - _Requirements: 7.1, 7.4_

- [ ] 11. 最終チェックポイント - 全テスト通過の確認
  - Ensure all tests pass, ask the user if questions arise.
  - `cd frontend && npx vitest run` でフロントエンドテスト通過を確認
  - `cd backend && npx vitest run` でバックエンドテスト通過を確認
  - 全プロパティテスト（Property 1〜8）が通過することを確認

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- 各タスクは前のタスクの成果物に依存するため、番号順に実装すること
- Supabase のセットアップ（プロジェクト作成、環境変数設定）はタスク 1.3〜1.4 の前提条件として手動で実施が必要
- プロパティテストには fast-check ライブラリを使用（タスク 2.2 で初回インストール）
- チェックポイント（タスク 3, 5, 9, 11）では、ユーザーに動作確認を依頼し、問題があればフィードバックを受ける
