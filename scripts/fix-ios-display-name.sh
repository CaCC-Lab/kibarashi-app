#!/bin/bash
# cap sync 後に Info.plist の CFBundleDisplayName を修正するスクリプト
# capacitor.config.ts の appName は cap sync で Info.plist に反映されないため

PLIST="frontend/ios/App/App/Info.plist"
APP_NAME="気晴らしレシピ"

if [ -f "$PLIST" ]; then
  sed -i '' "s|<string>5分気晴らし</string>|<string>${APP_NAME}</string>|g" "$PLIST"
  # 汎用的にCFBundleDisplayNameの次の行を置換
  /usr/libexec/PlistBuddy -c "Set :CFBundleDisplayName ${APP_NAME}" "$PLIST" 2>/dev/null
  echo "✅ iOS CFBundleDisplayName を「${APP_NAME}」に設定しました"
else
  echo "⚠️ ${PLIST} が見つかりません（cap sync を先に実行してください）"
fi
