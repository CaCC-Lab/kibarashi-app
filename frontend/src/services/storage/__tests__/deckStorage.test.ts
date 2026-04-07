/**
 * ## テスト観点表（DeckStorage）
 *
 * | Case ID | Input / Precondition | Perspective | Expected Result | Notes |
 * |---------|----------------------|-------------|-------------------|-------|
 * | TC-N-01 | addDeck 正常 | Equivalence | Deck が返る | - |
 * | TC-B-01 | 名前が空/空白 | Boundary | null | - |
 * | TC-N-02 | 複数デッキ同一 favoriteId | Equivalence | 両方に所属可 | 要件8.7 |
 * | TC-N-03 | deleteDeck | Equivalence | デッキのみ削除 | 要件8.6 |
 * | TC-A-01 | 存在しない deckId に addItem | Abnormal | false | - |
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { DeckStorage } from '../deckStorage';

describe('DeckStorage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('addDeck で名前と任意説明を保存できる', () => {
    // Given: 空
    // When: addDeck
    // Then: Deck が返り getDecks に含まれる
    const deck = DeckStorage.addDeck('職場用', 'すぐできるもの');
    expect(deck).not.toBeNull();
    expect(deck!.name).toBe('職場用');
    expect(deck!.description).toBe('すぐできるもの');
    const data = DeckStorage.getDecks();
    expect(data.decks).toHaveLength(1);
  });

  it('名前が空または空白のみの場合は null', () => {
    // Given: 空
    // When: addDeck("") / 空白
    // Then: null
    expect(DeckStorage.addDeck('')).toBeNull();
    expect(DeckStorage.addDeck('   ')).toBeNull();
  });

  it('updateDeck で名前と説明を更新できる', () => {
    // Given: デッキあり
    const d = DeckStorage.addDeck('旧', '旧説明')!;
    // When: updateDeck
    // Then: 更新される
    expect(DeckStorage.updateDeck(d.id, { name: '新', description: '新説明' })).toBe(true);
    const found = DeckStorage.getDecks().decks.find((x) => x.id === d.id);
    expect(found?.name).toBe('新');
    expect(found?.description).toBe('新説明');
  });

  it('updateDeck で名前を空にできない', () => {
    const d = DeckStorage.addDeck('a')!;
    expect(DeckStorage.updateDeck(d.id, { name: '  ' })).toBe(false);
  });

  it('addItemToDeck / removeItemFromDeck で気晴らしを管理できる', () => {
    const d = DeckStorage.addDeck('d')!;
    expect(DeckStorage.addItemToDeck(d.id, 'fav-1')).toBe(true);
    expect(DeckStorage.getDecks().decks[0].favoriteIds).toEqual(['fav-1']);
    expect(DeckStorage.removeItemFromDeck(d.id, 'fav-1')).toBe(true);
    expect(DeckStorage.getDecks().decks[0].favoriteIds).toEqual([]);
  });

  it('同一 favoriteId を複数デッキに追加できる', () => {
    // Given: デッキ2つ
    const a = DeckStorage.addDeck('A')!;
    const b = DeckStorage.addDeck('B')!;
    // When: 同じ fav を両方に
    // Then: 両方に含まれる
    expect(DeckStorage.addItemToDeck(a.id, 'fav-x')).toBe(true);
    expect(DeckStorage.addItemToDeck(b.id, 'fav-x')).toBe(true);
    expect(DeckStorage.getDecks().decks.find((d) => d.id === a.id)!.favoriteIds).toContain('fav-x');
    expect(DeckStorage.getDecks().decks.find((d) => d.id === b.id)!.favoriteIds).toContain('fav-x');
  });

  it('deleteDeck はデッキのみ削除し favorite 本体はストレージに残す概念で他へ影響しない', () => {
    // Given: デッキに fav を1件
    const d = DeckStorage.addDeck('tmp')!;
    DeckStorage.addItemToDeck(d.id, 'fav-1');
    // When: deleteDeck
    // Then: デッキが消える（お気に入りストレージは別モジュールのためここでは未操作）
    expect(DeckStorage.deleteDeck(d.id)).toBe(true);
    expect(DeckStorage.getDecks().decks).toHaveLength(0);
  });

  it('存在しないデッキへの addItemToDeck は false', () => {
    expect(DeckStorage.addItemToDeck('no-such', 'f')).toBe(false);
  });

  it('不正 JSON は空の decks にフォールバック', () => {
    localStorage.setItem('kibarashi_decks', 'x');
    expect(DeckStorage.getDecks().decks).toEqual([]);
  });
});
