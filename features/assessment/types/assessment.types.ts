export type Round = 'T0' | 'T1' | 'T2' | 'T3' | 'T4'

export const ROUND_LABELS: Record<Round, string> = {
  T0: 'T0 — ก่อนเข้าค่าย',
  T1: 'T1 — หลังค่าย',
  T2: 'T2 — Field Audit',
  T3: 'T3 — ติดตาม 1 เดือน',
  T4: 'T4 — ติดตาม 3 เดือน',
}

export type AssessmentStatus = 'DRAFT' | 'IN_PROGRESS' | 'SUBMITTED' | 'APPROVED'

export type RedFlagType =
  | 'FOOD_SAFETY'
  | 'FINANCIAL'
  | 'OPERATION'
  | 'MARKET'
  | 'LEGAL'
  | 'OWNER_READINESS'
  | 'EVIDENCE'
  | 'GROWTH'

export const RED_FLAG_LABELS: Record<RedFlagType, string> = {
  FOOD_SAFETY: 'ความปลอดภัยอาหาร',
  FINANCIAL: 'การเงิน',
  OPERATION: 'ระบบปฏิบัติการ',
  MARKET: 'การตลาด',
  LEGAL: 'ใบอนุญาต/กฎหมาย',
  OWNER_READINESS: 'ความพร้อมเจ้าของร้าน',
  EVIDENCE: 'หลักฐานประกอบ',
  GROWTH: 'เป้าหมายการเติบโต',
}

export type Severity = 'WARNING' | 'CRITICAL'

export interface Dimension {
  id: number
  name: string
  nameEn: string
  weight: number
  questionCount: number
}

export interface Question {
  id: number
  dimensionId: number
  questionNo: number
  questionText: string
  maxScore: number
}

export interface RedFlag {
  id: string
  assessmentId: string
  type: RedFlagType
  severity: Severity
  triggerQuestions: number[]
  recommendation: string | null
  resolved: boolean
}

export interface AssessmentQuestion {
  questionId: number
  questionNo: number
  dimensionId: number
  questionText: string
  maxScore: number
  rawScore: number | null
  note: string | null
  suggestion: string | null
}

export interface Assessment {
  id: string
  storeId: string
  round: Round
  assessorId: string
  status: AssessmentStatus
  totalScore: number | null
  zone: string | null
  createdAt: string
  updatedAt: string
  submittedAt: string | null
  questions: AssessmentQuestion[]
  redFlags: RedFlag[]
}

/** Shape returned by the list endpoint (GET /assessments) — no question breakdown. */
export interface AssessmentSummary {
  id: string
  storeId: string
  round: Round
  assessorId: string
  status: AssessmentStatus
  totalScore: number | null
  createdAt: string
  updatedAt: string
  submittedAt: string | null
}

export interface CreateAssessmentDto {
  storeId: string
  round: Round
}

export interface UpdateScoreDto {
  rawScore: number
  note?: string
  suggestion?: string
}

export interface BulkScoreItem extends UpdateScoreDto {
  questionId: number
}

export interface AssessmentProgress {
  scored: number
  total: number
}

export const TOTAL_QUESTIONS = 50
