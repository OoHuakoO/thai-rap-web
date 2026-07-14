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

// --- ProgressBar ---

export type ProgressColor = 'default' | 'success' | 'warning' | 'danger';

// --- DataTable ---

export interface TableColumn<T> {
  key: keyof T | string;
  header: string;
  cell?: (row: T) => React.ReactNode;
  className?: string;
}
