import { CategoryAnalysisResult } from '../../types/journey';

export interface CategoryAnalysisProps {
  result: CategoryAnalysisResult;
}

export default function CategoryAnalysis({ result }: CategoryAnalysisProps) {
  return (
    <section data-testid="category-analysis" aria-label="カテゴリ分析">
      <p data-testid="category-message">{result.message}</p>
      {result.hasEnoughData && (
        <ul data-testid="category-effective-list">
          {result.categories.map((c) => (
            <li key={c.category} data-testid={`category-row-${c.category}`}>
              {c.category}（平均 {c.averageRating.toFixed(1)}）
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
