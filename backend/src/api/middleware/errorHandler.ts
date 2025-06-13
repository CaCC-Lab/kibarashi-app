import { Request, Response, NextFunction } from 'express';
import { logger } from '../../utils/logger';

// アプリケーションエラーのインターフェース定義
// なぜ必要か：標準のErrorオブジェクトを拡張し、HTTPレスポンスに必要な
// ステータスコードや運用上のエラーかどうかの判定フラグを追加
export interface AppError extends Error {
  statusCode?: number; // HTTPステータスコード
  isOperational?: boolean; // 運用上のエラーかどうか（true: 予想されるエラー、false: システムエラー）
}

/**
 * Expressのグローバルエラーハンドラー
 * 
 * 設計思想：
 * 1. エラーを統一的に処理し、ユーザーにわかりやすいメッセージを返す
 * 2. エラーの3要素（何が起きたか、なぜ起きたか、どうすればよいか）を提供
 * 3. 開発環境と本番環境で適切に情報を出し分ける
 * 
 * なぜこの設計か：
 * - エラー処理がアプリケーション全体で一貫した体験を提供
 * - ユーザーがエラーに直面しても、次のアクションがわかる
 * - セキュリティを考慮し、本番環境では詳細すぎる情報を隠す
 * 
 * @param err - 発生したエラー
 * @param _req - Expressのリクエストオブジェクト（使用しないので_プレフィックス）
 * @param res - Expressのレスポンスオブジェクト
 * @param _next - Expressの次のミドルウェアへの関数（使用しないので_プレフィックス）
 */
export const errorHandler = (
  err: AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  // ステップ1: エラー情報の抽出
  // エラーがnullや文字列の場合も考慮
  const statusCode = err?.statusCode || 500;
  const message = err?.message || 'サーバーエラーが発生しました';

  // ステップ2: エラーログの記録
  // なぜ必要か：問題の追跡とデバッグのために、すべてのエラーを記録
  logger.error({
    error: {
      message: err?.message || 'Unknown error',
      stack: err?.stack,
      statusCode,
      isOperational: err?.isOperational,
      // リクエスト情報も記録（デバッグ用）
      request: {
        method: _req.method,
        url: _req.url,
        headers: _req.headers,
      },
    },
  });

  // ステップ3: ユーザーフレンドリーなエラーメッセージの生成
  const userMessage = generateUserFriendlyErrorMessage(statusCode, message);

  // ステップ4: レスポンスの送信
  res.status(statusCode).json({
    error: {
      message: userMessage.message,
      reason: userMessage.reason,
      solution: userMessage.solution,
      statusCode,
      // 開発環境では詳細情報も含める
      ...(process.env.NODE_ENV !== 'production' && {
        originalMessage: message,
        stack: err?.stack,
      }),
    },
  });
};

/**
 * HTTPステータスコードに基づいたユーザーフレンドリーなエラーメッセージを生成
 * 
 * なぜ必要か：
 * - 技術的なエラーメッセージをユーザーが理解できる形に変換
 * - エラーの3要素（何が起きたか、なぜ起きたか、どうすればよいか）を提供
 * 
 * @param statusCode - HTTPステータスコード
 * @param technicalMessage - 技術的なエラーメッセージ
 * @returns ユーザーフレンドリーなエラーメッセージオブジェクト
 */
function generateUserFriendlyErrorMessage(
  statusCode: number,
  technicalMessage: string
): { message: string; reason: string; solution: string } {
  // デフォルト値
  let message = 'エラーが発生しました';
  let reason = '';
  let solution = '';

  // ステータスコードに応じたメッセージの生成
  switch (statusCode) {
    case 400:
      message = 'リクエストに問題があります';
      reason = '送信されたデータの形式が正しくありません。';
      solution = '入力内容を確認して、もう一度お試しください。';
      break;

    case 401:
      message = '認証が必要です';
      reason = 'アクセス権限がありません。';
      solution = 'ログインしてから再度お試しください。';
      break;

    case 403:
      message = 'アクセスが拒否されました';
      reason = 'この操作を行う権限がありません。';
      solution = 'アクセス権限があるか確認してください。';
      break;

    case 404:
      message = 'リソースが見つかりません';
      reason = '要求された情報が存在しないか、削除された可能性があります。';
      solution = 'URLが正しいか確認してください。';
      break;

    case 429:
      message = 'リクエストが多すぎます';
      reason = '短時間に多くのリクエストが送信されました。';
      solution = 'しばらく時間をおいてから再度お試しください。';
      break;

    case 500:
      message = 'サーバーエラーが発生しました';
      reason = 'サーバー側で予期しない問題が発生しました。';
      solution = '数分後にもう一度お試しください。問題が続く場合はサポートにお問い合わせください。';
      break;

    case 502:
    case 503:
      message = 'サービスが一時的に利用できません';
      reason = 'サーバーがメンテナンス中か、一時的に利用できない状態です。';
      solution = 'しばらく時間をおいてから再度アクセスしてください。';
      break;

    case 504:
      message = 'タイムアウトエラー';
      reason = 'サーバーからの応答が時間内に返ってきませんでした。';
      solution = 'ネットワーク接続を確認し、再度お試しください。';
      break;

    default:
      // その他のエラーの場合、技術的なメッセージから情報を抽出を試みる
      if (technicalMessage.toLowerCase().includes('timeout')) {
        message = '処理がタイムアウトしました';
        reason = '処理に時間がかかりすぎました。';
        solution = 'ネットワークが不安定な可能性があります。再度お試しください。';
      } else if (technicalMessage.toLowerCase().includes('connection')) {
        message = '接続エラー';
        reason = 'サーバーへの接続に失敗しました。';
        solution = 'インターネット接続を確認してください。';
      } else {
        // デフォルト
        message = '予期しないエラーが発生しました';
        reason = 'システムに問題が発生しました。';
        solution = 'ページを再読み込みしてください。問題が続く場合はサポートにお問い合わせください。';
      }
  }

  return { message, reason, solution };
}