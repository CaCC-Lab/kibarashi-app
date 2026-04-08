# 要件定義書: みんなの気晴らし（コミュニティ共有機能）

## はじめに

「5分気晴らし」アプリに、ユーザーが自分の気晴らし方法を投稿し、他のユーザーが閲覧できるコミュニティ共有機能を追加する。既存の「マイ気晴らし（CustomSuggestion）」機能を土台とし、「AIの気晴らし」「マイ気晴らし」「みんなの気晴らし」の3つを明確に分離する。

### MVPスコープ

MVPでは以下に絞る:

- 「マイ気晴らし」から「みんなに共有する」導線で投稿
- 投稿は pending 状態で作成され、承認後に公開
- 承認済みの投稿のみ「みんなの気晴らし」一覧に表示
- 固定タグ（カテゴリー）のみ対応
- 匿名識別子による投稿者管理（ログイン不要）
- 通報機能あり
- Supabase / PostgreSQL ベースのバックエンド

### MVPが最も妥当である理由

1. 既存の CustomSuggestion データモデルとフォームを最大限再利用でき、開発コストが最小
2. 承認制により不適切投稿のリスクを管理しつつ、ユーザー登録なしの方針を維持できる
3. AI提案の主導線を壊さず、独立したタブ/セクションとして追加するだけで済む
4. リアクション・コメント・ランキング等のSNS的機能を排除することで、シンプルさを保てる
5. 固定タグのみにすることで、タグ汚染やスパムタグのリスクを排除できる
6. Supabase を使うことで、認証・DB・APIを一括で扱え、将来の拡張にも対応しやすい

### 非スコープ（MVPに含めないもの）

- コメント・返信機能
- フォロー機能
- いいね・リアクション機能
- 人気ランキング
- 投稿編集の高度な権限管理
- 自由入力タグ
- AI提案との混在表示
- ユーザープロフィールページ
- 投稿の画像添付
- SNSシェア機能

## 用語集

- **Shared_Suggestion**: ユーザーが投稿したコミュニティ共有用の気晴らし提案データ
- **Custom_Suggestion**: 既存の「マイ気晴らし」機能で localStorage に保存されるユーザー独自の気晴らし提案データ
- **Suggestion**: AI提案・フォールバック提案の表示用インターフェース（id, title, description, duration, category, steps を持つ）
- **Community_List**: 承認済みの Shared_Suggestion を一覧表示する画面（「みんなの気晴らし」）
- **Anonymous_Author_ID**: クライアント側で生成し localStorage に保存する匿名識別子。サーバーにはハッシュ化した値のみ送信する
- **Moderation_Status**: 投稿の承認状態を表す列挙値（pending, approved, rejected）
- **Fixed_Tag**: 運営側が事前定義したカテゴリータグ（自由入力不可）
- **Report**: ユーザーが不適切な投稿を通報するアクション
- **Submission_API**: Shared_Suggestion の投稿・取得・通報を処理するバックエンドAPI
- **SuggestionCard**: 既存の気晴らし提案カード表示コンポーネント（再利用対象）

## 要件

### 要件 1: 共有投稿の作成

**ユーザーストーリー:** マイ気晴らしを作成したユーザーとして、自分の気晴らし方法をコミュニティに共有したい。他のユーザーの役に立てることで、自分自身の気晴らしにもなるから。

#### 受け入れ条件

1. WHEN ユーザーが Custom_Suggestion の詳細画面で「みんなに共有する」ボタンをタップした場合、THE Submission_API SHALL Custom_Suggestion のデータ（title, description, category, duration, steps）を基に Shared_Suggestion を pending 状態で作成する
2. WHEN Shared_Suggestion の作成が成功した場合、THE Community_List SHALL 「投稿しました。承認後に公開されます」というフィードバックメッセージを表示する
3. WHEN ユーザーが任意のニックネームを入力した場合、THE Submission_API SHALL ニックネームを Shared_Suggestion に関連付けて保存する
4. WHEN ユーザーがニックネームを入力しなかった場合、THE Submission_API SHALL 「名無しさん」をデフォルトのニックネームとして使用する
5. IF Submission_API への投稿リクエストが失敗した場合、THEN THE Community_List SHALL エラーメッセージを表示し、ユーザーに再試行を促す
6. THE Submission_API SHALL 投稿データに対して、タイトル100文字以内、説明500文字以内、ステップ10個以内、時間1〜120分のバリデーションを実施する（既存の CustomStorage.validateFormData と同等）

