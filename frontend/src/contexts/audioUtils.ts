/**
 * 音声関連のユーティリティ関数
 * AudioContext.tsxから分離してfast refreshの警告を解決
 */

/**
 * 音声ファイルの時間をフォーマット（例: "1:23"）
 */
export const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

/**
 * 音声ファイルの長さを計算（分単位）
 */
export const calculateDuration = (audioBuffer: AudioBuffer): number => {
  return Math.round(audioBuffer.duration / 60);
};

/**
 * ブラウザが音声再生をサポートしているかチェック
 */
export const isAudioSupported = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  return !!(
    window.AudioContext || 
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext ||
    document.createElement('audio').canPlayType
  );
};

/**
 * 音声エラーメッセージを取得
 */
export const getAudioErrorMessage = (error: unknown): string => {
  if (error instanceof DOMException) {
    switch (error.name) {
      case 'NotAllowedError':
        return '音声の再生が許可されていません。画面をタップしてから再度お試しください。';
      case 'NotSupportedError':
        return 'このブラウザでは音声再生がサポートされていません。';
      case 'AbortError':
        return '音声の読み込みが中断されました。';
      default:
        return `音声エラー: ${error.message}`;
    }
  }
  
  if (error instanceof Error) {
    return error.message;
  }
  
  return '不明なエラーが発生しました。';
};