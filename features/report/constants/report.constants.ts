import type { AssessmentRound } from '@/features/dashboard';
import { ROLES, type Role } from '@/types/auth.types';
import type { ReportFileFormat } from '../types/report.types';

export const REPORT_ROUNDS: readonly AssessmentRound[] = ['T0', 'T1', 'T2', 'T3'];

// The cross-store matrix and the per-question breakdown are admin-only, matching
// the API: ReportService.getRoundMatrixReport 403s everyone else. Every other
// role keeps the report exactly as it was — its own store, scores per dimension.
export const REPORT_DETAIL_ROLES: Role[] = [ROLES.SUPER_ADMIN, ROLES.ADMIN];

export const OVERVIEW_TAB = 'overview';

// The matrix is one row per store across the whole programme, so it pages like
// the store directory does. The download stays the whole round either way.
export const DEFAULT_MATRIX_PAGE_LIMIT = 25;

export const STORE_SCOPE_TAB = 'store';
export const MATRIX_SCOPE_TAB = 'matrix';
export const PITCHING_SCOPE_TAB = 'pitching';

// Who sees the assessment scopes at all. Mirrors ASSESSMENT_READ_ROLES on the
// API, which 403s everyone else from /reports/* — JUDGE holds reports:read only
// for the พิชชิ่ง scope below, and would get nothing but errors here.
export const REPORT_ASSESSMENT_ROLES: Role[] = [
  ROLES.SUPER_ADMIN,
  ROLES.ADMIN,
  ROLES.ASSESSOR,
  ROLES.MENTOR,
  ROLES.ENTREPRENEUR,
];

// Who sees the พิชชิ่ง scope. Mirrors PITCHING_READ_ROLES on the API.
export const REPORT_PITCHING_ROLES: Role[] = [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.JUDGE];

export const REPORT_TEXT = {
  pageTitle: 'รายงานผลการประเมิน',
  pageDescription: 'รายงานผลการประเมินแต่ละรอบ และภาพรวมทุกรอบ ดาวน์โหลดเป็น Excel หรือ PDF ได้',
  storeLabel: 'เลือกร้าน',
  storePlaceholder: 'เลือกร้านที่ต้องการดูรายงาน',
  overviewTab: 'ภาพรวมทุกรอบ',
  storeScopeTab: 'รายงานรายร้าน',
  matrixScopeTab: 'รายงานทุกร้าน (รายมิติ)',
  pitchingScopeTab: 'รายงานพิชชิ่ง',
  roundLabel: 'เลือกรอบการประเมิน',
  downloadExcel: 'ดาวน์โหลด Excel',
  downloadPdf: 'ดาวน์โหลด PDF',
  downloading: 'กำลังสร้างไฟล์...',
  downloadSuccess: 'ดาวน์โหลดไฟล์สำเร็จ',
  noStore: 'ยังไม่มีร้านที่เข้าถึงได้',
  noScope: 'บทบาทของคุณยังไม่มีรายงานที่เข้าถึงได้',
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
  matrixPaginationItemLabel: 'ร้าน',
  // The table pages, the file does not — said next to the buttons so nobody
  // downloads four times expecting four different pages.
  matrixDownloadHint: (count: number) => `ไฟล์ที่ดาวน์โหลดมีครบทุกร้านในรอบนี้ (${count} ร้าน)`,
  storeCodeColumn: 'รหัสร้าน',
  storeNameColumn: 'ชื่อร้าน',
  provinceColumn: 'จังหวัด',
  redFlagColumn: 'Red Flag',
  criticalDimensionColumn: 'มิติเร่งแก้ไข',
  overallLevelColumn: 'ระดับรวม',
  // Eight dimension names in full would push the matrix several screens wide,
  // so the header carries the number and the full name lives in the tooltip.
  dimensionShortLabel: (dimensionId: number, weight: number) => `มิติ ${dimensionId} (${weight}%)`,
  dimensionNumberLabel: (dimensionId: number) => `มิติ ${dimensionId}`,
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

// Matches getOverallLevel() in the API (assessment-scoring.util.ts) — the four
// ระดับรวม labels of 03_สรุปคะแนน, which are a different scale from Zone below.
export const OVERALL_LEVEL_BADGE_CLASS: Record<string, string> = {
  เร่งแก้ไข: 'border-score-red/20 bg-score-red/10 text-score-red',
  ต้องพัฒนา: 'border-orange/20 bg-orange/10 text-orange',
  ดี: 'border-score-green/20 bg-score-green/10 text-score-green',
  ดีมาก: 'border-score-green/20 bg-score-green/10 text-score-green',
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
