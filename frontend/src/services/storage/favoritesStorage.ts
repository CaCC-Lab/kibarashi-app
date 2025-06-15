import { Favorite, FavoriteData } from '../../types/favorites';
import { Suggestion } from '../api/types';

const FAVORITES_KEY = 'kibarashi-favorites';
const MAX_FAVORITES = 50; // お気に入りの最大保存数

export class FavoritesStorage {
  /**
   * お気に入りデータを取得
   */
  static getFavorites(): FavoriteData {
    try {
      const stored = localStorage.getItem(FAVORITES_KEY);
      if (!stored) {
        return { favorites: [], lastUpdated: new Date().toISOString() };
      }
      
      const data = JSON.parse(stored) as FavoriteData;
      // データ検証
      if (!Array.isArray(data.favorites)) {
        throw new Error('Invalid favorites data');
      }
      
      return data;
    } catch (error) {
      console.error('Failed to load favorites:', error);
      return { favorites: [], lastUpdated: new Date().toISOString() };
    }
  }

  /**
   * お気に入りを追加
   */
  static addFavorite(suggestion: Suggestion): boolean {
    try {
      const data = this.getFavorites();
      
      // 既に追加されているかチェック
      if (data.favorites.some(fav => fav.suggestionId === suggestion.id)) {
        return false;
      }
      
      // 最大数チェック
      if (data.favorites.length >= MAX_FAVORITES) {
        // 最も古いものを削除
        data.favorites.shift();
      }
      
      const favorite: Favorite = {
        id: `fav-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        suggestionId: suggestion.id,
        title: suggestion.title,
        description: suggestion.description,
        category: suggestion.category,
        duration: suggestion.duration,
        steps: suggestion.steps,
        addedAt: new Date().toISOString()
      };
      
      data.favorites.push(favorite);
      data.lastUpdated = new Date().toISOString();
      
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(data));
      return true;
    } catch (error) {
      console.error('Failed to add favorite:', error);
      return false;
    }
  }

  /**
   * お気に入りを削除
   */
  static removeFavorite(suggestionId: string): boolean {
    try {
      const data = this.getFavorites();
      const initialLength = data.favorites.length;
      
      data.favorites = data.favorites.filter(fav => fav.suggestionId !== suggestionId);
      
      if (data.favorites.length < initialLength) {
        data.lastUpdated = new Date().toISOString();
        localStorage.setItem(FAVORITES_KEY, JSON.stringify(data));
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Failed to remove favorite:', error);
      return false;
    }
  }

  /**
   * お気に入りかどうかチェック
   */
  static isFavorite(suggestionId: string): boolean {
    const data = this.getFavorites();
    return data.favorites.some(fav => fav.suggestionId === suggestionId);
  }

  /**
   * お気に入りをクリア
   */
  static clearFavorites(): void {
    try {
      localStorage.removeItem(FAVORITES_KEY);
    } catch (error) {
      console.error('Failed to clear favorites:', error);
    }
  }

  /**
   * お気に入りデータをエクスポート
   */
  static exportFavorites(): string {
    const data = this.getFavorites();
    return JSON.stringify(data, null, 2);
  }

  /**
   * お気に入りデータをインポート
   */
  static importFavorites(jsonData: string): boolean {
    try {
      const data = JSON.parse(jsonData) as FavoriteData;
      
      // データ検証
      if (!Array.isArray(data.favorites)) {
        throw new Error('Invalid favorites data format');
      }
      
      // 各お気に入りアイテムの検証
      for (const fav of data.favorites) {
        if (!fav.id || !fav.suggestionId || !fav.title) {
          throw new Error('Invalid favorite item');
        }
      }
      
      // 最大数制限
      if (data.favorites.length > MAX_FAVORITES) {
        data.favorites = data.favorites.slice(-MAX_FAVORITES);
      }
      
      data.lastUpdated = new Date().toISOString();
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(data));
      return true;
    } catch (error) {
      console.error('Failed to import favorites:', error);
      return false;
    }
  }
}