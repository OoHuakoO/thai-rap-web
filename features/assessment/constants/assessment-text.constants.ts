// Display text and labels for the assessment feature.
// Keep all user-facing strings here — components must not hardcode them.

// Shared 0–4 score labels (used by score buttons and the dimension score legend).
export const SCORE_LABELS = ['ไม่มี', 'มีบ้าง', 'พื้นฐาน', 'ดี', 'ดีมาก'] as const;

export const EMPTY_STORE_MESSAGE = 'ยังไม่มีร้านให้ประเมิน';

export const ASSESSMENT_FORM_TEXT = {
  roundLabel: 'รอบประเมิน',
  progressLabel: 'ความคืบหน้าการประเมิน',
  noStoreSelectedMessage: 'กรุณาเลือกร้านที่ต้องการประเมิน',
  notStartedMessage: (round: string) => `ยังไม่มีผลการประเมินรอบ ${round} ของร้านนี้`,
  saveDraft: '💾 บันทึกร่าง',
  saveNext: 'บันทึกและถัดไป →',
  saveComplete: 'บันทึกและส่งผล ✓',
  draftSaved: (scored: number, total: number) =>
    `บันทึกร่างแล้ว — ประเมินไปแล้ว ${scored}/${total} ข้อ`,
  fileDeleted: 'ลบไฟล์แล้ว',
  submitSuccessTitle: 'สำเร็จ',
  submitSuccess: 'ส่งผลการประเมินสำเร็จ',
  fileAttached: (fileName: string) => `แนบไฟล์ ${fileName} แล้ว`,
  savedNextDim: (dim: number) => `บันทึกแล้ว — ไปมิติที่ ${dim}`,
  submitConfirmTitle: (round: string) => `ยืนยัน Submit รอบ ${round}`,
  submitConfirmDescription: 'หลัง Submit แล้วจะไม่สามารถแก้ไขคะแนนได้',
  submitConfirmLabel: 'Submit',
  correctionMode: '✎ โหมดแก้ไขผลที่ส่งแล้ว',
  correctionHint:
    'รอบนี้ส่งผลไปแล้ว — เฉพาะผู้ดูแลระบบเท่านั้นที่แก้ไขได้ การแก้คะแนนจะบันทึกทันทีและคำนวณคะแนนรวมกับ Red Flag ใหม่',
  deleteEvidenceTitle: 'ลบไฟล์',
  deleteEvidenceDescription: 'ต้องการลบไฟล์หลักฐานนี้ใช่หรือไม่?',
  retry: 'ลองใหม่',
} as const;

export const SCORE_SUMMARY_TEXT = {
  title: 'สรุปผลการประเมินร้าน',
  latestRoundBadge: (round: string) => `ผลรอบ ${round}`,
  currentRoundBadge: (round: string) => `รอบ ${round} (กำลังประเมิน)`,
  roundPickerLabel: 'รอบ',
  provisional: 'ระหว่างประเมิน',
  scoringProgress: (scored: number, total: number) => `ให้คะแนนแล้ว ${scored}/${total} ข้อ`,
  zonePendingDescription: 'โซนจะแสดงเมื่อให้คะแนนครบทุกข้อ',
  improvementPending: 'ยังให้คะแนนไม่ครบสักมิติ',
  dimensionPercent: (pct: number) => `${pct.toFixed(1)}%`,
  selectedDimScore: 'คะแนนมิติที่เลือก',
  weightedScore: 'คะแนนรวมถ่วงน้ำหนัก',
  provinceRank: 'อันดับในจังหวัด',
  overallRank: 'อันดับในทั้งหมด',
  rankUnavailable: 'ไม่สามารถโหลดอันดับได้',
  noScore: 'ยังไม่มีคะแนน',
  submitted: '✓ ส่งผลแล้ว',
  noScoreDescription: 'ยังไม่ได้ให้คะแนน',
  redFlagsTitle: 'Red Flags (ต้องแก้เร่งด่วน)',
  improvementTitle: 'จุดที่ควรเร่งพัฒนา',
  compareTitle: 'เปรียบเทียบ 8 มิติ',
  radarThisStore: 'ร้านนี้',
  radarAverage: 'ค่าเฉลี่ยจังหวัด',
  dimensionAxisLabel: (id: number) => `มิติ ${id}`,
} as const;

