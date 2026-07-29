import type { AssessmentRound } from '@/features/dashboard/types/dashboard.types';
import { ROLES, type Role } from '@/types/auth.types';
import type { ReportFileFormat } from '../types/report.types';

export const REPORT_ROUNDS: readonly AssessmentRound[] = ['T0', 'T1', 'T2', 'T3'];

// The cross-store matrix and the per-question breakdown are admin-only, matching
// the API: ReportService.getRoundMatrixReport 403s everyone else. Every other
// role keeps the report exactly as it was — its own store, scores per dimension.
export const REPORT_DETAIL_ROLES: Role[] = [ROLES.SUPER_ADMIN, ROLES.ADMIN];

export const OVERVIEW_TAB = 'overview';

export const STORE_SCOPE_TAB = 'store';
export const MATRIX_SCOPE_TAB = 'matrix';

export const REPORT_TEXT = {
  pageTitle: 'รายงานผลการประเมิน',
  pageDescription: 'รายงานผลการประเมินแต่ละรอบ และภาพรวมทุกรอบ ดาวน์โหลดเป็น Excel หรือ PDF ได้',
  storeLabel: 'เลือกร้าน',
  storePlaceholder: 'เลือกร้านที่ต้องการดูรายงาน',
  overviewTab: 'ภาพรวมทุกรอบ',
  storeScopeTab: 'รายงานรายร้าน',
  matrixScopeTab: 'รายงานทุกร้าน (รายมิติ)',
  roundLabel: 'เลือกรอบการประเมิน',
  downloadExcel: 'ดาวน์โหลด Excel',
  downloadPdf: 'ดาวน์โหลด PDF',
  downloading: 'กำลังสร้างไฟล์...',
  downloadSuccess: 'ดาวน์โหลดไฟล์สำเร็จ',
  noStore: 'ยังไม่มีร้านที่เข้าถึงได้',
  selectStoreFirst: 'เลือกร้านเพื่อดูรายงาน',
  noRoundData: 'ยังไม่มีผลการประเมินรอบนี้',
  noRounds: 'ยังไม่มีผลการประเมินที่ส่งแล้ว',
  // Round report
  totalScore: 'คะแนนรวม',
  zone: 'Zone',
  assessor: 'ผู้ประเมิน',
  submittedAt: 'วันที่ส่งผล',
  notes: 'บันทึกเพิ่มเติม',
  dimensionSection: 'คะแนนรายมิติ และการคำนวณตามค่าถ่วงน้ำหนัก',
  dimensionSectionBasic: 'คะแนนรายมิติ',
  dimensionColumn: 'มิติ',
  weightColumn: 'น้ำหนัก (%)',
  scoreColumn: 'คะแนน (%)',
  rawScoreColumn: 'คะแนนดิบ',
  maxScoreColumn: 'คะแนนเต็ม',
  weightedScoreColumn: 'คะแนนถ่วงน้ำหนัก',
  rawScorePctLabel: 'คะแนนรวม %',
  completionLabel: 'ความครบถ้วน',
  grandTotalRow: 'รวมทั้งหมด',
  // Per-question section
  questionSection: 'ผลการให้คะแนนรายข้อ',
  questionSectionHint: 'กดที่มิติเพื่อดูคะแนนรายข้อ และวิธีคิดคะแนนถ่วงน้ำหนักของมิตินั้น',
  questionNoColumn: 'ข้อ',
  questionTextColumn: 'คำถาม',
  questionScoreColumn: 'คะแนน',
  dimensionSubtotal: 'รวมมิติ',
  weightedFormula: (scorePct: number, weight: number, weighted: number) =>
    `${scorePct.toFixed(2)}% × ${weight}% = ${weighted.toFixed(2)}`,
  // All-stores matrix
  matrixSection: (round: string) => `คะแนนรายมิติของทุกร้าน รอบ ${round}`,
  matrixStoreCount: (count: number) => `ร้านที่ส่งผลการประเมินรอบนี้ ${count} ร้าน`,
  matrixEmpty: 'ยังไม่มีร้านที่ส่งผลการประเมินรอบนี้',
  storeCodeColumn: 'รหัสร้าน',
  storeNameColumn: 'ชื่อร้าน',
  provinceColumn: 'จังหวัด',
  redFlagColumn: 'Red Flag',
  criticalDimensionColumn: 'มิติเร่งแก้ไข',
  averageRow: 'ค่าเฉลี่ย',
  redFlagSection: 'สัญญาณเตือน (Red Flag)',
  redFlagTypeColumn: 'ประเภท',
  redFlagSeverityColumn: 'ระดับ',
  redFlagStatusColumn: 'สถานะ',
  redFlagResolved: 'แก้ไขแล้ว',
  redFlagUnresolved: 'ยังไม่แก้ไข',
  noRedFlag: 'ไม่พบสัญญาณเตือน',
  // Overview report
  roundColumn: 'รอบ',
  deltaColumn: 'เปลี่ยนแปลง',
  unresolvedFlags: (count: number) => `สัญญาณเตือนที่ยังไม่แก้ไข ${count} รายการ`,
  trendSection: 'คะแนนรายมิติแต่ละรอบ',
  noData: '-',
} as const;

export const REPORT_FORMAT_LABEL: Record<ReportFileFormat, string> = {
  xlsx: REPORT_TEXT.downloadExcel,
  pdf: REPORT_TEXT.downloadPdf,
};

// Matches getZone() in the API (assessment-scoring.util.ts) — the colours are
// the only thing the web adds on top.
export const ZONE_BADGE_CLASS: Record<string, string> = {
  'Red Zone': 'border-score-red/20 bg-score-red/10 text-score-red',
  'Survival Zone': 'border-orange/20 bg-orange/10 text-orange',
  'Improve Zone': 'border-orange/20 bg-orange/10 text-orange',
  'Growth Zone': 'border-score-green/20 bg-score-green/10 text-score-green',
  'Model Zone': 'border-score-green/20 bg-score-green/10 text-score-green',
};
