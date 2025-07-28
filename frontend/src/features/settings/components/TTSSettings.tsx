import React from 'react';

interface TTSSettingsProps {
  defaultTTS: 'gemini' | 'browser';
  onTTSChange: (value: 'gemini' | 'browser') => void;
}

export const TTSSettings: React.FC<TTSSettingsProps> = ({ defaultTTS, onTTSChange }) => {
  return (
    <div>
      <label className="block text-gray-700 dark:text-gray-300 mb-2">
        デフォルト音声エンジン
      </label>
      <div className="space-y-2">
        <label className="flex items-center">
          <input
            type="radio"
            name="tts"
            value="gemini"
            checked={defaultTTS === 'gemini'}
            onChange={() => onTTSChange('gemini')}
            className="text-primary-600 focus:ring-primary-500"
          />
          <span className="ml-2 text-gray-700 dark:text-gray-300">
            Gemini音声（高品質）
          </span>
        </label>
        <label className="flex items-center">
          <input
            type="radio"
            name="tts"
            value="browser"
            checked={defaultTTS === 'browser'}
            onChange={() => onTTSChange('browser')}
            className="text-primary-600 focus:ring-primary-500"
          />
          <span className="ml-2 text-gray-700 dark:text-gray-300">
            ブラウザ音声（無料）
          </span>
        </label>
      </div>
    </div>
  );
};