// Display text and labels for the assessment feature.
// Keep all user-facing strings here — components must not hardcode them.

// Shared 0–4 score labels (used by score buttons and the dimension score legend).
export const SCORE_LABELS = ['ไม่มี', 'มีบ้าง', 'พื้นฐาน', 'ดี', 'ดีมาก'] as const;

export const EMPTY_STORE_MESSAGE = 'ยังไม่มีร้านให้ประเมิน';

export const ASSESSMENT_FORM_TEXT = {
  roundLabel: 'รอบประเมิน',
  progressLabel: 'ความคืบหน้าการประเมิน',
  saveDraft: '💾 บันทึกร่าง',
  saveNext: 'บันทึกและถัดไป →',
  draftSaved: 'บันทึกร่างเรียบร้อย',
  fileDeleted: 'ลบไฟล์แล้ว',
  submitSuccess: 'ส่งผลการประเมินสำเร็จ',
  submitAllDone: 'บันทึกแล้ว — ครบทุกมิติ พร้อม Submit',
  fileAttached: (fileName: string) => `แนบไฟล์ ${fileName} แล้ว`,
  savedNextDim: (dim: number) => `บันทึกแล้ว — ไปมิติที่ ${dim}`,
  submitConfirm: (round: string) =>
    `ยืนยัน Submit รอบ ${round}?\n\nหลัง Submit แล้วจะไม่สามารถแก้ไขคะแนนได้`,
} as const;

export const SCORE_SUMMARY_TEXT = {
  title: 'สรุปผลการประเมินร้าน',
  fullReport: 'ดูรายงานฉบับเต็ม →',
  selectedDimScore: 'คะแนนมิติที่เลือก',
  weightedScore: 'คะแนนรวมถ่วงน้ำหนัก',
  provinceRank: 'อันดับในจังหวัด',
  overallRank: 'อันดับในทั้งหมด',
  noScore: 'ยังไม่มีคะแนน',
  submitted: '✓ ส่งผลแล้ว',
  noScoreDescription: 'ยังไม่ได้ให้คะแนน',
  redFlagsTitle: 'Red Flags (ต้องแก้เร่งด่วน)',
  improvementTitle: 'จุดที่ควรเร่งพัฒนา',
  compareTitle: 'เปรียบเทียบ 8 มิติ',
  radarThisStore: 'ร้านนี้',
  radarAverage: 'ค่าเฉลี่ย',
  dimensionAxisLabel: (id: number) => `มิติ ${id}`,
} as const;

export const ASSESS_TABLE_TEXT = {
  columnNo: 'ข้อ',
  columnCriteria: 'ตัวดำเนินการ / เกณฑ์ประเมิน',
  columnScore: 'คะแนน (0–4)',
  columnEvidence: 'หลักฐาน/ไฟล์',
  columnNote: 'บันทึกผู้ประเมิน',
  columnSuggestion: 'ข้อเสนอแนะ',
  columnStatus: 'สถานะ',
  weightBadge: (weight: number) => `น้ำหนัก ${weight}%`,
  rawScoreLabel: 'คะแนนมิตินี้ (raw)',
  totalRawLabel: 'คะแนนรวมมิตินี้ (raw score)',
  saveDraft: '💾 บันทึกร่าง',
  saveNext: 'บันทึกและถัดไป →',
  dimensionTitle: (id: number, name: string) => `มิติที่ ${id}: ${name}`,
  questionRange: (first: number, last: number) => ` (ข้อที่ ${first}–${last})`,
  dimensionMeta: (count: number, range: string, weight: number, max: number) =>
    `ประเมิน ${count} ข้อ${range} | น้ำหนัก ${weight}% | คะแนน 0–4 ต่อข้อ | คะแนนเต็ม ${max}`,
  scoreOutOf: (max: number, pct: number) => `/ ${max} คะแนน (${pct}%)`,
} as const;

export const QUESTION_ROW_TEXT = {
  statusNotAssessed: '⏸ ยังไม่ประเมิน',
  statusNeedsFix: '⚠ ต้องแก้ไข',
  statusInProgress: '🔄 กำลังประเมิน',
  statusDone: '✅ เสร็จสิ้น',
  uploading: 'กำลังอัปโหลด...',
  attachFile: 'แนบไฟล์',
  notePlaceholderLocked: 'ให้คะแนนก่อนเพื่อบันทึกหมายเหตุ',
  notePlaceholder: 'บันทึกผู้ประเมิน',
  deleteFileAria: (fileName: string) => `ลบไฟล์ ${fileName}`,
} as const;

export const TIMELINE_TEXT = {
  title: 'บันทึกและประวัติการประเมิน',
  subtitle: 'บันทึกเพิ่มเติมเกี่ยวกับผู้ประเมิน',
  notesTitle: 'บันทึกเพิ่มเติม',
  done: 'เสร็จสิ้น',
  emptyNotes: 'ยังไม่มีบันทึกเพิ่มเติม',
  statusCurrent: 'กำลังประเมิน',
  statusDone: 'เสร็จสิ้น',
  statusDraft: 'บันทึกร่าง',
  currentRound: (round: string) => `รอบปัจจุบัน ${round}`,
} as const;

export const ROUND_PILLS_TEXT = {
  lockTitle: 'ต้องทำรอบ T1 ก่อน',
  lockLine1: 'ไม่สามารถเข้าถึงรอบนี้ได้',
  lockLine2Prefix: 'กรุณาทำการประเมินรอบ',
  lockLine2Suffix: 'ให้เสร็จก่อน',
  lockLine3: 'จึงจะสามารถเข้าถึง T2, T3, T4 ได้',
  lockConfirm: 'เข้าใจแล้ว',
} as const;

export const DIMENSION_LIST_TEXT = {
  title: '8 มิติการประเมิน',
  titleEn: 'Assessment Dimensions',
  scoreCriteria: 'เกณฑ์คะแนน 0–4',
  weightedScore: 'คะแนนรวมถ่วงน้ำหนัก',
  viewAll: 'ดูรูปภาพผลทั้งหมด →',
  weightLabel: (weight: number) => `น้ำหนัก ${weight}%`,
} as const;

export const SUBMIT_BAR_TEXT = {
  submittedLocked: '✓ ส่งผลแล้ว — ล็อคการแก้ไข',
  allDone: '✓ ครบทุกข้อแล้ว',
  submitting: 'กำลังส่ง...',
  submitSkip: 'Submit → ข้ามไปข้อที่ขาด',
  submit: 'Submit',
  remainingPrefix: 'ยังขาด',
  remainingSuffix: 'ข้อ',
} as const;

export const STORE_PICKER_TEXT = {
  selectStore: 'เลือกร้านอาหาร',
  province: 'จังหวัด',
  searchPlaceholder: 'ค้นหาร้าน...',
  allProvinces: 'ทั้งหมด',
  noStoreFound: 'ไม่พบร้าน',
} as const;

export const ROUND_PICKER_TEXT = {
  title: 'ประเมินร้าน',
  subtitle: 'เลือกรอบประเมินที่ต้องการให้คะแนน',
} as const;

export const STORE_LIST_TEXT = {
  columnStore: 'ร้าน',
  columnProvince: 'จังหวัด',
  columnStatus: 'สถานะ',
} as const;
