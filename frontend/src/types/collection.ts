/** 図鑑エントリー */
export interface CollectionEntry {
  suggestionId: string;
  title: string;
  description: string;
  category: '認知的' | '行動的';
  duration: number;
  tried: boolean;
  firstTriedAt?: string;
}

/** 図鑑統計 */
export interface CollectionStats {
  totalCount: number;
  triedCount: number;
}
