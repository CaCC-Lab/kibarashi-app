import { Deck, DeckData } from '../../types/deck';

const STORAGE_KEY = 'kibarashi_decks';

function safeParse(raw: string | null): DeckData {
  if (!raw) {
    return { decks: [], lastUpdated: new Date().toISOString() };
  }
  try {
    const parsed = JSON.parse(raw) as DeckData;
    if (!Array.isArray(parsed.decks)) throw new Error('invalid');
    return {
      decks: parsed.decks,
      lastUpdated: parsed.lastUpdated ?? new Date().toISOString(),
    };
  } catch {
    console.error('Failed to parse deck storage');
    return { decks: [], lastUpdated: new Date().toISOString() };
  }
}

function save(data: DeckData): boolean {
  try {
    data.lastUpdated = new Date().toISOString();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    return true;
  } catch (e) {
    console.error('Failed to save decks:', e);
    return false;
  }
}

export class DeckStorage {
  static getDecks(): DeckData {
    return safeParse(localStorage.getItem(STORAGE_KEY));
  }

  static addDeck(name: string, description?: string): Deck | null {
    const trimmed = name?.trim();
    if (!trimmed) return null;
    const data = this.getDecks();
    const now = new Date().toISOString();
    const deck: Deck = {
      id: `deck-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      name: trimmed,
      description: description?.trim() || undefined,
      favoriteIds: [],
      createdAt: now,
      updatedAt: now,
    };
    data.decks.push(deck);
    return save(data) ? deck : null;
  }

  static updateDeck(id: string, updates: Partial<Pick<Deck, 'name' | 'description'>>): boolean {
    const data = this.getDecks();
    const deck = data.decks.find((d) => d.id === id);
    if (!deck) return false;
    if (updates.name !== undefined) {
      const t = updates.name.trim();
      if (!t) return false;
      deck.name = t;
    }
    if (updates.description !== undefined) {
      deck.description = updates.description.trim() || undefined;
    }
    deck.updatedAt = new Date().toISOString();
    return save(data);
  }

  /** デッキ削除。お気に入り本体は削除しない（要件 8.6） */
  static deleteDeck(id: string): boolean {
    const data = this.getDecks();
    const before = data.decks.length;
    data.decks = data.decks.filter((d) => d.id !== id);
    if (data.decks.length === before) return false;
    return save(data);
  }

  static addItemToDeck(deckId: string, favoriteId: string): boolean {
    const data = this.getDecks();
    const deck = data.decks.find((d) => d.id === deckId);
    if (!deck) return false;
    if (deck.favoriteIds.includes(favoriteId)) return true;
    deck.favoriteIds.push(favoriteId);
    deck.updatedAt = new Date().toISOString();
    return save(data);
  }

  static removeItemFromDeck(deckId: string, favoriteId: string): boolean {
    const data = this.getDecks();
    const deck = data.decks.find((d) => d.id === deckId);
    if (!deck) return false;
    const before = deck.favoriteIds.length;
    deck.favoriteIds = deck.favoriteIds.filter((id) => id !== favoriteId);
    if (deck.favoriteIds.length === before) return false;
    deck.updatedAt = new Date().toISOString();
    return save(data);
  }
}
