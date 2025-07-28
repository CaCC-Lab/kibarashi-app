/**
 * Chart.js用の型定義
 */

// Chart.jsのTooltipコンテキスト型
export interface ChartTooltipContext {
  parsed: {
    x: number;
    y: number;
  };
  dataset: {
    label?: string;
    data: number[];
  };
  dataIndex: number;
  formattedValue: string;
  label: string;
  raw: number;
}

// Chart.jsのTooltipコールバック型
export interface ChartTooltipCallbacks {
  label?: (context: ChartTooltipContext) => string | string[];
  afterLabel?: (context: ChartTooltipContext) => string | string[];
  afterBody?: (context: ChartTooltipContext[]) => string | string[];
  beforeLabel?: (context: ChartTooltipContext) => string | string[];
}

// カスタムチャートデータ型
export interface ChartDataPoint {
  x: string | number;
  y: number;
  label?: string;
}