### 要件 2: 匿名識別子の管理

**ユーザーストーリー:** アプリのユーザーとして、ユーザー登録なしで投稿したい。登録の手間なく気軽に共有できることが、このアプリのシンプルさに合っているから。

#### 受け入れ条件

1. WHEN ユーザーが初めて共有機能を利用する場合、THE Community_List SHALL クライアント側で UUID v4 形式の Anonymous_Author_ID を生成し、localStorage に保存する
2. WHEN Shared_Suggestion を投稿する場合、THE Submission_API SHALL Anonymous_Author_ID を SHA-256 でハッシュ化した値のみをサーバーに送信する
3. WHILE Anonymous_Author_ID が localStorage に存在する場合、THE Community_List SHALL 同一の識別子を再利用して投稿の一貫性を保つ
4. IF localStorage から Anonymous_Author_ID が削除された場合、THEN THE Community_List SHALL 新しい Anonymous_Author_ID を生成する（以前の投稿との紐付けは失われる）
5. THE Submission_API SHALL サーバー側に平文の Anonymous_Author_ID を保存しない

### 要件 3: 共有投稿の一覧表示

**ユーザーストーリー:** アプリのユーザーとして、他のユーザーが共有した気晴らし方法を閲覧したい。自分では思いつかない気晴らし方法を発見できるから。

#### 受け入れ条件

1. THE Community_List SHALL Moderation_Status が approved の Shared_Suggestion のみを一覧に表示する
2. WHEN ユーザーが「みんなの気晴らし」タブを選択した場合、THE Community_List SHALL 承認済みの Shared_Suggestion を新着順で表示する
3. THE Community_List SHALL 各 Shared_Suggestion を既存の SuggestionCard 互換の形式に変換して表示する（title, description, category, duration, steps を Suggestion インターフェースにマッピング）
4. WHEN ユーザーが Fixed_Tag でフィルタリングした場合、THE Community_List SHALL 選択されたタグに一致する Shared_Suggestion のみを表示する
5. WHEN ユーザーがキーワードで検索した場合、THE Community_List SHALL タイトルまたは説明にキーワードを含む Shared_Suggestion を表示する
6. WHEN 一覧の末尾に到達した場合、THE Community_List SHALL 次のページのデータを自動的に読み込む（ページネーション）
7. IF Submission_API からのデータ取得が失敗した場合、THEN THE Community_List SHALL エラーメッセージを表示し、再試行ボタンを提供する

### 要件 4: モデレーション（承認制）

**ユーザーストーリー:** アプリの管理者として、投稿内容を承認してから公開したい。不適切な投稿がユーザーの目に触れることを防ぎたいから。

#### 受け入れ条件

1. WHEN 新しい Shared_Suggestion が投稿された場合、THE Submission_API SHALL Moderation_Status を pending に設定する
2. WHILE Moderation_Status が pending の場合、THE Community_List SHALL 投稿を公開一覧に表示しない
3. WHEN 管理者が投稿を承認した場合、THE Submission_API SHALL Moderation_Status を approved に更新する
4. WHEN 管理者が投稿を却下した場合、THE Submission_API SHALL Moderation_Status を rejected に更新する
5. THE Submission_API SHALL 投稿テキストに対して、禁止語リストによる自動フィルタリングを実施する
6. IF 投稿テキストに禁止語が含まれる場合、THEN THE Submission_API SHALL 投稿を自動的に rejected に設定し、管理者の手動確認を不要にする

### 要件 5: 通報機能

**ユーザーストーリー:** アプリのユーザーとして、不適切な投稿を通報したい。コミュニティの安全性を保つために貢献したいから。

#### 受け入れ条件

