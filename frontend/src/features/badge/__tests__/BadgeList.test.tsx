import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import BadgeList from '../BadgeList';
import type { BadgeEvaluationResult } from '../../../types/badge';

vi.mock('../../../services/gamification/badgeEngine', () => ({
  BadgeEngine: {
    getBadgeDefinitions: vi.fn(() => [
      {
        id: 'first_try',
        name: 'はじめの一歩',
        description: '説明',
        category: 'first_step',
        conditionKey: 'first_try',
        hint: 'ヒント',
      },
    ]),
    evaluateBadges: vi.fn(),
  },
}));

describe('BadgeList', () => {
  it('評価結果に基づき全バッジ行を表示する', () => {
    // Given: 1件解除済み
    const evaluation: BadgeEvaluationResult = {
      unlocked: [
        {
          badgeId: 'first_try',
          unlockedAt: '2026-01-01T00:00:00.000Z',
          notificationSeen: false,
        },
      ],
      locked: [],
      newlyUnlocked: [],
    };
    // When
    render(<BadgeList evaluation={evaluation} />);
    // Then
    expect(screen.getByTestId('badge-list')).toBeInTheDocument();
    expect(screen.getByTestId('badge-card-first_try')).toHaveAttribute('data-unlocked', 'true');
  });

  it('onSelectBadge で選択状態を切り替えられる', () => {
    const evaluation: BadgeEvaluationResult = {
      unlocked: [],
      locked: [],
      newlyUnlocked: [],
    };
    const onSelect = vi.fn();
    render(
      <BadgeList evaluation={evaluation} selectedId={null} onSelectBadge={onSelect} />,
    );
    fireEvent.click(screen.getByTestId('badge-card-first_try'));
    expect(onSelect).toHaveBeenCalledWith('first_try');
  });
});
