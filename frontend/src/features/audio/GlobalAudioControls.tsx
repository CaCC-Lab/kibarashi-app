/**
 * グローバル音声コントロールコンポーネント
 * 
 * 機能：
 * - 全音声プレイヤーの一時停止
 * - 最後に再生していたプレイヤーの再開
 * - 現在の再生状態の表示
 * - 音声設定への簡単アクセス
 */

import React from 'react';
import { useAudio } from '../../contexts/AudioContext';

interface GlobalAudioControlsProps {
  className?: string;
}

/**
 * 一時停止アイコン
 */
const PauseAllIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
      d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

/**
 * 再開アイコン
 */
const ResumeIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
      d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
      d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

/**
 * 音声設定アイコン
 */
const SettingsIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
      d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

/**
 * グローバル音声コントロールコンポーネント
 */
export const GlobalAudioControls: React.FC<GlobalAudioControlsProps> = ({
  className = ''
}) => {
  const {
    activePlayerId,
    lastActivePlayerId,
    pauseAll,
    resumeLast,
    getRegisteredPlayers,
    getActivePlayer,
    settings,
    updateSettings
  } = useAudio();

  const registeredPlayers = getRegisteredPlayers();
  const activePlayer = getActivePlayer();
  const hasActivePlayers = registeredPlayers.length > 0;
  const canResume = lastActivePlayerId !== null && !activePlayerId;

  // 音声機能が無効な場合は表示しない
  if (!settings.enabled || !hasActivePlayers) {
    return null;
  }

  return (
    <div className={`bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg p-4 shadow-sm ${className}`}>
      <div className="flex items-center justify-between">
        {/* 現在の状態表示 */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${
              activePlayerId ? 'bg-green-500 animate-pulse' : 'bg-gray-300'
            }`} />
            <span className="text-sm text-gray-600 dark:text-gray-300">
              {activePlayerId ? (
                <span>
                  音声ガイド再生中
                  {activePlayer && (
                    <span className="ml-1 text-xs text-gray-500">
                      (提案 {activePlayer.suggestionId.slice(-1)})
                    </span>
                  )}
                </span>
              ) : (
                `${registeredPlayers.length}つの音声ガイドが利用可能`
              )}
            </span>
          </div>
        </div>

        {/* コントロールボタン */}
        <div className="flex items-center space-x-2">
          {/* 全て一時停止ボタン */}
          {activePlayerId && (
            <button
              onClick={pauseAll}
              className="p-2 text-gray-600 hover:text-gray-800 dark:text-gray-300 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
              title="全ての音声を一時停止"
              aria-label="全ての音声を一時停止"
            >
              <PauseAllIcon />
            </button>
          )}

          {/* 最後の音声を再開ボタン */}
          {canResume && (
            <button
              onClick={resumeLast}
              className="p-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-full transition-colors"
              title="最後の音声を再開"
              aria-label="最後の音声を再開"
            >
              <ResumeIcon />
            </button>
          )}

          {/* 音声設定切り替えボタン */}
          <button
            onClick={() => updateSettings({ enabled: !settings.enabled })}
            className={`p-2 rounded-full transition-colors ${
              settings.enabled
                ? 'text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/30'
                : 'text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
            title={settings.enabled ? '音声ガイドを無効にする' : '音声ガイドを有効にする'}
            aria-label={settings.enabled ? '音声ガイドを無効にする' : '音声ガイドを有効にする'}
          >
            <SettingsIcon />
          </button>
        </div>
      </div>

      {/* 詳細情報（デバッグ用、本番では削除） */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600 text-xs text-gray-500 dark:text-gray-400">
          <div>登録プレイヤー: {registeredPlayers.length}</div>
          <div>アクティブ: {activePlayerId || 'なし'}</div>
          <div>最後のアクティブ: {lastActivePlayerId || 'なし'}</div>
        </div>
      )}
    </div>
  );
};

export default GlobalAudioControls;