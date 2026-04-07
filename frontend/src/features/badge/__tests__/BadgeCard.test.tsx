import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import BadgeCard from '../BadgeCard';
import type { BadgeDefinition } from '../../../types/badge';

const def: BadgeDefinition = {
  id: 'first_try',
  name: 'はじめの一歩',
  description: '初めての気晴らしを完了しました',
  category: 'first_step',
  conditionKey: 'first_try',
  hint: 'ヒント文言',
};

describe('BadgeCard', () => {
  it('未解除時はヒントを表示し解除情報は出さない', () => {
    // Given: 未解除
    // When: 描画
    render(<BadgeCard definition={def} unlocked={false} />);
    // Then: ヒントのみ
    expect(screen.getByTestId('badge-hint')).toHaveTextContent('ヒント文言');
    expect(screen.queryByTestId('badge-description')).not.toBeInTheDocument();
  });

  it('解除済みかつ選択時は説明と解除日時を表示', () => {
    // Given: 解除済み・選択
    // When: 描画
    render(
      <BadgeCard
        definition={def}
        unlocked
        unlockedAt="2026-01-01T00:00:00.000Z"
        selected
      />,
    );
    // Then
    expect(screen.getByTestId('badge-description')).toHaveTextContent(def.description);
    expect(screen.getByTestId('badge-unlocked-at')).toHaveTextContent('2026-01-01T00:00:00.000Z');
  });

  it('解除済みだが未選択のとき詳細は出さない', () => {
    render(<BadgeCard definition={def} unlocked unlockedAt="2026-01-01T00:00:00.000Z" selected={false} />);
    expect(screen.queryByTestId('badge-description')).not.toBeInTheDocument();
  });

  it('クリックで onSelect が呼ばれる', () => {
    const onSelect = vi.fn();
    render(<BadgeCard definition={def} unlocked={false} onSelect={onSelect} />);
    fireEvent.click(screen.getByTestId('badge-card-first_try'));
    expect(onSelect).toHaveBeenCalledTimes(1);
  });
});
