// UI-specific types for shared components.
// Domain types (User, Product, etc.) live in types/ or features/<name>/types/.

// --- StatCard ---

export interface StatCardData {
  title: string;
  value: string | number;
  description?: string;
  icon?: React.ReactNode;
  trend?: {
    value: number; // positive = up, negative = down
    label: string;
  };
}

// --- ScoreBadge ---

export type ScoreLevel = 'excellent' | 'good' | 'average' | 'poor';

export interface ScoreBadgeData {
  score: number; // 0–100
  level: ScoreLevel;
  label?: string;
}

// --- RadarChart ---

export interface RadarChartDataPoint {
  subject: string;
  value: number;
  fullMark?: number;
}

export interface RadarChartSeries {
  key: string;
  label: string;
  color?: string;
  data: RadarChartDataPoint[];
}

// --- ProgressBar ---

export type ProgressColor = 'default' | 'success' | 'warning' | 'danger';

// --- DataTable ---

export interface TableColumn<T> {
  key: keyof T | string;
  header: string;
  cell?: (row: T) => React.ReactNode;
  className?: string;
}
