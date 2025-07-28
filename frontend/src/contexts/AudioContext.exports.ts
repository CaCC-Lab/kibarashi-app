// Exported functions from AudioContext to avoid fast refresh warnings
export const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export const calculateDuration = (start: number, end: number): number => {
  return Math.round((end - start) / 1000);
};

export const isAudioSupported = (): boolean => {
  return typeof window !== 'undefined' && 'Audio' in window;
};

export const getAudioErrorMessage = (error: Error): string => {
  if (error.name === 'NotAllowedError') {
    return 'ブラウザの音声再生が許可されていません。設定を確認してください。';
  }
  if (error.name === 'NotSupportedError') {
    return 'お使いのブラウザは音声再生に対応していません。';
  }
  return '音声の再生中にエラーが発生しました。';
};
