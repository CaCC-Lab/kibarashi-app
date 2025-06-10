const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';
const API_TIMEOUT = parseInt(import.meta.env.VITE_API_TIMEOUT || '30000');

interface RequestOptions extends RequestInit {
  timeout?: number;
}

class ApiClient {
  private baseUrl: string;
  private defaultTimeout: number;

  constructor(baseUrl: string, timeout: number) {
    this.baseUrl = baseUrl;
    this.defaultTimeout = timeout;
  }

  private async fetchWithTimeout(
    url: string,
    options: RequestOptions = {}
  ): Promise<Response> {
    const { timeout = this.defaultTimeout, ...fetchOptions } = options;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        ...fetchOptions,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('リクエストがタイムアウトしました');
      }
      throw error;
    }
  }

  async get<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    try {
      const response = await this.fetchWithTimeout(url, {
        ...options,
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error?.message || `HTTPエラー: ${response.status}`
        );
      }

      return await response.json();
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('ネットワークエラーが発生しました');
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
          ...options?.headers,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error?.message || `HTTPエラー: ${response.status}`
        );
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
      throw new Error('ネットワークエラーが発生しました');
    }
  }
}

export const apiClient = new ApiClient(API_BASE_URL, API_TIMEOUT);