import { CollectionEntry, CollectionStats } from '../../types/collection';
import { fallbackSuggestions } from '../../features/suggestion/fallbackSuggestions';
import { HistoryStorage } from '../storage/historyStorage';
import { CustomStorage } from '../storage/customStorage';

export class CollectionService {
  static getCollectionEntries(): CollectionEntry[] {
    const history = HistoryStorage.getHistory().history;
    const completedBySuggestion = new Map<string, string>();
    for (const h of history) {
      if (!h.completed) continue;
      const at = h.completedAt ?? h.startedAt;
      const prev = completedBySuggestion.get(h.suggestionId);
      if (!prev || at < prev) {
        completedBySuggestion.set(h.suggestionId, at);
      }
    }

    const entries: CollectionEntry[] = fallbackSuggestions.map((s) => {
      const first = completedBySuggestion.get(s.id);
      return {
        suggestionId: s.id,
        title: s.title,
        description: s.description,
        category: s.category,
        duration: s.duration,
        tried: first != null,
        firstTriedAt: first,
      };
    });

    for (const c of CustomStorage.getCustomSuggestions().customs) {
      const first = completedBySuggestion.get(c.id);
      entries.push({
        suggestionId: c.id,
        title: c.title,
        description: c.description,
        category: c.category,
        duration: c.duration,
        tried: first != null,
        firstTriedAt: first,
      });
    }

    return entries;
  }

  static getCollectionStats(): CollectionStats {
    const entries = this.getCollectionEntries();
    const triedCount = entries.filter((e) => e.tried).length;
    return {
      totalCount: entries.length,
      triedCount,
    };
  }
}
