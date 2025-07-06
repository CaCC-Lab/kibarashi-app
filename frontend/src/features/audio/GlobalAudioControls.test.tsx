/**
 * GlobalAudioControls コンポーネントのテスト
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AudioProvider } from '../../contexts/AudioContext';
import GlobalAudioControls from './GlobalAudioControls';
import React from 'react';

// useFeatureフックをモック
vi.mock('../config/featureFlags', () => ({
  useFeature: vi.fn(() => true)  // 音声ガイド機能を有効として扱う
}));

// テスト用ラッパー
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <AudioProvider>
    {children}
  </AudioProvider>
);

describe('GlobalAudioControls', () => {
  it('登録プレイヤーがない場合は何も表示しない', () => {
    const { container } = render(
      <GlobalAudioControls />,
      { wrapper: TestWrapper }
    );

    // 登録プレイヤーがないため、何も表示されない
    expect(container.firstChild).toBeNull();
  });
});

