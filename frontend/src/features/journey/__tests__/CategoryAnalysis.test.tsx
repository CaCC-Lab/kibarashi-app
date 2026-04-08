import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import CategoryAnalysis from '../CategoryAnalysis';
import type { CategoryAnalysisResult } from '../../../types/journey';

describe('CategoryAnalysis', () => {
  it('データ不足時はメッセージのみ', () => {
    const result: CategoryAnalysisResult = {
      hasEnoughData: false,
      categories: [],
      message: 'もう少しデータが集まると傾向が見えてきます',
    };
    render(<CategoryAnalysis result={result} />);
    expect(screen.getByTestId('category-message')).toHaveTextContent(
      'もう少しデータが集まると傾向が見えてきます',
    );
    expect(screen.queryByTestId('category-effective-list')).not.toBeInTheDocument();
  });

  it('十分なデータがあるときはリストを表示し順位表現を含まない', () => {
    const result: CategoryAnalysisResult = {
      hasEnoughData: true,
      categories: [
        { category: '認知的', averageRating: 4.5, count: 3 },
      ],
      message: '最近効いているカテゴリは認知的です',
    };
    render(<CategoryAnalysis result={result} />);
    expect(screen.getByTestId('category-effective-list')).toBeInTheDocument();
    expect(screen.getByTestId('category-row-認知的')).toBeInTheDocument();
    expect(screen.getByTestId('category-message').textContent).not.toMatch(/1位|2位|ランキング/);
  });
});
