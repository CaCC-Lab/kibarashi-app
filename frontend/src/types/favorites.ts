// お気に入り機能の型定義

export interface Favorite {
  id: string;
  suggestionId: string;
  title: string;
  description: string;
  category: '認知的' | '行動的';
  duration: number;
  steps?: string[];
  addedAt: string; // ISO 8601形式
}

export interface FavoriteData {
  favorites: Favorite[];
  lastUpdated: string;
}