1. WHEN ユーザーが Shared_Suggestion の通報ボタンをタップした場合、THE Community_List SHALL 通報理由の選択肢（不適切な内容、スパム、その他）を表示する
2. WHEN ユーザーが通報理由を選択して送信した場合、THE Submission_API SHALL Report を作成し、対象の Shared_Suggestion に関連付ける
3. WHEN 同一の Shared_Suggestion に対する Report が3件以上蓄積した場合、THE Submission_API SHALL 対象の Shared_Suggestion を自動的に非公開（pending に戻す）にする
4. THE Submission_API SHALL 同一の Anonymous_Author_ID から同一の Shared_Suggestion に対する重複通報を拒否する
5. WHEN 通報が正常に送信された場合、THE Community_List SHALL 「通報を受け付けました」というフィードバックメッセージを表示する

### 要件 6: セキュリティ・スパム対策

**ユーザーストーリー:** アプリの管理者として、スパムや悪意のある投稿からコミュニティを保護したい。ユーザーが安心して利用できる環境を維持したいから。

#### 受け入れ条件

1. THE Submission_API SHALL 同一の Anonymous_Author_ID からの投稿を1時間あたり5件以内に制限する（レートリミット）
2. THE Submission_API SHALL 投稿データに含まれる HTML タグおよびスクリプトタグをサニタイズする
3. THE Submission_API SHALL 投稿リクエストのペイロードサイズを10KB以内に制限する
4. IF レートリミットを超過した投稿リクエストを受信した場合、THEN THE Submission_API SHALL HTTP 429 ステータスコードとリトライ可能時刻を返す
5. THE Submission_API SHALL 通報リクエストに対しても、同一の Anonymous_Author_ID から1時間あたり10件以内のレートリミットを適用する
6. THE Submission_API SHALL すべてのユーザー入力に対して、SQLインジェクションおよびXSS攻撃を防ぐためのエスケープ処理を実施する（Supabase のパラメータ化クエリを使用）

### 要件 7: 既存UXとの共存

**ユーザーストーリー:** アプリの既存ユーザーとして、共有機能が追加されても、これまでと同じシンプルな操作感でAI提案やマイ気晴らしを使い続けたい。

#### 受け入れ条件

1. THE Community_List SHALL AI提案の主導線（状況選択 → 時間選択 → 提案表示）に影響を与えない独立したタブ/セクションとして実装する
2. THE Community_List SHALL 既存の「マイ気晴らし」タブと同列のナビゲーション項目として「みんなの気晴らし」を追加する
3. THE Community_List SHALL 既存の SuggestionCard コンポーネントを再利用して Shared_Suggestion を表示する（SharedSuggestion → Suggestion 互換オブジェクトへの変換レイヤーを設ける）
4. WHILE ユーザーがAI提案の主導線を操作している場合、THE Community_List SHALL 共有投稿の情報を表示しない
5. THE Community_List SHALL 3タップ以内で「みんなの気晴らし」一覧にアクセスできる導線を提供する
6. THE Community_List SHALL 既存の CustomSuggestionForm のバリデーションロジックを共有投稿のバリデーションに再利用する

### 要件 8: データモデルと変換

**ユーザーストーリー:** 開発者として、共有投稿のデータモデルを既存のモデルと整合性を保ちつつ設計したい。将来の拡張やメンテナンスを容易にするため。

#### 受け入れ条件

1. THE Submission_API SHALL Shared_Suggestion を以下のフィールドで管理する: id（UUID）, title, description, category（認知的 | 行動的）, duration（分）, steps（配列）, fixed_tags（Fixed_Tag の配列）, author_hash（ハッシュ化された Anonymous_Author_ID）, nickname, moderation_status（pending | approved | rejected）, report_count, created_at, updated_at
2. THE Community_List SHALL Shared_Suggestion を Suggestion インターフェース互換のオブジェクトに変換する際、id → id, title → title, description → description, category → category, duration → duration, steps → steps のマッピングを行う
3. THE Submission_API SHALL Fixed_Tag として以下の定義済みタグを提供する: リラックス, 運動, 呼吸法, マインドフルネス, 創作, 音楽, 自然, コミュニケーション
4. FOR ALL 有効な Shared_Suggestion オブジェクト、Suggestion 互換オブジェクトへの変換後に再度 Shared_Suggestion に逆変換した場合、元のデータの title, description, category, duration, steps フィールドが保持される（ラウンドトリッププロパティ）

