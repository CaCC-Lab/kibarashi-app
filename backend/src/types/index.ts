// 共通の型定義
export interface ApiResponse<T> {
  data?: T;
  error?: {
    message: string;
    statusCode: number;
    details?: unknown;
  };
  metadata?: {
    timestamp: string;
    [key: string]: unknown;
  };
}

export type Situation = 'workplace' | 'home' | 'outside';
export type Duration = 5 | 15 | 30;