export const OVERALL_SUMMARY_TEXT = {
  title: 'สรุปรวมทุกรอบที่ประเมินแล้ว',
  subtitle: 'ค่าเฉลี่ยรวมและคะแนนทุกมิติของทุกรอบที่ส่งผลแล้ว',
  roundsIncluded: (count: number) => `รวม ${count} รอบ`,
  empty: 'ยังไม่มีรอบที่ส่งผล — จะสรุปให้เมื่อส่งผลรอบแรกแล้ว',
  averageTotalScore: 'คะแนนรวมเฉลี่ย (ถ่วงน้ำหนัก)',
  averageDimensionPct: 'ค่าเฉลี่ยทุกมิติรวมกัน',
  roundCountLabel: 'รอบที่นำมาเฉลี่ย',
  roundCountValue: (count: number) => `${count} รอบ`,
  columnDimension: 'มิติ',
  columnWeight: 'น้ำหนัก',
  columnAverage: 'เฉลี่ยรวม',
  totalRowLabel: 'คะแนนรวมถ่วงน้ำหนัก',
  weightPercent: (weight: number) => `${weight}%`,
  percent: (pct: number) => `${pct.toFixed(1)}%`,
  score: (score: number) => score.toFixed(2),
  noRoundValue: '—',
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
  dimensionTitle: (id: number, name: string) => `มิติที่ ${id}: ${name}`,
  questionRange: (first: number, last: number) => ` (ข้อที่ ${first}–${last})`,
  dimensionMeta: (count: number, range: string, weight: number, max: number) =>
    `ประเมิน ${count} ข้อ${range} | น้ำหนัก ${weight}% | คะแนน 0–4 ต่อข้อ | คะแนนเต็ม ${max}`,
  scoreOutOf: (max: number, pct: number) => `/ ${max} คะแนน (${pct}%)`,
} as const;

export const QUESTION_ROW_TEXT = {
  statusNotAssessed: '⏸ ยังไม่ประเมิน',
  statusNeedsFix: '⚠ ต้องแก้ไข',
  statusDone: '✅ เสร็จสิ้น',
  uploading: 'กำลังอัปโหลด...',
  attachFile: 'แนบไฟล์',
  notePlaceholderLocked: 'ให้คะแนนก่อนเพื่อบันทึกหมายเหตุ',
  notePlaceholder: 'บันทึกผู้ประเมิน',
  suggestionPlaceholderLocked: 'ให้คะแนนก่อนเพื่อบันทึกข้อเสนอแนะ',
  suggestionPlaceholder: 'ข้อเสนอแนะเบื้องต้น',
  deleteFileAria: (fileName: string) => `ลบไฟล์ ${fileName}`,
} as const;

export const TIMELINE_TEXT = {
  title: 'บันทึกและประวัติการประเมิน',
  subtitle: 'บันทึกเพิ่มเติมเกี่ยวกับผู้ประเมิน',
  notesTitle: 'บันทึกเพิ่มเติม',
  editNotesAria: 'แก้ไขบันทึกเพิ่มเติม',
  done: 'เสร็จสิ้น',
  emptyNotes: 'ยังไม่มีบันทึกเพิ่มเติม',
  statusCurrent: 'กำลังประเมิน',
  statusDone: 'เสร็จสิ้น',
  statusDraft: 'บันทึกร่าง',
  currentRound: (round: string) => `รอบปัจจุบัน ${round}`,
  assessorByLabel: (name: string) => `โดย ${name}`,
} as const;

export const ROUND_PILLS_TEXT = {
  lockTitle: (requiredRound: string) => `ต้องทำรอบ ${requiredRound} ก่อน`,
  lockLine1: 'ไม่สามารถเข้าถึงรอบนี้ได้',
  lockLine2Prefix: 'กรุณาทำการประเมินรอบ',
  lockLine2Suffix: (round: string) => `ให้เสร็จก่อน จึงจะสามารถเข้าถึง ${round} ได้`,
  lockConfirm: 'เข้าใจแล้ว',
} as const;

export const DIMENSION_LIST_TEXT = {
  title: '8 มิติการประเมิน',
  titleEn: 'Assessment Dimensions',
  scoreCriteria: 'เกณฑ์คะแนน 0–4',
  weightedScore: 'คะแนนรวมถ่วงน้ำหนัก',
} as const;

// Line-art artwork for each of the 8 dimensions, keyed by Dimension.id.
// Rendered through MaskIcon, so it takes its colour from the tile — not
// baked-in white. Order matches dimensionSeed in mocks/fixtures/assessment.fixtures.ts.
export const DIMENSION_ICON_SRC: Record<number, string> = {
  1: '/icons/dimensions/1.png',
  2: '/icons/dimensions/2.png',
  3: '/icons/dimensions/3.png',
  4: '/icons/dimensions/4.png',
  5: '/icons/dimensions/5.png',
  6: '/icons/dimensions/6.png',
  7: '/icons/dimensions/7.png',
  8: '/icons/dimensions/8.png',
};

// Tile background per dimension, shared by DimensionList and the AssessTable
// header so the selected dimension keeps the same colour on both sides.
export const DIMENSION_TILE_CLASS: Record<number, string> = {
  1: 'bg-violet-600',
  2: 'bg-orange',
  3: 'bg-emerald-600',
  4: 'bg-blue-700',
  5: 'bg-amber-500',
  6: 'bg-purple-600',
  7: 'bg-teal-600',
  8: 'bg-green-600',
};

export const STORE_PICKER_TEXT = {
  selectStore: 'เลือกร้านอาหาร',
  province: 'จังหวัด',
  searchPlaceholder: 'ค้นหาร้าน...',
  allProvinces: 'ทั้งหมด',
  noStoreFound: 'ไม่พบร้าน',
} as const;

export const ROUND_PICKER_TEXT = {
  title: 'ประเมินร้าน',
  titleWithStore: (name: string) => `ประเมินร้าน: ${name}`,
  subtitle: 'เลือกรอบประเมินที่ต้องการให้คะแนน',
} as const;
