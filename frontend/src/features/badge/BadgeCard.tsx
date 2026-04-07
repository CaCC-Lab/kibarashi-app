import { BadgeDefinition } from '../../types/badge';

export interface BadgeCardProps {
  definition: BadgeDefinition;
  unlocked: boolean;
  unlockedAt?: string;
  selected?: boolean;
  onSelect?: () => void;
}

export default function BadgeCard({
  definition,
  unlocked,
  unlockedAt,
  selected = false,
  onSelect,
}: BadgeCardProps) {
  return (
    <button
      type="button"
      data-testid={`badge-card-${definition.id}`}
      data-unlocked={unlocked ? 'true' : 'false'}
      aria-pressed={selected}
      className={unlocked ? 'badge-card--unlocked' : 'badge-card--locked'}
      onClick={onSelect}
    >
      <span data-testid="badge-name">{definition.name}</span>
      {!unlocked && <span data-testid="badge-hint">{definition.hint}</span>}
      {unlocked && selected && (
        <>
          <span data-testid="badge-description">{definition.description}</span>
          {unlockedAt ? <span data-testid="badge-unlocked-at">{unlockedAt}</span> : null}
        </>
      )}
    </button>
  );
}
