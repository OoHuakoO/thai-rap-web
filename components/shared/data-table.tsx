import { cn } from '@/utils/cn';
import { Loading } from '@/components/shared/loading';
import type { TableColumn } from '@/types';

interface DataTableProps<T extends object> {
  columns: TableColumn<T>[];
  data: T[];
  keyField: keyof T;
  isLoading?: boolean;
  emptyMessage?: string;
  className?: string;
  onRowClick?: (row: T) => void;
  isRowSelected?: (row: T) => boolean;
}

export function DataTable<T extends object>({
  columns,
  data,
  keyField,
  isLoading = false,
  emptyMessage = 'No data available.',
  className,
  onRowClick,
  isRowSelected,
}: DataTableProps<T>) {
  return (
    <div className={cn('w-full overflow-x-auto rounded-md border', className)}>
      <table className="w-full text-sm" aria-label="Data table">
        <thead>
          <tr className="border-b bg-muted/50">
            {columns.map((col) => (
              <th
                key={String(col.key)}
                className={cn(
                  'px-4 py-3 text-left font-medium text-muted-foreground',
                  col.className
                )}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            <tr>
              <td colSpan={columns.length}>
                <Loading className="py-8" />
              </td>
            </tr>
          ) : data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="px-4 py-8 text-center text-muted-foreground"
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row) => (
              <tr
                key={String(row[keyField])}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                className={cn(
                  'border-b transition-colors last:border-0 hover:bg-muted/30',
                  onRowClick && 'cursor-pointer',
                  isRowSelected?.(row) &&
                    'border-b-orange/20 border-l-4 border-l-orange bg-orange/[0.08] hover:bg-orange/[0.08]'
                )}
              >
                {columns.map((col) => (
                  <td
                    key={String(col.key)}
                    className={cn('px-4 py-3', col.className)}
                  >
                    {col.cell
                      ? col.cell(row)
                      : String(row[col.key as keyof T] ?? '-')}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
