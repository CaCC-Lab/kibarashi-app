import { Deck } from '../../types/deck';

export interface DeckListProps {
  decks: Deck[];
  onSelect?: (deck: Deck) => void;
  onEdit?: (deck: Deck) => void;
  onDelete?: (id: string) => void;
}

export default function DeckList({ decks, onSelect, onEdit, onDelete }: DeckListProps) {
  return (
    <ul data-testid="deck-list">
      {decks.map((deck) => (
        <li key={deck.id} data-testid={`deck-row-${deck.id}`}>
          <button type="button" data-testid={`deck-select-${deck.id}`} onClick={() => onSelect?.(deck)}>
            {deck.name}
          </button>
          {deck.description && <span data-testid={`deck-desc-${deck.id}`}>{deck.description}</span>}
          <button type="button" data-testid={`deck-edit-${deck.id}`} onClick={() => onEdit?.(deck)}>
            編集
          </button>
          <button type="button" data-testid={`deck-delete-${deck.id}`} onClick={() => onDelete?.(deck.id)}>
            削除
          </button>
        </li>
      ))}
    </ul>
  );
}
