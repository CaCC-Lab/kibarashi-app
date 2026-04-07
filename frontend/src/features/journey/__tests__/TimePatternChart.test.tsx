import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import TimePatternChart from '../TimePatternChart';
import type { TimePatternResult } from '../../../types/journey';

describe('TimePatternChart', () => {
  it('データ不足時は傾向の代わりにメッセージのみ', () => {
    const result: TimePatternResult = {
      hasEnoughData: false,
      frequentTimeSlot: null,
      effectiveDurationRange: null,
      message: 'もう少しデータが集まると傾向が見えてきます',
    };
    render(<TimePatternChart result={result} />);
    expect(screen.getByTestId('time-pattern-message')).toHaveTextContent(
      'もう少しデータが集まると傾向が見えてきます',
    );
    expect(screen.queryByTestId('frequent-slot')).not.toBeInTheDocument();
  });

  it('十分なデータがあるとき時間帯と所要時間を表示', () => {
    const result: TimePatternResult = {
      hasEnoughData: true,
      frequentTimeSlot: '朝',
      effectiveDurationRange: '5分以内',
      message: 'よく使う時間帯は朝、続けやすい所要時間は5分以内です',
    };
    render(<TimePatternChart result={result} />);
    expect(screen.getByTestId('frequent-slot')).toHaveTextContent('朝');
    expect(screen.getByTestId('duration-range')).toHaveTextContent('5分以内');
  });
});
