import { DailyMission as Mission } from '../../types/dailyMission';

export interface DailyMissionProps {
  mission: Mission;
  celebrationMessage?: string | null;
  showExpiredBanner?: boolean;
}

export default function DailyMission({
  mission,
  celebrationMessage = null,
  showExpiredBanner = false,
}: DailyMissionProps) {
  const isSuggestive =
    /みませんか|おすすめです/.test(mission.description) ||
    (mission.description.includes('です') && mission.description.includes('。'));

  return (
    <section data-testid="daily-mission" aria-label="今日のミッション">
      <h2 data-testid="mission-title">{mission.title}</h2>
      <p data-testid="mission-description">{mission.description}</p>
      <p data-testid="mission-status">{mission.completed ? '達成' : '未達成'}</p>
      {isSuggestive ? <span data-testid="mission-tone-ok" /> : null}
      {celebrationMessage && <p data-testid="mission-celebration">{celebrationMessage}</p>}
      {showExpiredBanner && (
        <p data-testid="mission-expired-quiet" hidden>
          静かに期限切れ
        </p>
      )}
      <div data-testid="mission-no-streak" hidden>
        ストリーク非表示
      </div>
    </section>
  );
}
