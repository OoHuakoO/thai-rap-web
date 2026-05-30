'use client'

import { useState } from 'react'
import { Download, FileText, Table, File } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/utils/cn'

export type ExportFormat = 'pdf' | 'excel' | 'csv'

interface ExportPanelProps {
  onExport: (format: ExportFormat, dateRange?: { from: Date; to: Date }) => void
  isExporting?: boolean
  showDateRange?: boolean
  className?: string
}

const formatConfig: { value: ExportFormat; label: string; icon: React.ElementType }[] = [
  { value: 'pdf',   label: 'PDF',   icon: FileText },
  { value: 'excel', label: 'Excel', icon: Table },
  { value: 'csv',   label: 'CSV',   icon: File },
]

export function ExportPanel({ onExport, isExporting = false, className }: ExportPanelProps) {
  const [selected, setSelected] = useState<ExportFormat>('pdf')

  return (
    <Card className={cn(className)}>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold">ส่งออกข้อมูล</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground">รูปแบบไฟล์</p>
          <div className="flex gap-2">
            {formatConfig.map(({ value, label, icon: Icon }) => (
              <button
                key={value}
                type="button"
                onClick={() => setSelected(value)}
                className={cn(
                  'flex flex-1 flex-col items-center gap-1 rounded-lg border py-2 text-xs font-medium transition-colors',
                  selected === value
                    ? 'border-orange bg-cream text-orange'
                    : 'border-border bg-white text-muted-foreground hover:border-orange/50'
                )}
              >
                <Icon className="h-4 w-4" />
                {label}
              </button>
            ))}
          </div>
        </div>

        <Button
          className="w-full"
          size="sm"
          disabled={isExporting}
          onClick={() => onExport(selected)}
        >
          <Download className="mr-2 h-3.5 w-3.5" />
          {isExporting ? 'กำลังส่งออก...' : `ส่งออก ${selected.toUpperCase()}`}
        </Button>
      </CardContent>
    </Card>
  )
}
