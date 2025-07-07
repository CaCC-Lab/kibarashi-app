import { useState, useEffect, useCallback } from 'react';

/**
 * ローカルストレージを使用するカスタムフック
 * @param key ストレージのキー
 * @param initialValue 初期値
 * @returns [値, 値を設定する関数]
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((val: T) => T)) => void] {
  // 初期値を取得する関数
  const readValue = useCallback((): T => {
    // SSR対策
    if (typeof window === 'undefined') {
      return initialValue;
    }

    try {
      const item = window.localStorage.getItem(key);
      return item ? (JSON.parse(item) as T) : initialValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  }, [initialValue, key]);

  // State
  const [storedValue, setStoredValue] = useState<T>(readValue);

  // 値を保存する関数
  const setValue = useCallback(
    (value: T | ((val: T) => T)) => {
      // SSR対策
      if (typeof window === 'undefined') {
        console.warn(
          `Tried setting localStorage key "${key}" even though environment is not a browser`
        );
        return;
      }

      try {
        // 関数の場合は現在の値を渡して実行
        const newValue = value instanceof Function ? value(storedValue) : value;
        
        // Stateを更新
        setStoredValue(newValue);
        
        // LocalStorageに保存
        window.localStorage.setItem(key, JSON.stringify(newValue));
        
        // 他のタブに変更を通知
        window.dispatchEvent(
          new StorageEvent('local-storage', {
            key,
            newValue: JSON.stringify(newValue),
          })
        );
      } catch (error) {
        console.warn(`Error setting localStorage key "${key}":`, error);
      }
    },
    [key, storedValue]
  );

  // 他のタブでの変更を監視
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key !== key || e.storageArea !== localStorage) return;
      
      try {
        setStoredValue(e.newValue ? JSON.parse(e.newValue) : initialValue);
      } catch (error) {
        console.warn(`Error parsing localStorage value for key "${key}":`, error);
      }
    };

    // カスタムイベントも監視（同一タブでの変更通知用）
    const handleLocalStorageChange = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail?.key !== key) return;
      
      try {
        setStoredValue(
          customEvent.detail.newValue
            ? JSON.parse(customEvent.detail.newValue)
            : initialValue
        );
      } catch (error) {
        console.warn(`Error parsing localStorage value for key "${key}":`, error);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('local-storage', handleLocalStorageChange as EventListener);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('local-storage', handleLocalStorageChange as EventListener);
    };
  }, [key, initialValue]);

  return [storedValue, setValue];
}