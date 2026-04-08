import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import WeeklySummary from '../WeeklySummary';
import type { JourneySummary } from '../../../types/journey';

describe('WeeklySummary', () => {
  it('0件のときは数値を強調せずインサイトのみ', () => {
    // Given: 実行0
    const summary: JourneySummary = {
      periodStart: '2026-04-06T00:00:00.000Z',
      periodEnd: '2026-04-06T12:00:00.000Z',
      executionCount: 0,
      completionCount: 0,
      totalDurationSeconds: 0,
      insightMessage: 'まだ記録がありません',
    };
    // When
    render(<WeeklySummary summary={summary} />);
    // Then: 責めない文言
    expect(screen.getByTestId('weekly-insight')).toHaveTextContent('まだ記録がありません');
    expect(screen.queryByTestId('weekly-executions')).not.toBeInTheDocument();
  });

  it('今週データがあるときは回数・完了・時間を表示', () => {
    const summary: JourneySummary = {
      periodStart: '2026-04-06T00:00:00.000Z',
      periodEnd: '2026-04-08T12:00:00.000Z',
      executionCount: 2,
      completionCount: 1,
      totalDurationSeconds: 120,
      insightMessage: '今週は行動的な気晴らしを多く試しています',
    };
    render(<WeeklySummary summary={summary} />);
    expect(screen.getByTestId('weekly-executions')).toHaveTextContent('2');
    expect(screen.getByTestId('weekly-completions')).toHaveTextContent('1');
    expect(screen.getByTestId('weekly-duration')).toHaveTextContent('120');
    expect(screen.getByTestId('weekly-insight')).toHaveTextContent('今週は行動的');
  });

  it('前週比較の文言を含まない（今週の自分にフォーカス）', () => {
    const summary: JourneySummary = {
      periodStart: '2026-04-06T00:00:00.000Z',
      periodEnd: '2026-04-08T12:00:00.000Z',
      executionCount: 1,
      completionCount: 1,
      totalDurationSeconds: 60,
      insightMessage: '今週の自分のペースで、気晴らしを続けています',
    };
    render(<WeeklySummary summary={summary} />);
    expect(screen.getByTestId('weekly-insight').textContent).not.toMatch(/先週|前週|比較/);
  });
});
