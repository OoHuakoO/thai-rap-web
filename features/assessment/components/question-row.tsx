'use client'

import { useEffect, useRef, useState } from 'react'
import { Paperclip, Upload, X } from 'lucide-react'
import { useDebounce } from '@/hooks/use-debounce'
import { Textarea } from '@/components/ui/textarea'
import { StatusBadge, type StatusVariant } from '@/components/shared/status-badge'
import { cn } from '@/utils/cn'
import { buildFileUrl } from '@/utils/build-file-url'
import { ScoreButtonGroup } from './score-button-group'
import type { AssessmentQuestion } from '../types/assessment.types'

function getStatus(score: number | null): { variant: StatusVariant; label: string } {
  if (score === null) return { variant: 'inactive', label: '⏸ ยังไม่ประเมิน' }
  if (score <= 1) return { variant: 'fail', label: '⚠ ต้องแก้ไข' }
  if (score === 2) return { variant: 'warning', label: '🔄 กำลังประเมิน' }
  return { variant: 'pass', label: '✅ เสร็จสิ้น' }
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

interface QuestionRowProps {
  question: AssessmentQuestion
  locked: boolean
  highlighted?: boolean
  isUploading?: boolean
  onScoreChange: (score: number) => void
  onNoteChange: (note: string) => void
  onUploadEvidence: (file: File) => void
  onDeleteEvidence: (evidenceId: string) => void
}

export function QuestionRow({
  question,
  locked,
  highlighted,
  isUploading,
  onScoreChange,
  onNoteChange,
  onUploadEvidence,
  onDeleteEvidence,
}: QuestionRowProps) {
  const [note, setNote] = useState(question.note ?? '')
  const debouncedNote = useDebounce(note, 600)
  const lastSent = useRef(question.note ?? '')
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (debouncedNote !== lastSent.current) {
      lastSent.current = debouncedNote
      onNoteChange(debouncedNote)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedNote])

  const status = getStatus(question.rawScore)
  const canAttach = !locked && question.rawScore !== null
  const evidence = question.evidence ?? []

  const handleFileSelected = (files: FileList | null) => {
    if (!files || files.length === 0) return
    for (const file of Array.from(files)) {
      onUploadEvidence(file)
    }
  }

  return (
    <tr
      id={`q-${question.questionId}`}
      className={cn(
        'border-b border-border/60 align-top transition-colors last:border-0 hover:bg-muted/20',
        highlighted && 'bg-cream outline outline-2 -outline-offset-2 outline-orange'
      )}
    >
      <td className="w-9 px-2 py-2.5 text-xs font-bold text-muted-foreground">
        {String(question.questionNo).padStart(2, '0')}
      </td>
      <td className="max-w-[240px] px-2 py-2.5 text-[13px] leading-relaxed text-charcoal">
        {question.questionText}
      </td>
      <td className="min-w-[120px] px-2 py-2.5">
        <ScoreButtonGroup
          value={question.rawScore}
          disabled={locked}
          onChange={onScoreChange}
        />
      </td>
      <td className="min-w-[120px] px-2 py-2.5">
        <div className="flex flex-col gap-1">
          {evidence.map((file) => (
            <div
              key={file.id}
              className="flex items-center gap-1 rounded border border-orange bg-cream px-1.5 py-0.5 text-[9.5px] text-orange"
            >
              <Paperclip className="h-2.5 w-2.5 flex-shrink-0" />
              <a
                href={buildFileUrl(file.url)}
                target="_blank"
                rel="noreferrer"
                className="truncate hover:underline"
                title={`${file.filename} (${formatFileSize(file.fileSize)})`}
              >
                {file.filename}
              </a>
              <span className="flex-shrink-0 text-[8.5px] text-muted-foreground">
                {formatFileSize(file.fileSize)}
              </span>
              {!locked && (
                <button
                  type="button"
                  onClick={() => onDeleteEvidence(file.id)}
                  className="flex-shrink-0 text-orange/70 hover:text-destructive"
                  aria-label={`ลบไฟล์ ${file.filename}`}
                >
                  <X className="h-2.5 w-2.5" />
                </button>
              )}
            </div>
          ))}
          {canAttach && (
            <button
              type="button"
              disabled={isUploading}
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1 rounded border border-dashed border-border px-1.5 py-0.5 text-[9.5px] text-muted-foreground hover:border-orange hover:text-orange disabled:opacity-50"
            >
              <Upload className="h-2.5 w-2.5" />
              {isUploading ? 'กำลังอัปโหลด...' : 'แนบไฟล์'}
            </button>
          )}
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/jpeg,image/png,image/webp,application/pdf,.xlsx"
            className="hidden"
            onChange={(e) => {
              handleFileSelected(e.target.files)
              e.target.value = ''
            }}
          />
        </div>
      </td>
      <td className="min-w-[160px] px-2 py-2.5">
        <Textarea
          placeholder={question.rawScore === null ? 'ให้คะแนนก่อนเพื่อบันทึกหมายเหตุ' : 'บันทึกผู้ประเมิน'}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          disabled={locked || question.rawScore === null}
          className="min-h-0 py-1.5 text-xs"
          rows={2}
        />
      </td>
      <td className="max-w-[160px] px-2 py-2.5 text-xs italic text-muted-foreground">
        {question.suggestion ?? ''}
      </td>
      <td className="px-2 py-2.5">
        <StatusBadge status={status.variant} label={status.label} className="whitespace-nowrap" />
      </td>
    </tr>
  )
}