### 要件 9: Supabase / PostgreSQL バックエンド

**ユーザーストーリー:** 開発者として、Supabase / PostgreSQL を使って共有機能のバックエンドを構築したい。将来の拡張（リアクション、ランキング等）に対応しやすい基盤を作りたいから。

#### 受け入れ条件

1. THE Submission_API SHALL Supabase の PostgreSQL データベースに shared_suggestions テーブルを作成し、Shared_Suggestion のデータを永続化する
2. THE Submission_API SHALL Supabase の PostgreSQL データベースに reports テーブルを作成し、Report のデータを永続化する
3. THE Submission_API SHALL Supabase の Row Level Security（RLS）を有効にし、匿名ユーザーが approved 状態の Shared_Suggestion のみを読み取れるポリシーを設定する
4. THE Submission_API SHALL 投稿の作成・一覧取得・通報の各操作に対応する RESTful API エンドポイントを提供する
5. THE Submission_API SHALL shared_suggestions テーブルの moderation_status カラムと created_at カラムにインデックスを作成し、一覧取得のクエリパフォーマンスを確保する

## 正確性プロパティ（Property-Based Testing 用）

### プロパティ 1: SharedSuggestion ↔ Suggestion 変換のラウンドトリップ

任意の有効な SharedSuggestion オブジェクトに対して、Suggestion 互換オブジェクトへの変換（toSuggestion）を行い、その結果から SharedSuggestion の共通フィールドを復元（fromSuggestion）した場合、元の title, description, category, duration, steps が一致する。

- パターン: ラウンドトリッププロパティ
- テスト対象: 変換レイヤー（toSuggestion / fromSuggestion 関数）
- 生成戦略: title（1〜100文字の任意文字列）、description（1〜500文字の任意文字列）、category（認知的 | 行動的）、duration（1〜120の整数）、steps（0〜10個の任意文字列配列）

### プロパティ 2: バリデーションの冪等性

任意の投稿データに対して、バリデーション関数を1回適用した結果と2回適用した結果が同一である。

- パターン: 冪等性
- テスト対象: バリデーション関数（validateSharedSuggestion）
- 生成戦略: 有効・無効の両方を含む任意の投稿データ

### プロパティ 3: フィルタリングのメタモルフィックプロパティ

任意の Shared_Suggestion リストに対して、Fixed_Tag でフィルタリングした結果の件数は、フィルタリング前の件数以下である。

- パターン: メタモルフィックプロパティ
- テスト対象: フィルタリングロジック
- 生成戦略: 0〜50件の Shared_Suggestion リスト、任意の Fixed_Tag

### プロパティ 4: レートリミットの不変条件

任意の Anonymous_Author_ID に対して、1時間以内に受理された投稿数は常に5件以下である。

- パターン: 不変条件
- テスト対象: レートリミットロジック
- 生成戦略: 1〜20件の投稿リクエスト列、任意のタイムスタンプ

### プロパティ 5: サニタイズのラウンドトリップ安全性

任意の文字列に対して、サニタイズ関数を適用した結果には HTML タグおよびスクリプトタグが含まれない。かつ、サニタイズ関数を2回適用した結果は1回適用した結果と同一である（冪等性）。

- パターン: ラウンドトリップ安全性 + 冪等性
- テスト対象: サニタイズ関数（sanitizeInput）
- 生成戦略: HTML タグ・スクリプトタグ・通常テキスト・Unicode文字を含む任意の文字列

### プロパティ 6: 通報による自動非公開の不変条件

任意の Shared_Suggestion に対して、report_count が3以上になった場合、moderation_status は approved 以外の値になる。

- パターン: 不変条件
- テスト対象: 通報処理ロジック
- 生成戦略: 0〜10件の通報を持つ Shared_Suggestion
