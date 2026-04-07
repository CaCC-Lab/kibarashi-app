export interface CollectionEntry {
  suggestionId: string;
  title: string;
  description: string;
  category: '認知的' | '行動的';
  duration: number;
  tried: boolean;
  firstTriedAt?: string;
}

export interface CollectionStats {
  totalCount: number;
  triedCount: number;
}
