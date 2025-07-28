/**
 * アプリ全体のデータ統合管理サービス
 * 
 * 設計思想：
 * - お気に入り、履歴、カスタム気晴らしのデータを一括管理
 * - デバイス間移行やバックアップを簡単に
 * - 各ストレージサービスの独立性を保持
 * - バージョン管理で互換性を確保
 */

import { FavoritesStorage } from './favoritesStorage';
import { HistoryStorage } from './historyStorage';
import { CustomStorage } from './customStorage';
import type { FavoriteData } from '../../types/favorites';
import type { HistoryData } from '../../types/history';
import type { CustomSuggestionData } from '../../types/custom';

// 統合エクスポートデータの型定義
export interface AppDataExport {
  version: string;
  exportedAt: string;
  appInfo: {
    name: string;
    version: string;
  };
  data: {
    favorites: FavoriteData;
    history: HistoryData;
    customSuggestions: CustomSuggestionData;
  };
}

// エクスポート統計情報
export interface ExportStats {
  totalFavorites: number;
  totalHistory: number;
  totalCustomSuggestions: number;
  exportSize: number; // バイト単位
}

// インポート結果
export interface ImportResult {
  success: boolean;
  importedData?: {
    favorites: number;
    history: number;
    customSuggestions: number;
  };
  errors?: string[];
}

export class AppDataManager {
  private static readonly CURRENT_VERSION = '1.0.0';
  private static readonly APP_NAME = '5分気晴らし';
  private static readonly APP_VERSION = '2.0.0'; // Phase 2バージョン

  /**
   * 全アプリデータを統合エクスポート
   */
  static exportAllData(): AppDataExport {
    const favorites = FavoritesStorage.getFavorites();
    const history = HistoryStorage.getHistory();
    const customSuggestions = CustomStorage.getCustomSuggestions();

    return {
      version: this.CURRENT_VERSION,
      exportedAt: new Date().toISOString(),
      appInfo: {
        name: this.APP_NAME,
        version: this.APP_VERSION
      },
      data: {
        favorites,
        history,
        customSuggestions
      }
    };
  }

  /**
   * 統合エクスポートのJSON文字列を取得
   */
  static exportAllDataAsJSON(): string {
    const exportData = this.exportAllData();
    return JSON.stringify(exportData, null, 2);
  }

  /**
   * エクスポートデータの統計情報を取得
   */
  static getExportStats(): ExportStats {
    const exportData = this.exportAllData();
    const jsonString = JSON.stringify(exportData);

    return {
      totalFavorites: exportData.data.favorites.favorites.length,
      totalHistory: exportData.data.history.history.length,
      totalCustomSuggestions: exportData.data.customSuggestions.customs.length,
      exportSize: new Blob([jsonString]).size
    };
  }

