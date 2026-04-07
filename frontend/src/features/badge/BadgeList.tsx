import { BadgeEvaluationResult } from '../../types/badge';
import { BadgeEngine } from '../../services/gamification/badgeEngine';
import BadgeCard from './BadgeCard';

export interface BadgeListProps {
  evaluation?: BadgeEvaluationResult;
  selectedId?: string | null;
  onSelectBadge?: (id: string) => void;
}

export default function BadgeList({
  evaluation: evaluationProp,
  selectedId = null,
  onSelectBadge,
}: BadgeListProps) {
  const evaluation = evaluationProp ?? BadgeEngine.evaluateBadges();
  const defs = BadgeEngine.getBadgeDefinitions();

  return (
    <div data-testid="badge-list" role="list">
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
