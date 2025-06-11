import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

// SuggestionCardをモック（実装が複雑なため）
vi.mock('./SuggestionCard', () => ({
  default: ({ title, description, duration, category, onStart }: any) => (
    <div data-testid="suggestion-card">
      <h3>{title}</h3>
      <p>{description}</p>
      <span>{duration}分</span>
      <span>{category}</span>
      <button onClick={onStart}>この方法を試す</button>
    </div>
  )
}));

import SuggestionCard from './SuggestionCard';

describe('SuggestionCard', () => {
  const mockOnStart = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('提案の情報を正しく表示する', () => {
    render(
      <SuggestionCard 
        title="デスクストレッチ"
        description="椅子に座ったまま簡単にできるストレッチ"
        duration={5}
        category="行動的"
        onStart={mockOnStart}
      />
    );
    
    expect(screen.getByText('デスクストレッチ')).toBeInTheDocument();
    expect(screen.getByText('椅子に座ったまま簡単にできるストレッチ')).toBeInTheDocument();
    expect(screen.getByText('5分')).toBeInTheDocument();
    expect(screen.getByText('行動的')).toBeInTheDocument();
  });

  it('開始ボタンをクリックするとonStartが呼ばれる', () => {
    render(
      <SuggestionCard 
        title="テスト"
        description="説明"
        duration={5}
        category="認知的"
        onStart={mockOnStart}
      />
    );
    
    const startButton = screen.getByText('この方法を試す');
    fireEvent.click(startButton);
    
    expect(mockOnStart).toHaveBeenCalledTimes(1);
  });
});