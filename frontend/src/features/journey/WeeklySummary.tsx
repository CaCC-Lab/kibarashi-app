import { JourneySummary } from '../../types/journey';

export interface WeeklySummaryProps {
  summary: JourneySummary;
}

export default function WeeklySummary({ summary }: WeeklySummaryProps) {
  const zeroWeek = summary.executionCount === 0;

  return (
    <section data-testid="weekly-summary" aria-label="今週のサマリー">
      <h2 className="sr-only">今週の自分</h2>
      <p data-testid="weekly-insight">{summary.insightMessage}</p>
      {!zeroWeek && (
        <>
          <p data-testid="weekly-executions">{summary.executionCount}</p>
          <p data-testid="weekly-completions">{summary.completionCount}</p>
          <p data-testid="weekly-duration">{summary.totalDurationSeconds}</p>
        </>
      )}
    </section>
  );
}
