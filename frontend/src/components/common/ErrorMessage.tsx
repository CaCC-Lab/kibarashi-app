import React from 'react';

// エラーメッセージコンポーネントのプロパティ定義
// なぜこの構造か：エラーメッセージを柔軟にカスタマイズできるようにし、
// 状況に応じた適切なガイダンスを提供するため
interface ErrorMessageProps {
  message: string; // エラーの内容
  onRetry?: () => void; // 再試行処理（オプション）
  title?: string; // エラーのタイトル（オプション）
  suggestion?: string; // カスタム解決策（オプション）
}

/**
 * ユーザーフレンドリーなエラーメッセージコンポーネント
 * 
 * 設計思想：「エラーは導きの機会」という原則に基づき、
 * エラー発生時にユーザーが次に何をすべきか明確に示す
 * 
 * エラーメッセージの3要素：
 * 1. 何が起きたか（message）
 * 2. なぜ起きたか（推測される原因）
 * 3. どうすればよいか（suggestion）
 * 
 * なぜこの設計か：
 * - ストレスを抱えたユーザーがエラーに直面しても、すぐに解決策が分かる
 * - 技術的な話を避け、具体的な行動を促す
 * - 再試行ボタンを提供し、ユーザーが簡単にリカバリーできる
 */
const ErrorMessage: React.FC<ErrorMessageProps> = ({ 
  message, 
  onRetry,
  title = 'エラーが発生しました',
  suggestion
}) => {
  /**
   * エラーメッセージから適切な原因と解決策を提案する
   * 
   * なぜこの機能が必要か：
   * - カスタムのsuggestionが指定されていない場合でも、
   *   エラー内容から適切な原因と解決策を提示する
   * - ユーザーが必ず次のアクションを取れるようにする
   * 
   * 処理の流れ：
   * 1. カスタムsuggestionがあればそれを使用
   * 2. なければエラーメッセージからキーワードを探して適切な提案を生成
   * 3. どれにも該当しない場合は汎用的な提案を返す
   */
  const generateReasonAndSolution = () => {
    // カスタムの提案があればそれを使用
    if (suggestion) {
      return { reason: '', solution: suggestion };
    }
    
    // エラーメッセージから原因と解決策を推測
    if (message.includes('ネットワーク') || message.includes('network')) {
      return {
        reason: 'インターネットに接続できていないか、不安定な可能性があります。',
        solution: 'Wi-Fiまたはモバイルデータ通信の接続状況を確認し、再度お試しください。'
      };
    }
    
    if (message.includes('取得に失敗')) {
      return {
        reason: 'サーバーからデータを取得できませんでした。',
        solution: 'サーバーが混雑している可能性があるため、しばらく待ってから再度お試しください。'
      };
    }
    
    if (message.includes('タイムアウト')) {
      return {
        reason: 'サーバーからの応答が指定時間内に返ってきませんでした。',
        solution: 'ネットワークが不安定な可能性があります。時間をおいてから再度アクセスしてください。'
      };
    }
    
    // デフォルトの原因と解決策
    return {
      reason: '予期しない問題が発生しました。',
      solution: 'ページを再読み込みしてください。問題が続く場合は、しばらく時間をおいてからお試しください。'
    };
  };

  const { reason, solution } = generateReasonAndSolution();

  return (
    // エラーメッセージの表示コンテナ
    // なぜこのデザインか：赤色系でエラーであることを示しつつ、
    // 不安を煽らないよう優しいトーンを使用
    <div className="bg-red-50 border border-red-200 rounded-lg p-4 animate-fadeIn">
      <div className="flex items-start gap-3">
        {/* エラーアイコン */}
        <div className="flex-shrink-0 w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
          <span className="text-red-600 text-lg font-bold">!</span>
        </div>
        <div className="flex-1">
          {/* ステップ1: 何が起きたか */}
          <h4 className="font-medium text-red-800 mb-1">
            {title}
          </h4>
          <p className="text-sm text-red-700">{message}</p>
          
          {/* ステップ2: なぜ起きたか（reasonがある場合のみ表示） */}
          {reason && (
            <p className="text-sm text-red-600 mt-1">
              🔍 {reason}
            </p>
          )}
          
          {/* ステップ3: どうすればよいか */}
          <p className="text-sm text-red-600 mt-2">
            💡 {solution}
          </p>
          {onRetry && (
            <button 
              onClick={onRetry}
              className="mt-3 text-sm text-red-700 underline hover:text-red-800 transition-colors"
            >
              もう一度試す
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ErrorMessage;