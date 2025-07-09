// APIクライアントの設定
// なぜ必要か：外部APIとの通信を一元管理し、タイムアウトやエラーハンドリングを統一するため
// 環境変数から設定を読み込むことで、環境ごとの設定変更を容易にする
// Vercel Functions対応：本番環境では相対パス、開発環境では絶対パスを使用
const getApiBaseUrl = (): string => {
  // 本番環境（Vercel）では相対パスを使用
  if (import.meta.env.PROD) {
    return window.location.origin;
  }
  
  // 開発環境での設定 - Viteプロキシを使用するため、同じオリジンを使用
  // ただし、実際のポートが3001になっている場合は、そのポートを使用
  if (typeof window !== 'undefined' && window.location.port === '3001') {
    return `${window.location.protocol}//${window.location.hostname}:3001`;
  }
  
  return import.meta.env.VITE_API_URL || window.location.origin;
};

const API_BASE_URL = getApiBaseUrl();
const API_TIMEOUT = parseInt(import.meta.env.VITE_API_TIMEOUT || '30000');

// Fetchオプションの拡張インターフェース
// なぜ必要か：標準のRequestInitにタイムアウト機能を追加するため
interface RequestOptions extends RequestInit {
  timeout?: number; // ミリ秒単位のタイムアウト時間
}

/**
 * APIクライアントクラス
 * 
 * 設計思想：
 * 1. タイムアウト処理を組み込んだ安全なHTTP通信
 * 2. エラーハンドリングの一元化
 * 3. レスポンスの型安全性を保証
 * 
 * なぜこの設計か：
 * - ネットワークの不安定な環境でも確実にタイムアウトする
 * - エラー時にユーザーが次に何をすべきか分かるメッセージを提供
 * - TypeScriptの型システムを活用して、APIレスポンスの型安全性を保証
 */
class ApiClient {
  private baseUrl: string;
  private defaultTimeout: number;

  constructor(baseUrl: string, timeout: number) {
    this.baseUrl = baseUrl;
    this.defaultTimeout = timeout;
  }

  /**
   * タイムアウト機能付きのfetch処理
   * 
   * なぜ必要か：
   * - 通常のfetchにはタイムアウト機能がないため、永遠に待ち続ける可能性がある
   * - ユーザー体験を考慮し、一定時間で確実にレスポンスを返す必要がある
   * 
   * 処理の流れ：
   * 1. AbortControllerを使用してキャンセル可能なリクエストを作成
   * 2. setTimeoutでタイムアウト時間を設定
   * 3. タイムアウトしたらリクエストをキャンセル
   */
  private async fetchWithTimeout(
    url: string,
    options: RequestOptions = {}
  ): Promise<Response> {
    const { timeout = this.defaultTimeout, ...fetchOptions } = options;

    // ステップ1: リクエストのキャンセル機能を準備
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        ...fetchOptions,
        signal: controller.signal,
        cache: 'no-store', // ブラウザのキャッシュを無効化
      });
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof Error && error.name === 'AbortError') {
        // より詳細なエラーメッセージを提供
        throw new Error(
          `リクエストがタイムアウトしました（${timeout / 1000}秒経過）。` +
          `ネットワーク接続が不安定な可能性があります。` +
          `Wi-Fiまたはモバイルデータ通信の接続状況を確認してください。`
        );
      }
      // fetchエラーをネットワークエラーとして処理
      if (error instanceof Error && error.message.includes('fetch failed')) {
        throw new Error(
          'ネットワークエラーが発生しました。' +
          'サーバーに接続できません。' +
          'インターネット接続を確認してください。'
        );
      }
      throw error;
    }
  }

  /**
   * GETリクエストを送信
   * 
   * @template T - レスポンスの型
   * @param endpoint - APIエンドポイント（例: '/api/v1/suggestions'）
   * @param options - リクエストオプション
   * @returns APIレスポンスを指定された型で返す
   * 
   * なぜジェネリクスを使うか：
   * - 呼び出し側でレスポンスの型を指定できるようにするため
   * - 型安全性を保ちながら、汎用的なAPIクライアントを実現
   */
  async get<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    try {
      const response = await this.fetchWithTimeout(url, {
        ...options,
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          ...options?.headers,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        // ユーザーフレンドリーなエラーメッセージを生成
        const userMessage = this.createUserFriendlyErrorMessage(
          response.status,
          errorData.error?.message
        );
        throw new Error(userMessage);
      }

      return await response.json();
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error(
        'ネットワークエラーが発生しました。' +
        'インターネット接続を確認し、もう一度お試しください。' +
        '問題が続く場合は、しばらく時間をおいてから再度アクセスしてください。'
      );
    }
  }

  async post<T>(
    endpoint: string,
    data: unknown,
    options?: RequestOptions & { responseType?: 'json' | 'blob' }
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    try {
      const response = await this.fetchWithTimeout(url, {
        ...options,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          ...options?.headers,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        // ユーザーフレンドリーなエラーメッセージを生成
        const userMessage = this.createUserFriendlyErrorMessage(
          response.status,
          errorData.error?.message
        );
        throw new Error(userMessage);
      }

      // responseTypeが'blob'の場合はBlobとして返す
      if (options?.responseType === 'blob') {
        return await response.blob() as T;
      }

      return await response.json();
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error(
        'ネットワークエラーが発生しました。' +
        'インターネット接続を確認し、もう一度お試しください。' +
        '問題が続く場合は、しばらく時間をおいてから再度アクセスしてください。'
      );
    }
  }
  /**
   * HTTPステータスコードに基づいたユーザーフレンドリーなエラーメッセージを生成
   * 
   * なぜ必要か：
   * - 技術的なエラーコードをユーザーが理解できるメッセージに変換
   * - エラーの原因と解決方法を明確に伝える
   */
  private createUserFriendlyErrorMessage(
    statusCode: number,
    serverMessage?: string
  ): string {
    // デフォルトメッセージ
    const message = serverMessage || `エラーが発生しました（コード: ${statusCode}）`;
    let reason = '';
    let solution = '';

    // ステータスコードに応じた詳細メッセージ
    switch (statusCode) {
      case 400:
        reason = 'リクエストの形式が正しくありません。';
        solution = 'ページを再読み込みして、もう一度お試しください。';
        break;
      case 401:
      case 403:
        reason = 'アクセス権限がありません。';
        solution = 'ログイン状態を確認してください。';
        break;
      case 404:
        reason = '要求されたリソースが見つかりません。';
        solution = 'URLが正しいか確認してください。';
        break;
      case 429:
        reason = 'リクエストが多すぎます。';
        solution = 'しばらく時間をおいてから再度お試しください。';
        break;
      case 500:
      case 502:
      case 503:
        reason = 'サーバーに一時的な問題が発生しています。';
        solution = '数分後にもう一度お試しください。問題が続く場合はサポートにお問い合わせください。';
        break;
      default:
        reason = '予期しないエラーが発生しました。';
        solution = 'ページを再読み込みしてください。';
    }

    return `${message} ${reason} ${solution}`;
  }
}

// シングルトンインスタンスとしてエクスポート
// なぜシングルトン：アプリケーション全体で同じ設定のAPIクライアントを使用するため
export const apiClient = new ApiClient(API_BASE_URL, API_TIMEOUT);