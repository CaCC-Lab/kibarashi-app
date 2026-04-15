import { useState, useEffect, useCallback, useRef } from 'react';
import { Favorite } from '../types/favorites';
import { Suggestion } from '../services/api/types';
import { FavoritesStorage } from '../services/storage/favoritesStorage';
import { syncFavoritesToSupabase } from '../services/supabase/syncStorage';

interface UseFavoritesReturn {
  favorites: Favorite[];
  isFavorite: (suggestionId: string) => boolean;
  addFavorite: (suggestion: Suggestion) => void;
  removeFavorite: (suggestionId: string) => void;
  toggleFavorite: (suggestion: Suggestion) => void;
  clearFavorites: () => void;
  exportFavorites: () => string;
  importFavorites: (jsonData: string) => boolean;
}

/**
 * お気に入り機能を管理するフック
 */
export function useFavorites(): UseFavoritesReturn {
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const syncTimeoutRef = useRef<ReturnType<typeof setTimeout>>();

  // localStorage 変更後にデバウンスして Supabase に同期
  const syncToCloud = useCallback((favs: Favorite[]) => {
    if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
    syncTimeoutRef.current = setTimeout(() => {
      syncFavoritesToSupabase(favs).catch(() => {});
    }, 1000);
  }, []);

  // 初期ロード
  useEffect(() => {
    const loadFavorites = () => {
      const data = FavoritesStorage.getFavorites();
      setFavorites(data.favorites);
    };

    loadFavorites();

    // storage イベントを監視（他のタブでの変更を検知）
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'kibarashi-favorites') {
        loadFavorites();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
    };
  }, []);

  // お気に入りかどうかチェック
  const isFavorite = useCallback((suggestionId: string): boolean => {
    return favorites.some(fav => fav.suggestionId === suggestionId);
  }, [favorites]);

  // お気に入りに追加
  const addFavorite = useCallback((suggestion: Suggestion) => {
    const success = FavoritesStorage.addFavorite(suggestion);
    if (success) {
      const data = FavoritesStorage.getFavorites();
      setFavorites(data.favorites);
      syncToCloud(data.favorites);
    }
  }, [syncToCloud]);

  // お気に入りから削除
  const removeFavorite = useCallback((suggestionId: string) => {
    const success = FavoritesStorage.removeFavorite(suggestionId);
    if (success) {
      const data = FavoritesStorage.getFavorites();
      setFavorites(data.favorites);
      syncToCloud(data.favorites);
    }
  }, [syncToCloud]);

  // お気に入りをトグル
  const toggleFavorite = useCallback((suggestion: Suggestion) => {
    if (isFavorite(suggestion.id)) {
      removeFavorite(suggestion.id);
    } else {
      addFavorite(suggestion);
    }
  }, [isFavorite, addFavorite, removeFavorite]);

  // お気に入りをクリア
  const clearFavorites = useCallback(() => {
    FavoritesStorage.clearFavorites();
    setFavorites([]);
    syncToCloud([]);
  }, [syncToCloud]);

  // エクスポート
  const exportFavorites = useCallback((): string => {
    return FavoritesStorage.exportFavorites();
  }, []);

  // インポート
  const importFavorites = useCallback((jsonData: string): boolean => {
    const success = FavoritesStorage.importFavorites(jsonData);
    if (success) {
      const data = FavoritesStorage.getFavorites();
      setFavorites(data.favorites);
      syncToCloud(data.favorites);
    }
    return success;
  }, [syncToCloud]);

  return {
    favorites,
    isFavorite,
    addFavorite,
    removeFavorite,
    toggleFavorite,
    clearFavorites,
    exportFavorites,
    importFavorites
  };
}