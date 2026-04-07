import { DailyMission, StoredMission } from '../../types/dailyMission';
import { todayStr } from '../../utils/dateUtils';

const STORAGE_KEY = 'kibarashi_daily_mission';

function safeParse(raw: string | null): StoredMission | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as StoredMission;
    if (
      !parsed?.mission?.date ||
      typeof parsed.mission.type !== 'string' ||
      typeof parsed.mission.description !== 'string' ||
      typeof parsed.mission.completed !== 'boolean'
    ) {
      return null;
    }
    return parsed;
  } catch {
    console.error('Failed to parse daily mission storage');
    return null;
  }
}

export class DailyMissionStorage {
  static getTodayMission(): StoredMission | null {
    const stored = safeParse(localStorage.getItem(STORAGE_KEY));
    if (!stored) return null;
    if (stored.mission.date !== todayStr()) {
      return null;
    }
    return stored;
  }

  static saveMission(mission: DailyMission): boolean {
    try {
      const payload: StoredMission = {
        mission,
        lastUpdated: new Date().toISOString(),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
      return true;
    } catch (e) {
      console.error('Failed to save mission:', e);
      return false;
    }
  }

  static updateMissionStatus(status: 'completed' | 'expired'): boolean {
    const stored = safeParse(localStorage.getItem(STORAGE_KEY));
    if (!stored) return false;
    if (status === 'completed') {
      stored.mission.completed = true;
      stored.mission.completedAt = new Date().toISOString();
      stored.lastUpdated = new Date().toISOString();
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
        return true;
      } catch (e) {
        console.error('Failed to update mission status:', e);
        return false;
      }
    }
    try {
      localStorage.removeItem(STORAGE_KEY);
      return true;
    } catch (e) {
      console.error('Failed to expire mission:', e);
      return false;
    }
  }
}
