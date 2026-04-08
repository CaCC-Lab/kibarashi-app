import { CollectionEntry, CollectionStats } from '../../types/collection';

export interface CollectionBookProps {
  entries: CollectionEntry[];
  stats: CollectionStats;
}

export default function CollectionBook({ entries, stats }: CollectionBookProps) {
  return (
    <div data-testid="collection-book">
      <p data-testid="collection-progress">
        {stats.triedCount} / {stats.totalCount} 体験済み
      </p>
      <ul data-testid="collection-entries">
        {entries.map((e) => (
          <li key={e.suggestionId} data-testid={`entry-${e.suggestionId}`} data-tried={e.tried ? 'true' : 'false'}>
            <span data-testid={`entry-title-${e.suggestionId}`}>{e.title}</span>
            {e.tried ? (
              <span data-testid={`entry-state-${e.suggestionId}`}>試行済み</span>
            ) : (
              <>
                <span data-testid={`entry-state-${e.suggestionId}`}>未試行</span>
                <p data-testid={`entry-teaser-${e.suggestionId}`}>{e.description}</p>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
