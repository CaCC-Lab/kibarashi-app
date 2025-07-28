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
  datasetIndex: number;
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

export interface ChartTooltipItem {
  parsed: {
    x: number;
    y: number;
  };
  dataset: {
    label?: string;
  };
  datasetIndex: number;
  dataIndex: number;
}

export interface ChartTooltipModel {
  dataPoints: ChartTooltipItem[];
  opacity: number;
}

export interface AfterBodyContext extends Array<ChartTooltipItem> {
  length: number;
}