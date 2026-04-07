import { TimePatternResult } from '../../types/journey';

export interface TimePatternChartProps {
  result: TimePatternResult;
}

export default function TimePatternChart({ result }: TimePatternChartProps) {
  return (
    <section data-testid="time-pattern" aria-label="時間帯と所要時間の傾向">
      <p data-testid="time-pattern-message">{result.message}</p>
      {result.hasEnoughData && (
        <>
          <p data-testid="frequent-slot">{result.frequentTimeSlot}</p>
          <p data-testid="duration-range">{result.effectiveDurationRange}</p>
        </>
      )}
    </section>
  );
}
