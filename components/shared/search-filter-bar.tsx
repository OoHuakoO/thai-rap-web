'use client'

import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/utils/cn'

export interface FilterOption {
  value: string
  label: string
}

export interface FilterField {
  key: string
  placeholder: string
  options: FilterOption[]
  value?: string
  onChange?: (value: string) => void
}

interface SearchFilterBarProps {
  searchValue?: string
  searchPlaceholder?: string
  onSearchChange?: (value: string) => void
  filters?: FilterField[]
  actionLabel?: string
  onAction?: () => void
  className?: string
}

export function SearchFilterBar({
  searchValue,
  searchPlaceholder = 'ค้นหา...',
  onSearchChange,
  filters = [],
  actionLabel,
  onAction,
  className,
}: SearchFilterBarProps) {
  return (
    <div className={cn('flex flex-wrap items-center gap-2', className)}>
      <div className="relative min-w-[180px] flex-1">
        <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={searchValue ?? ''}
          onChange={(e) => onSearchChange?.(e.target.value)}
          placeholder={searchPlaceholder}
          className="pl-8 text-sm"
        />
      </div>

      {filters.map((filter) => (
        <Select key={filter.key} value={filter.value} onValueChange={filter.onChange}>
          <SelectTrigger className="h-9 min-w-[130px] text-sm">
            <SelectValue placeholder={filter.placeholder} />
          </SelectTrigger>
          <SelectContent>
            {filter.options.map((opt) => (
              <SelectItem key={opt.value} value={opt.value} className="text-sm">
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ))}

      {actionLabel && onAction && (
        <Button size="sm" onClick={onAction} className="shrink-0">
          {actionLabel}
        </Button>
      )}
    </div>
  )
}
