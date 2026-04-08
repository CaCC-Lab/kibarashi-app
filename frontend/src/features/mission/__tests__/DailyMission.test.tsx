import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import DailyMission from '../DailyMission';
import type { DailyMission as Mission } from '../../../types/dailyMission';

const base: Mission = {
  id: 'm1',
  date: '2026-04-06',
  type: 'write_note',
  title: 'メモを書いてみませんか',
  description: '完了後に一言メモを残してみるのもおすすめです。',
  completed: false,
};

describe('DailyMission', () => {
  it('当日ミッションのタイトルと提案的な説明を表示', () => {
    render(<DailyMission mission={base} />);
    expect(screen.getByTestId('mission-title')).toHaveTextContent('メモを書いてみませんか');
    expect(screen.getByTestId('mission-description')).toHaveTextContent('おすすめです');
    expect(screen.getByTestId('mission-tone-ok')).toBeInTheDocument();
  });

  it('達成時は祝福メッセージを表示できる', () => {
    const done = { ...base, completed: true };
    render(<DailyMission mission={done} celebrationMessage="よくできました" />);
    expect(screen.getByTestId('mission-celebration')).toHaveTextContent('よくできました');
  });

  it('未達成でも否定的な文言を出さない', () => {
    render(<DailyMission mission={base} />);
    const text = screen.getByTestId('daily-mission').textContent ?? '';
    expect(text).not.toMatch(/失敗|ペナルティ|ダメ/);
  });

  it('ストリーク強調用のUIは表示しない', () => {
    render(<DailyMission mission={base} />);
    expect(screen.getByTestId('mission-no-streak')).toHaveAttribute('hidden');
  });
});
