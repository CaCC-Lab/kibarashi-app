import { BadgeEvaluationResult } from '../../types/badge';
import { BadgeEngine } from '../../services/gamification/badgeEngine';
import BadgeCard from './BadgeCard';

export interface BadgeListProps {
  evaluation: BadgeEvaluationResult;
  selectedId?: string | null;
  onSelectBadge?: (id: string) => void;
}

export default function BadgeList({
  evaluation,
  selectedId = null,
  onSelectBadge,
}: BadgeListProps) {
  const defs = BadgeEngine.getBadgeDefinitions();

  return (
    <div
      className="grid grid-cols-2 gap-3"
      data-testid="badge-list"
      role="list"
    >
      {defs.map((def) => {
        const row = evaluation.unlocked.find((u) => u.badgeId === def.id);
        const unlocked = Boolean(row);
        return (
          <div key={def.id} role="listitem">
            <BadgeCard
              definition={def}
              unlocked={unlocked}
              unlockedAt={row?.unlockedAt}
              selected={selectedId === def.id}
              onSelect={() => onSelectBadge?.(def.id)}
            />
          </div>
        );
      })}
    </div>
  );
}
