#\!/bin/bash
# データソースバッジの手動テストスクリプト

echo "=== データソースバッジ表示テスト ==="
echo ""
echo "このスクリプトは、データソースバッジが正しく表示されているか確認します。"
echo ""

# サーバーの起動状態を確認
echo "1. バックエンド/フロントエンドサーバーの確認..."
if curl -s http://localhost:8081/health > /dev/null 2>&1; then
    echo "✅ バックエンドサーバー: 起動中 (port 8081)"
else
    echo "❌ バックエンドサーバー: 停止中"
    echo "   実行してください: cd backend && npm run dev"
fi

if curl -s http://localhost:3002 > /dev/null 2>&1; then
    echo "✅ フロントエンドサーバー: 起動中 (port 3002)"
else
    echo "❌ フロントエンドサーバー: 停止中"
    echo "   実行してください: cd frontend && npm run dev"
fi

echo ""
echo "2. API動作確認..."

# APIレスポンスを取得してdataSourceフィールドを確認
API_RESPONSE=$(curl -s "http://localhost:8081/api/v1/suggestions?situation=workplace&duration=5")

if [ -z "$API_RESPONSE" ]; then
    echo "❌ API応答なし"
else
    echo "✅ API応答あり"
    
    # dataSourceフィールドの存在を確認
    if echo "$API_RESPONSE"  < /dev/null |  grep -q '"dataSource"'; then
        echo "✅ dataSourceフィールド: 存在"
        
        # どのデータソースか確認
        if echo "$API_RESPONSE" | grep -q '"dataSource":"ai"'; then
            echo "   → AI生成モード"
        elif echo "$API_RESPONSE" | grep -q '"dataSource":"fallback"'; then
            echo "   → フォールバックモード"
        elif echo "$API_RESPONSE" | grep -q '"dataSource":"cache"'; then
            echo "   → キャッシュモード"
        elif echo "$API_RESPONSE" | grep -q '"dataSource":"error"'; then
            echo "   → エラー時フォールバックモード"
        fi
    else
        echo "❌ dataSourceフィールド: 存在しない"
    fi
fi

echo ""
echo "3. 手動確認手順:"
echo "   1) ブラウザで http://localhost:3002 を開く"
echo "   2) 年齢層選択をスキップ"
echo "   3) 状況（職場/家/外出先）を選択"
echo "   4) 時間（5分/15分/30分）を選択"
echo "   5) 提案カードが表示されたら確認:"
echo "      - カード内にバッジが表示されているか"
echo "      - バッジのテキスト（AI生成/オフライン/キャッシュ/フォールバック）"
echo "      - バッジのアイコン（✨/📋/💾/⚡）"
echo ""
echo "4. デバッグモード確認:"
echo "   開発環境では画面右下にデバッグモードトグルが表示されます。"
echo "   ONにすると、バッジに詳細情報（応答時間、APIキー番号）が表示されます。"
echo ""

# 現在のプロセスを表示
echo "5. 実行中のプロセス:"
ps aux | grep -E "node.*kibarashi" | grep -v grep | awk '{print "   " $11 " " $12}'

echo ""
echo "=== テスト完了 ==="
