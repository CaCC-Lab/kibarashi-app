import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import SuggestionList from './SuggestionList';

// 依存関係をモック
vi.mock('./useSuggestions', () => ({
  useSuggestions: vi.fn()
}));

vi.mock('./SuggestionCard', () => ({
  default: ({ title, onStart }: any) => (
    <div data-testid="suggestion-card">
      <h3>{title}</h3>
      <button onClick={onStart}>この方法を試す</button>
    </div>
  )
}));

vi.mock('./SuggestionDetail', () => ({
  default: ({ title, onBack }: any) => (
    <div data-testid="suggestion-detail">
      <h2>{title}</h2>
      <button onClick={onBack}>戻る</button>
    </div>
  )
}));

import { useSuggestions } from './useSuggestions';

describe('SuggestionList', () => {
  const mockSuggestions = [
    {
      id: '1',
      title: '提案1',
      description: '説明1',
      duration: 5,
      category: '認知的' as const,
    },
    {
      id: '2',
      title: '提案2',
      description: '説明2',
      duration: 15,
      category: '行動的' as const,
    },
    {
      id: '3',
      title: '提案3',
      description: '説明3',
      duration: 30,
      category: '認知的' as const,
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('ローディング中はローディング表示を行う', () => {
    vi.mocked(useSuggestions).mockReturnValue({
      suggestions: [],
      loading: true,
      error: null,
      refetch: vi.fn(),
    });

    render(<SuggestionList situation="workplace" duration={5} />);
    
    expect(screen.getByText('気晴らし方法を探しています...')).toBeInTheDocument();
  });

  it('エラー時はエラーメッセージを表示する', () => {
    const mockRefetch = vi.fn();
    vi.mocked(useSuggestions).mockReturnValue({
      suggestions: [],
      loading: false,
      error: 'エラーが発生しました',
      refetch: mockRefetch,
    });

    render(<SuggestionList situation="workplace" duration={5} />);
    
    expect(screen.getByText('気晴らし方法の取得に失敗しました')).toBeInTheDocument();
  });

  it('提案を正しく表示する', () => {
    vi.mocked(useSuggestions).mockReturnValue({
      suggestions: mockSuggestions,
      loading: false,
      error: null,
      refetch: vi.fn(),
    });

    render(<SuggestionList situation="workplace" duration={5} />);
    
    expect(screen.getByText('あなたにおすすめの気晴らし方法')).toBeInTheDocument();
    expect(screen.getByText('職場で5分でできる気晴らしです')).toBeInTheDocument();
    expect(screen.getAllByTestId('suggestion-card')).toHaveLength(3);
  });

  it('提案がない場合はメッセージを表示する', () => {
    vi.mocked(useSuggestions).mockReturnValue({
      suggestions: [],
      loading: false,
      error: null,
      refetch: vi.fn(),
    });

    render(<SuggestionList situation="home" duration={15} />);
    
    expect(screen.getByText('提案が見つかりませんでした')).toBeInTheDocument();
  });
});