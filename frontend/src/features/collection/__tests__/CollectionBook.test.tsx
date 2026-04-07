import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import CollectionBook from '../CollectionBook';
import type { CollectionEntry, CollectionStats } from '../../../types/collection';

describe('CollectionBook', () => {
  it('体験済み数と全体数を「○○ / △△ 体験済み」で表示', () => {
    const entries: CollectionEntry[] = [
      {
        suggestionId: 'a',
        title: 'A',
        description: '説明A',
        category: '認知的',
        duration: 5,
        tried: true,
      },
      {
        suggestionId: 'b',
        title: 'B',
        description: '説明B',
        category: '行動的',
        duration: 5,
        tried: false,
      },
    ];
    const stats: CollectionStats = { totalCount: 2, triedCount: 1 };
    render(<CollectionBook entries={entries} stats={stats} />);
    expect(screen.getByTestId('collection-progress')).toHaveTextContent('1 / 2 体験済み');
  });

  it('未試行には概要を表示して試行済みと区別', () => {
    const entries: CollectionEntry[] = [
      {
        suggestionId: 'b',
        title: 'B',
        description: '未試行の概要',
        category: '行動的',
        duration: 5,
        tried: false,
      },
    ];
    const stats: CollectionStats = { totalCount: 1, triedCount: 0 };
    render(<CollectionBook entries={entries} stats={stats} />);
    expect(screen.getByTestId('entry-teaser-b')).toHaveTextContent('未試行の概要');
    expect(screen.getByTestId('entry-state-b')).toHaveTextContent('未試行');
  });

  it('競争的なコンプリート表現を含まない', () => {
    const entries: CollectionEntry[] = [];
    const stats: CollectionStats = { totalCount: 0, triedCount: 0 };
    render(<CollectionBook entries={entries} stats={stats} />);
    expect(screen.getByTestId('collection-book').textContent).not.toMatch(/コンプリート|目指そう/);
  });
});
