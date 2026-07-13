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
    <div className={cn('flex h-full w-full flex-col overflow-x-auto rounded-md border', className)}>
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
        {!isLoading && data.length > 0 && (
          <tbody>
            {data.map((row) => (
              <tr
                key={String(row[keyField])}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                className={cn(
                  'border-b transition-colors last:border-0 hover:bg-muted/30',
                  onRowClick && 'cursor-pointer',
                  isRowSelected?.(row) &&
                    'border-b-orange/20 bg-orange/[0.08] hover:bg-orange/[0.08]'
                )}
              >
                {columns.map((col, index) => (
                  <td
                    key={String(col.key)}
                    className={cn(
                      'px-4 py-3',
                      index === 0 && isRowSelected?.(row) && 'border-l-4 border-l-orange',
                      col.className
                    )}
                  >
                    {col.cell
                      ? col.cell(row)
                      : String(row[col.key as keyof T] ?? '-')}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        )}
      </table>
      {isLoading && (
        <div className="flex flex-1 items-center justify-center">
          <Loading className="py-8" />
        </div>
      )}
      {!isLoading && data.length === 0 && (
        <div className="flex flex-1 items-center justify-center px-4 py-8 text-center text-muted-foreground">
          {emptyMessage}
        </div>
      )}
    </div>
  );
}
