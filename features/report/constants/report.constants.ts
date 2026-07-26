import type { AssessmentRound } from '@/features/dashboard/types/dashboard.types';
import type { ReportFileFormat } from '../types/report.types';

export const REPORT_ROUNDS: readonly AssessmentRound[] = ['T0', 'T1', 'T2', 'T3'];

export const OVERVIEW_TAB = 'overview';

export const REPORT_TEXT = {
  pageTitle: 'รายงานผลการประเมิน',
  pageDescription: 'รายงานผลการประเมินแต่ละรอบ และภาพรวมทุกรอบ ดาวน์โหลดเป็น Excel หรือ PDF ได้',
  storeLabel: 'เลือกร้าน',
  storePlaceholder: 'เลือกร้านที่ต้องการดูรายงาน',
  overviewTab: 'ภาพรวมทุกรอบ',
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
  dimensionSection: 'คะแนนรายมิติ',
  dimensionColumn: 'มิติ',
  weightColumn: 'น้ำหนัก (%)',
  scoreColumn: 'คะแนน (%)',
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