  /**
   * JSONファイルとしてダウンロード
   */
  static downloadBackup(): void {
    try {
      const jsonData = this.exportAllDataAsJSON();
      const blob = new Blob([jsonData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `kibarashi-backup-${timestamp}.json`;
      
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to download backup:', error);
      throw new Error('バックアップファイルのダウンロードに失敗しました');
    }
  }

  /**
   * 統合インポート（全データ置き換え）
   */
  static importAllData(jsonData: string): ImportResult {
    try {
      const importData = JSON.parse(jsonData) as AppDataExport;
      
      // データ形式の検証
      const validationErrors = this.validateImportData(importData);
      if (validationErrors.length > 0) {
        return {
          success: false,
          errors: validationErrors
        };
      }

      // 各データを順次インポート
      const results = {
        favorites: 0,
        history: 0,
        customSuggestions: 0
      };

      // お気に入りデータのインポート
      if (importData.data.favorites) {
        const favoritesSuccess = FavoritesStorage.importFavorites(
          JSON.stringify(importData.data.favorites)
        );
        if (favoritesSuccess) {
          results.favorites = importData.data.favorites.favorites.length;
        }
      }

      // 履歴データのインポート
      if (importData.data.history) {
        const historySuccess = HistoryStorage.importHistory(
          JSON.stringify(importData.data.history),
          false // 置き換えモード
        );
        if (historySuccess) {
          results.history = importData.data.history.history.length;
        }
      }

      // カスタム気晴らしデータのインポート
      if (importData.data.customSuggestions) {
        const customSuccess = CustomStorage.importCustomSuggestions(
          JSON.stringify(importData.data.customSuggestions),
          false // 置き換えモード
        );
        if (customSuccess) {
          results.customSuggestions = importData.data.customSuggestions.customs.length;
        }
      }

      return {
        success: true,
        importedData: results
      };

    } catch (error) {
      console.error('Failed to import data:', error);
      return {
        success: false,
        errors: ['データの読み込みに失敗しました。ファイル形式を確認してください。']
      };
    }
  }

  /**
   * 統合インポート（マージモード）
   */
  static mergeAllData(jsonData: string): ImportResult {
    try {
      const importData = JSON.parse(jsonData) as AppDataExport;
      
      // データ形式の検証
      const validationErrors = this.validateImportData(importData);
      if (validationErrors.length > 0) {
        return {
          success: false,
          errors: validationErrors
        };
      }

      const results = {
        favorites: 0,
        history: 0,
        customSuggestions: 0
      };

      // 各データをマージモードでインポート
      if (importData.data.favorites) {
        // お気に入りは重複チェックしてマージ
        const currentFavorites = FavoritesStorage.getFavorites();
        const importFavorites = importData.data.favorites.favorites;
        
        let addedCount = 0;
        importFavorites.forEach(importFav => {
          const exists = currentFavorites.favorites.some(
            existing => existing.suggestionId === importFav.suggestionId
          );
          if (!exists) {
            // 新しいお気に入りを個別に追加
            const suggestion = {
              id: importFav.suggestionId,
              title: importFav.title,
              description: importFav.description,
              category: importFav.category,
              duration: importFav.duration,
              steps: importFav.steps || []
            };
            if (FavoritesStorage.addFavorite(suggestion)) {
              addedCount++;
            }
          }
        });
        results.favorites = addedCount;
      }

      // 履歴データのマージ
      if (importData.data.history) {
        const historySuccess = HistoryStorage.importHistory(
          JSON.stringify(importData.data.history),
          true // マージモード
        );
        if (historySuccess) {
          results.history = importData.data.history.history.length;
        }
      }

      // カスタム気晴らしデータのマージ
      if (importData.data.customSuggestions) {
        const customSuccess = CustomStorage.importCustomSuggestions(
          JSON.stringify(importData.data.customSuggestions),
          true // マージモード
        );
        if (customSuccess) {
          results.customSuggestions = importData.data.customSuggestions.customs.length;
        }
      }

      return {
        success: true,
        importedData: results
      };

    } catch (error) {
      console.error('Failed to merge data:', error);
      return {
        success: false,
        errors: ['データのマージに失敗しました。ファイル形式を確認してください。']
      };
    }
  }

  /**
   * すべてのアプリデータをクリア
   */
  static clearAllData(): boolean {
    try {
      FavoritesStorage.clearFavorites();
      HistoryStorage.clearHistory();
      CustomStorage.clearCustomSuggestions();
      return true;
    } catch (error) {
      console.error('Failed to clear all data:', error);
      return false;
    }
  }

  /**
   * インポートデータの検証
   */
  private static validateImportData(data: unknown): string[] {
    const errors: string[] = [];

    // 基本構造の検証
    if (!data || typeof data !== 'object') {
      errors.push('無効なデータ形式です');
      return errors;
    }

    // バージョン情報の確認
    if (!data.version || typeof data.version !== 'string') {
      errors.push('バージョン情報が見つかりません');
    }

    // データセクションの確認
    if (!data.data || typeof data.data !== 'object') {
      errors.push('データセクションが見つかりません');
      return errors;
    }

    // 各データタイプの検証
    if (data.data.favorites && !Array.isArray(data.data.favorites.favorites)) {
      errors.push('お気に入りデータの形式が無効です');
    }

    if (data.data.history && !Array.isArray(data.data.history.history)) {
      errors.push('履歴データの形式が無効です');
    }

    if (data.data.customSuggestions && !Array.isArray(data.data.customSuggestions.customs)) {
      errors.push('カスタム気晴らしデータの形式が無効です');
    }

    return errors;
  }

  private static readFileAsText(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(reader.error);
      reader.readAsText(file);
    });
  }

  /**
   * ファイルからの読み込み
   */
  static async importFromFile(file: File): Promise<ImportResult> {
    if (!file) {
      return { success: false, errors: ['ファイルが選択されていません'] };
    }
    try {
      const text = await this.readFileAsText(file);
      return this.importAllData(text);
    } catch (error) {
      console.error('Failed to read file:', error);
      return {
        success: false,
        errors: ['ファイルの読み込みに失敗しました']
      };
    }
  }

  /**
   * ファイルからのマージ読み込み
   */
  static async mergeFromFile(file: File): Promise<ImportResult> {
    if (!file) {
      return { success: false, errors: ['ファイルが選択されていません'] };
    }
    try {
      const text = await this.readFileAsText(file);
      return this.mergeAllData(text);
    } catch (error) {
      console.error('Failed to read file:', error);
      return {
        success: false,
        errors: ['ファイルの読み込みに失敗しました']
      };
    }
  }
}