#!/bin/bash

# データソースバッジの動作確認スクリプト
echo "=== データソースバッジ機能の動作確認 ==="

# Node.jsとnpmの確認
if ! command -v node &> /dev/null; then
    echo "❌ Node.jsがインストールされていません"
    exit 1
fi

echo "✅ Node.js $(node -v)"
echo "✅ npm $(npm -v)"

# 依存関係のインストール確認
echo ""
echo "📦 依存関係の確認..."
cd frontend
if [ ! -d "node_modules" ]; then
    echo "⚠️  node_modulesが見つかりません。npm installを実行します..."
    npm install
fi

echo ""
echo "📦 バックエンドの依存関係確認..."
cd ../backend
if [ ! -d "node_modules" ]; then
    echo "⚠️  node_modulesが見つかりません。npm installを実行します..."
    npm install
fi

# プロジェクトルートに戻る
cd ..

echo ""
echo "🚀 開発サーバーを起動します..."
echo ""
echo "### テスト手順 ###"
echo "1. ブラウザで http://localhost:3000 を開く"
echo "2. 状況と時間を選択して提案を表示"
echo "3. 各提案カードに以下が表示されることを確認："
echo "   - AI生成の場合: ✨ AI生成 バッジ（紫色）"
echo "   - フォールバックの場合: 📝 フォールバック バッジ（黄色）"
echo "   - エラー時の場合: ⚠️ エラー バッジ（赤色）"
echo ""
echo "4. デバッグモードトグル（右下）をONにして詳細情報を確認："
echo "   - 応答時間が表示される"
echo "   - APIキーインデックス（実装後）"
echo ""
echo "### 環境変数の確認 ###"
if [ -f "backend/.env" ]; then
    if grep -q "GEMINI_API_KEY" backend/.env; then
        echo "✅ GEMINI_API_KEY が設定されています - AI生成モード"
    else
        echo "⚠️  GEMINI_API_KEY が設定されていません - フォールバックモード"
    fi
else
    echo "⚠️  backend/.env ファイルが見つかりません - フォールバックモード"
fi

echo ""
echo "サーバーを起動中... (Ctrl+C で終了)"
echo ""

# 並列でフロントエンドとバックエンドを起動
(cd frontend && npm run dev) &
FRONTEND_PID=$!

(cd backend && npm run dev) &
BACKEND_PID=$!

# 終了時にプロセスをクリーンアップ
trap "kill $FRONTEND_PID $BACKEND_PID 2>/dev/null" EXIT

# プロセスが終了するまで待機
wait $FRONTEND_PID $BACKEND_PID