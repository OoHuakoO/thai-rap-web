import { FileText, Table, File, Download, ExternalLink } from 'lucide-react'
import { cn } from '@/utils/cn'

export type FileType = 'pdf' | 'excel' | 'word' | 'csv' | 'other'

export interface FileItem {
  name: string
  type: FileType
  size?: string
  url?: string
  uploadedAt?: string
}

interface FileListProps {
  files: FileItem[]
  onDownload?: (file: FileItem) => void
  className?: string
}

const fileConfig: Record<FileType, { icon: React.ElementType; iconClass: string; bgClass: string }> = {
  pdf:   { icon: FileText, iconClass: 'text-score-red',   bgClass: 'bg-score-red/10' },
  excel: { icon: Table,    iconClass: 'text-score-green', bgClass: 'bg-score-green/10' },
  word:  { icon: FileText, iconClass: 'text-blue-500',    bgClass: 'bg-blue-50' },
  csv:   { icon: Table,    iconClass: 'text-orange',      bgClass: 'bg-cream' },
  other: { icon: File,     iconClass: 'text-charcoal',    bgClass: 'bg-muted' },
}

export function FileList({ files, onDownload, className }: FileListProps) {
  return (
    <ul className={cn('space-y-2', className)}>
      {files.map((file, i) => {
        const { icon: Icon, iconClass, bgClass } = fileConfig[file.type]

        return (
          <li
            key={i}
            className="flex items-center gap-3 rounded-lg border bg-white px-3 py-2"
          >
            <div className={cn('flex h-8 w-8 shrink-0 items-center justify-center rounded-md', bgClass)}>
              <Icon className={cn('h-4 w-4', iconClass)} />
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-charcoal">{file.name}</p>
              {(file.size || file.uploadedAt) && (
                <p className="text-xs text-muted-foreground">
                  {[file.size, file.uploadedAt].filter(Boolean).join(' · ')}
                </p>
              )}
            </div>

            {file.url && (
              <a
                href={file.url}
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0 text-muted-foreground hover:text-orange"
                aria-label={`เปิด ${file.name}`}
              >
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            )}

            {onDownload && (
              <button
                type="button"
                onClick={() => onDownload(file)}
                className="shrink-0 text-muted-foreground hover:text-orange"
                aria-label={`ดาวน์โหลด ${file.name}`}
              >
                <Download className="h-3.5 w-3.5" />
              </button>
            )}
          </li>
        )
      })}
    </ul>
  )
}
