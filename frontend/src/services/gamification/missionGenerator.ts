import { DailyMission, MissionType } from '../../types/dailyMission';
import { DailyMissionStorage } from '../storage/dailyMissionStorage';
import { HistoryStorage } from '../storage/historyStorage';
import { CollectionService } from './collectionService';
import { todayStr } from '../../utils/dateUtils';

function buildMission(date: string): DailyMission {
  const entries = CollectionService.getCollectionEntries();
  const untried = entries.filter((e) => !e.tried);
  const history = HistoryStorage.getHistory().history;
  const hasNote = history.some((h) => h.completed && (h.note ?? '').trim().length > 0);

  let type: MissionType = 'try_new';
  let title = '新しい気晴らしに挑戦してみませんか';
  let description =
    'まだ試したことのない提案を1つ選んでみるのもおすすめです。無理のない範囲で試してみてください。';
  let targetSuggestionId: string | undefined;
  let targetCategory: '認知的' | '行動的' | undefined;

  if (untried.length > 0) {
    const pick = untried[Math.floor(Math.random() * untried.length)];
    type = 'try_suggestion';
    title = `${pick.title}を試してみませんか`;
    description = `${pick.title}に少しだけ触れてみるのもおすすめです。`;
    targetSuggestionId = pick.suggestionId;
  } else if (!hasNote) {
    type = 'write_note';
    title = 'メモを残してみませんか';
    description = '完了後に一言メモを残してみるのもおすすめです。';
  } else {
    const cog = history.filter((h) => h.completed && h.category === '認知的').length;
    const act = history.filter((h) => h.completed && h.category === '行動的').length;
    targetCategory = cog <= act ? '認知的' : '行動的';
    type = 'try_category';
    title = `${targetCategory}な気晴らしも試してみませんか`;
    description = `${targetCategory}なアプローチも、よい気分転換になります。`;
  }

  return {
    id: `mission-${date}-${Math.random().toString(36).slice(2, 8)}`,
    date,
    type,
    title,
    description,
    targetSuggestionId,
    targetCategory,
    completed: false,
  };
}

export class MissionGenerator {
  static getTodayMission(): DailyMission {
    const date = todayStr();
    const existing = DailyMissionStorage.getTodayMission();
    if (existing && existing.mission.date === date) {
      return existing.mission;
    }
    const mission = buildMission(date);
    DailyMissionStorage.saveMission(mission);
    return mission;
  }

  static checkMissionCompletion(mission: DailyMission): boolean {
    const history = HistoryStorage.getHistory().history;
    const completed = history.filter((h) => h.completed);

    switch (mission.type) {
      case 'try_suggestion': {
        if (!mission.targetSuggestionId) return false;
        return completed.some((h) => h.suggestionId === mission.targetSuggestionId);
      }
      case 'try_category': {
        if (!mission.targetCategory) return false;
        return completed.some((h) => h.category === mission.targetCategory);
      }
      case 'write_note':
        return completed.some((h) => (h.note ?? '').trim().length > 0);
      case 'try_new':
        if (mission.targetSuggestionId) {
          return completed.some((h) => h.suggestionId === mission.targetSuggestionId);
        }
        return false;
      default:
        return false;
    }
  }
}
