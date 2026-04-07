export interface Deck {
  id: string;
  name: string;
  description?: string;
  favoriteIds: string[];
  createdAt: string;
  updatedAt: string;
}

export interface DeckData {
  decks: Deck[];
  lastUpdated: string;
}
