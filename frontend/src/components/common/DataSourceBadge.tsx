import React from 'react';

/**
 * データ取得元を表示するバッジコンポーネント
 * 
 * 設計思想：
 * - ユーザーの注意を邪魔しない控えめなデザイン
 * - 必要な時だけ詳細情報を表示（プログレッシブディスクロージャー）
 * - アクセシビリティを考慮した実装
 * 
 * なぜこの機能が必要か：
 * - 透明性：データの出所を明確にすることで信頼性向上
 * - デバッグ：開発時の問題特定を容易に
 * - ユーザー安心感：オフラインでも動作することを伝える
 */

// データソースの種類を定義
export type DataSource = 'ai' | 'fallback' | 'cache' | 'error';

interface DataSourceBadgeProps {
  source: DataSource;
  showDetails?: boolean; // デバッグモード時の詳細表示
  apiKeyIndex?: number;  // 使用されたAPIキーのインデックス
  responseTime?: number; // レスポンス時間（ミリ秒）
  className?: string;    // 追加のクラス名
}

// 各データソースの表示設定
const sourceConfig = {
  ai: {
    icon: '✨', // AI/魔法を表す絵文字
    label: 'AI生成',
    color: 'text-purple-600 bg-purple-50 border-purple-200',
    darkColor: 'dark:text-purple-400 dark:bg-purple-900/20 dark:border-purple-800',
    ariaLabel: 'この提案はAIによって生成されました'
  },
  fallback: {
    icon: '📋', // 準備された内容を表す絵文字
    label: 'オフライン',
    color: 'text-gray-600 bg-gray-50 border-gray-200',
    darkColor: 'dark:text-gray-400 dark:bg-gray-900/20 dark:border-gray-800',
    ariaLabel: 'この提案は事前に準備されたデータから提供されています'
  },
  cache: {
    icon: '💾', // 保存されたデータを表す絵文字
    label: 'キャッシュ',
    color: 'text-blue-600 bg-blue-50 border-blue-200',
    darkColor: 'dark:text-blue-400 dark:bg-blue-900/20 dark:border-blue-800',
    ariaLabel: 'この提案はキャッシュから取得されました'
  },
  error: {
    icon: '⚡', // フォールバック/代替を表す絵文字
    label: 'フォールバック',
    color: 'text-amber-600 bg-amber-50 border-amber-200',
    darkColor: 'dark:text-amber-400 dark:bg-amber-900/20 dark:border-amber-800',
    ariaLabel: '通信エラーのため、事前準備された提案を表示しています'
  }
};

export const DataSourceBadge: React.FC<DataSourceBadgeProps> = ({
  source,
  showDetails = false,
  apiKeyIndex,
  responseTime,
  className = ''
}) => {
  const config = sourceConfig[source] || {
    icon: '❓',
    label: '不明',
    color: 'text-gray-600 bg-gray-50 border-gray-200',
    darkColor: 'dark:text-gray-400 dark:bg-gray-900/20 dark:border-gray-800',
    ariaLabel: 'データソースが不明です'
  };

  return (
    <div className="group relative inline-block">
      {/* メインバッジ */}
      <div 
        data-testid="data-source-badge"
        className={`
          inline-flex items-center gap-1 px-2 py-0.5 
          rounded-full text-xs font-medium
          border transition-all duration-200
          ${config.color} ${config.darkColor}
          opacity-70 hover:opacity-100
          ${className}
        `}
        role="status"
        aria-label={config.ariaLabel}
      >
        <span className="text-[10px]" aria-hidden="true">
          {config.icon}
        </span>
        <span>{config.label}</span>
      </div>

      {/* ホバー時の詳細情報（デバッグモード時のみ） */}
      {showDetails && (apiKeyIndex !== undefined || responseTime !== undefined) && (
        <div className="
          absolute bottom-full left-1/2 -translate-x-1/2 mb-2 
          p-2 bg-gray-900 dark:bg-gray-800 text-white text-xs rounded shadow-lg
          opacity-0 group-hover:opacity-100 
          transition-opacity duration-200 pointer-events-none 
          whitespace-nowrap z-50
          before:content-[''] before:absolute before:top-full before:left-1/2 
          before:-translate-x-1/2 before:border-4 before:border-transparent 
          before:border-t-gray-900 dark:before:border-t-gray-800
        ">
          {source === 'ai' && apiKeyIndex !== undefined && (
            <div>APIキー: #{apiKeyIndex + 1}</div>
          )}
          {responseTime !== undefined && (
            <div>応答時間: {responseTime}ms</div>
          )}
          {source === 'cache' && (
            <div>キャッシュから取得</div>
          )}
        </div>
      )}
    </div>
  );
};

// デフォルトエクスポート
export default DataSourceBadge;