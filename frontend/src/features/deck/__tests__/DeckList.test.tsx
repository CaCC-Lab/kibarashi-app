import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import DeckList from '../DeckList';
import type { Deck } from '../../../types/deck';

const decks: Deck[] = [
  {
    id: 'd1',
    name: '職場',
    description: 'メモ',
    favoriteIds: ['f1'],
    createdAt: 'x',
    updatedAt: 'x',
  },
];

describe('DeckList', () => {
  it('全デッキを一覧し選択・編集・削除できる', () => {
    const onSelect = vi.fn();
    const onEdit = vi.fn();
    const onDelete = vi.fn();
    render(<DeckList decks={decks} onSelect={onSelect} onEdit={onEdit} onDelete={onDelete} />);
    fireEvent.click(screen.getByTestId('deck-select-d1'));
    expect(onSelect).toHaveBeenCalledWith(decks[0]);
    fireEvent.click(screen.getByTestId('deck-edit-d1'));
    expect(onEdit).toHaveBeenCalledWith(decks[0]);
    fireEvent.click(screen.getByTestId('deck-delete-d1'));
    expect(onDelete).toHaveBeenCalledWith('d1');
  });

  it('空配列でもリストが描画される', () => {
    const { container } = render(<DeckList decks={[]} />);
    expect(container.querySelector('[data-testid="deck-list"]')).toBeInTheDocument();
  });
});
