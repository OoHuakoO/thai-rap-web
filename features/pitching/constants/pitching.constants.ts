import { API_MAX_PAGE_LIMIT } from '@/constants';
import { colors } from '@/styles/tokens';
import type { ProgressColor } from '@/types';
import type {
  PitchingLevel,
  PitchingRecommendation,
  PitchingRound,
  PitchingStatus,
} from '../types/pitching.types';

export const PITCHING_ROUND_LABELS: Record<PitchingRound, string> = {
  PITCH_DECK: 'รอบคัดเลือกเข้า Incubation',
  ACCELERATION: 'รอบ Incubation สู่ Acceleration',
};

export const PITCHING_ROUND_DESCRIPTIONS: Record<PitchingRound, string> = {
  PITCH_DECK: 'ประเมินจากการนำเสนอ Pitch Deck 10 สไลด์ รวม 100 คะแนน',
  ACCELERATION: 'ประเมินจากผลการพัฒนาระหว่าง Incubation และศักยภาพผลิตภัณฑ์ รวม 100 คะแนน',
};

export const PITCHING_STATUS_LABELS: Record<PitchingStatus, string> = {
  DRAFT: 'ร่าง',
  SUBMITTED: 'ส่งแล้ว',
};

// เกณฑ์พิจารณาผลการคัดเลือก — the wording is the paper form's.
export const PITCHING_LEVEL_LABELS: Record<PitchingLevel, string> = {
  HIGHLY_SUITABLE: 'เหมาะสมมาก',
  SUITABLE: 'เหมาะสม',
  FAIR: 'พอใช้ / สำรอง',
  NOT_READY: 'ยังไม่พร้อม',
};

// ส่วนที่ 2 เกณฑ์พิจารณาผลการคัดเลือก on the pitch deck form, and the ช่วงคะแนน
// table on page 4 of the acceleration form. Same four bands, different guidance
// — the acceleration wording talks about Acceleration, not Incubation.
export interface PitchingLevelBand {
  level: PitchingLevel;
  range: string;
  guidance: string;
}

export const PITCHING_LEVEL_BANDS: Record<PitchingRound, readonly PitchingLevelBand[]> = {
  PITCH_DECK: [
    {
      level: 'HIGHLY_SUITABLE',
      range: '80–100',
      guidance: 'ควรได้รับการพิจารณาเข้า Incubation เป็นลำดับต้น',
    },
    {
      level: 'SUITABLE',
      range: '70–79',
      guidance: 'มีศักยภาพ ควรพิจารณาเข้า Incubation หากมีความพร้อมและข้อมูลสนับสนุนเพียงพอ',
    },
    {
      level: 'FAIR',
      range: '60–69',
      guidance: 'มีศักยภาพบางด้าน แต่ควรพิจารณาเงื่อนไขเพิ่มเติมหรือจัดเป็นรายชื่อสำรอง',
    },
    {
      level: 'NOT_READY',
      range: 'ต่ำกว่า 60',
      guidance: 'ควรได้รับคำแนะนำเบื้องต้นก่อนเข้าสู่กระบวนการพัฒนาระยะถัดไป',
    },
  ],
  ACCELERATION: [
    {
      level: 'HIGHLY_SUITABLE',
      range: '80–100',
      guidance:
        'ผ่านเกณฑ์และควรพิจารณาเป็นลำดับต้น โดยเรียงคะแนนเฉลี่ยเพื่อคัดเลือกไม่น้อยกว่า 10 กิจการ',
    },
    {
      level: 'SUITABLE',
      range: '70–79',
      guidance: 'มีศักยภาพ พิจารณาเป็นรายชื่อสำรองหรือคัดเลือกแบบมีเงื่อนไข',
    },
    {
      level: 'FAIR',
      range: '60–69',
      guidance: 'ควรจัดทำแผนปรับปรุงก่อนเข้าสู่ Acceleration',
    },
    {
      level: 'NOT_READY',
      range: 'ต่ำกว่า 60',
      guidance: 'ควรได้รับคำแนะนำและพัฒนาต่อในระยะถัดไป',
    },
  ],
};

// Mirrors PITCHING_LEVEL_THRESHOLDS on the API — the same cut points the two
// PITCHING_LEVEL_BANDS tables above are printed with. Change both repos together.
export const PITCHING_LEVEL_THRESHOLDS = {
  HIGHLY_SUITABLE: 80,
  SUITABLE: 70,
  FAIR: 60,
} as const;

export const PITCHING_LEVEL_BADGE_CLASSES: Record<PitchingLevel, string> = {
  HIGHLY_SUITABLE: 'border-score-green/20 bg-score-green/10 text-score-green',
  SUITABLE: 'border-orange/20 bg-orange/10 text-orange',
  FAIR: 'border-amber-500/20 bg-amber-500/10 text-amber-600',
  NOT_READY: 'border-score-red/20 bg-score-red/10 text-score-red',
};

// The badge palette as bare text / surface classes, for the places a level
// colours something that is not a badge — a score number, a card's left edge.
export const PITCHING_LEVEL_TEXT_CLASSES: Record<PitchingLevel, string> = {
  HIGHLY_SUITABLE: 'text-score-green',
  SUITABLE: 'text-orange',
  FAIR: 'text-amber-600',
  NOT_READY: 'text-score-red',
};

export const PITCHING_LEVEL_EDGE_CLASSES: Record<PitchingLevel, string> = {
  HIGHLY_SUITABLE: 'border-l-score-green bg-score-green/[0.03]',
  SUITABLE: 'border-l-orange bg-orange/[0.03]',
  FAIR: 'border-l-amber-500 bg-amber-500/[0.03]',
  NOT_READY: 'border-l-score-red bg-score-red/[0.03]',
};

export const PITCHING_LEVEL_PROGRESS_COLORS: Record<PitchingLevel, ProgressColor> = {
  HIGHLY_SUITABLE: 'success',
  SUITABLE: 'default',
  FAIR: 'warning',
  NOT_READY: 'danger',
};

export const PITCHING_RECOMMENDATION_LABELS: Record<PitchingRecommendation, string> = {
  SELECTED: 'เห็นควรคัดเลือก',
  WAITING_LIST: 'เห็นควรจัดเป็นรายชื่อสำรอง',
  MINIMUM_NOT_MET: 'ไม่ผ่านเงื่อนไขขั้นต่ำ',
  NOT_SELECTED: 'ยังไม่เห็นควรคัดเลือกในรอบนี้',
};

export const PITCHING_RECOMMENDATION_BADGE_CLASSES: Record<PitchingRecommendation, string> = {
  SELECTED: 'border-score-green/20 bg-score-green/10 text-score-green',
  WAITING_LIST: 'border-amber-500/20 bg-amber-500/10 text-amber-600',
  MINIMUM_NOT_MET: 'border-score-red/20 bg-score-red/10 text-score-red',
  NOT_SELECTED: 'border-score-red/20 bg-score-red/10 text-score-red',
};

// MINIMUM_NOT_MET is absent from the pitch deck form, and the API 400s it —
// PITCHING_ALLOWED_RECOMMENDATIONS in the API is the authority here.
export const PITCHING_RECOMMENDATION_OPTIONS: Record<
  PitchingRound,
  readonly PitchingRecommendation[]
> = {
  PITCH_DECK: ['SELECTED', 'WAITING_LIST', 'NOT_SELECTED'],
  ACCELERATION: ['SELECTED', 'WAITING_LIST', 'MINIMUM_NOT_MET', 'NOT_SELECTED'],
};

// ความเห็นของคณะกรรมการ — the keys must match PITCHING_COMMENT_KEYS on the API,
// which rejects any it does not know.
export const PITCHING_COMMENT_FIELDS: Record<
  PitchingRound,
  readonly { key: string; label: string }[]
> = {
  PITCH_DECK: [
    { key: 'strengths', label: 'จุดแข็งของร้าน' },
    { key: 'urgentImprovements', label: 'จุดที่ควรปรับปรุงเร่งด่วน' },
    {
      key: 'salesCostFeasibility',
      label: 'ความเป็นไปได้ในการพัฒนายอดขาย / ลดต้นทุน / เพิ่มประสิทธิภาพ',
    },
    { key: 'productMarketPotential', label: 'ศักยภาพในการต่อยอดผลิตภัณฑ์หรือขยายตลาด' },
    { key: 'suggestions', label: 'ข้อเสนอแนะจากคณะกรรมการ' },
  ],
  ACCELERATION: [
    { key: 'strengths', label: 'จุดแข็งสำคัญของร้านและผลิตภัณฑ์' },
    { key: 'risks', label: 'ประเด็นที่ต้องปรับปรุง / ความเสี่ยงสำคัญ' },
    { key: 'conditions', label: 'เงื่อนไขหรือเป้าหมายหากได้รับคัดเลือก' },
    { key: 'fundingSuggestions', label: 'ข้อเสนอแนะด้านวงเงินสนับสนุนและแผนพัฒนา' },
  ],
};

// What each comment box is *about*, so the store report can colour a judge's
// write-up into sections — what went well, what did not, what could grow, what
// to do next — instead of printing one grey column of labels. Keyed by the same
// comment keys as PITCHING_COMMENT_FIELDS; an unknown key falls back to advice.
export type PitchingCommentTone = 'positive' | 'concern' | 'potential' | 'advice';

export const PITCHING_COMMENT_TONES: Record<string, PitchingCommentTone> = {
  strengths: 'positive',
  urgentImprovements: 'concern',
  risks: 'concern',
  salesCostFeasibility: 'potential',
  productMarketPotential: 'potential',
  conditions: 'potential',
  suggestions: 'advice',
  fundingSuggestions: 'advice',
};

// หลักฐานที่ตรวจสอบ — acceleration form only.
export const PITCHING_EVIDENCE_OPTIONS: readonly { key: string; label: string }[] = [
  { key: 'SCORE_CARD', label: 'Score Card 8 มิติ' },
  { key: 'SOP', label: 'SOP / สูตรมาตรฐาน' },
  { key: 'COSTING', label: 'Costing / ราคาขาย' },
  { key: 'ACCOUNTING', label: 'บัญชี / ยอดขาย / สต๊อก' },
  { key: 'PARTICIPATION_REPORT', label: 'รายงานเข้าร่วม / ส่งงาน' },
  { key: 'MARKET_VALIDATION', label: 'Market Validation' },
  { key: 'PRODUCTION_CAPACITY', label: 'กระบวนการ / กำลังผลิต' },
  { key: 'STANDARDS', label: 'มาตรฐาน / อย. / บรรจุภัณฑ์' },
  { key: 'FINANCIAL_PLAN', label: 'แผนการเงิน / Unit Economics' },
];

export const PITCHING_SECTION_LABELS: Record<string, string> = {
  A: 'หมวด A: ผลการพัฒนาร้าน',
  B: 'หมวด B: ศักยภาพผลิตภัณฑ์',
};

// Mirrors PITCHING_SCORE_CARD_MAX / *_MIN_PASS on the API.
export const PITCHING_SCORE_CARD_MAX = 40;
export const PITCHING_SCORE_CARD_MIN_PASS = 30;
export const PITCHING_PARTICIPATION_MIN_PASS = 90;
// The reading is a percentage, so its own ceiling — @Max(100) on the API DTO.
export const PITCHING_PARTICIPATION_MAX = 100;
export const PITCHING_TOTAL_MAX = 100;

// The API rounds คะแนนเฉลี่ย to 2 dp once (`roundTo2`) so the ranking, the report
// and the export all carry the same number. Every surface prints those same two
// decimals — a tile showing 78.5 beside a Top 10 row showing 78.46 reads as two
// different scores for one store.
export const PITCHING_AVG_SCORE_DECIMALS = 2;

export const PITCHING_RANKING_PAGE_LIMIT = 25;

// The dashboard reads the round's whole ranking in one page: the Top 10 card
// and the score-distribution donut are two views of the same list, and paging
// the endpoint twice with different limits would let them disagree. A cohort is
// one row per store (~50 a programme year), so one page covers it — and the API
// ceiling is what makes that page as big as it can be. Raising it past
// API_MAX_PAGE_LIMIT is an API change first, not a number to bump here.
export const PITCHING_COHORT_LIMIT = API_MAX_PAGE_LIMIT;

export const PITCHING_TOP_RANKING_SIZE = 10;

// The dialog pages the cohort the dashboard already holds — no second request,
// so this is a display size only. Ten rows keep the dialog inside its
// max-height on a laptop instead of scrolling the list and the page at once.
export const PITCHING_RANKING_DIALOG_PAGE_LIMIT = 10;

// How many of the ranking's leading stores get their report warmed once the
// cohort lands. The first is the one the dashboard opens on, so only the rest
// are speculative — kept small because each is a full report request, and a
// judge who clicks past the podium pays one load rather than the page paying
// ten up front.
export const PITCHING_REPORT_PREFETCH_SIZE = 3;

export const PITCHING_JUDGE_TABLE_PAGE_LIMIT = 10;

// การกระจายคะแนนรวม — the bands of the design's donut. Ordered high to low and
// matched on `min` alone, so a score lands in the first band it clears and the
// list stays exhaustive without overlapping bounds.
export const PITCHING_SCORE_BANDS = [
  { key: 'band90', label: '90 - 100 คะแนน', min: 90, color: colors.purpleBanner },
  { key: 'band80', label: '80 - 89 คะแนน', min: 80, color: colors.orange },
  { key: 'band70', label: '70 - 79 คะแนน', min: 70, color: colors.scoreRed },
  { key: 'band60', label: '60 - 69 คะแนน', min: 60, color: colors.amber },
  { key: 'bandBelow60', label: 'ต่ำกว่า 60 คะแนน', min: 0, color: colors.neutral },
] as const;

// Radix Select has no empty-string value, so "all provinces" needs a sentinel;
// the caller turns it back into an absent query param.
export const ALL_PROVINCES = 'ALL';

// Same reason: "ทุกกรรมการ" in the judge picker, which shows the cross-judge
// average rather than one judge's form.
export const ALL_JUDGES = 'ALL';

export const PITCHING_TEXT = {
  pageTitle: 'คะแนนพิชชิ่ง',
  pageSubtitle: 'Pitching Scores',
  pageDescription: 'สรุปผลการประเมินของคณะกรรมการ และอันดับคะแนนของทั้งรอบ',
  formPageTitle: 'กรอกแบบประเมินพิชชิ่ง',
  formPageDescription: 'เลือกรอบและร้านที่ต้องการประเมิน แล้วกรอกแบบประเมินของคุณ',
  backToDashboard: 'กลับไปหน้าคะแนนพิชชิ่ง',
  storeLabel: 'เลือกร้าน',
  storePlaceholder: 'เลือกร้านที่ต้องการประเมิน',
  noStore: 'ยังไม่มีร้านที่เข้าถึงได้',
  selectStoreFirst: 'เลือกร้านเพื่อเริ่มกรอกแบบประเมิน',
  startForm: 'เริ่มกรอกแบบประเมิน',
  startFormHint: 'ยังไม่มีแบบประเมินของคุณสำหรับร้านนี้ในรอบนี้',
  criteriaTitle: 'เกณฑ์การประเมิน',
  scoreLabel: 'คะแนนที่ได้',
  maxScoreLabel: (max: number) => `เต็ม ${max}`,
  scoreOutOfRange: (max: number) => `กรอกได้เฉพาะจำนวนเต็ม 0–${max}`,
  valueOutOfRange: (max: number) => `กรอกได้ 0–${max}`,
  criterionNoteLabel: 'หลักฐาน / ข้อสังเกต',
  criterionNotePlaceholder: 'บันทึกหลักฐานหรือข้อสังเกตของข้อนี้',
  runningTotalTitle: 'คะแนนรวมปัจจุบัน',
  runningTotalLevelLabel: 'ระดับผลการประเมินปัจจุบัน',
  runningTotalScored: (scored: number, total: number) => `กรอกแล้ว ${scored} จาก ${total} ข้อ`,
  runningTotalIncomplete: 'ยังกรอกไม่ครบทุกข้อ ระดับผลการประเมินจะเปลี่ยนเมื่อกรอกครบ',
  levelBandsTitle: 'เกณฑ์พิจารณาผลการคัดเลือก',
  levelBandRangeColumn: 'ช่วงคะแนน',
  levelBandLevelColumn: 'ระดับผลการประเมิน',
  levelBandGuidanceColumn: 'ข้อเสนอแนะ',
  levelBandTieBreak:
    'กรณีคะแนนเท่ากัน ให้พิจารณาคะแนนหมวด B จากนั้นพิจารณา Market Feasibility และมติคณะกรรมการตามลำดับ',
  totalOutOf: (score: number) => `${score} / ${PITCHING_TOTAL_MAX}`,
  minimumTitle: 'เงื่อนไขขั้นต่ำ',
  minimumHint:
    'ต้องผ่านทั้ง 2 ข้อ หากไม่ผ่านข้อใดข้อหนึ่งให้สรุปว่า “ไม่ผ่านเงื่อนไขขั้นต่ำ” เว้นแต่มีมติเป็นกรณีพิเศษ',
  scoreCardLabel: `Score Card 8 มิติ (เต็ม ${PITCHING_SCORE_CARD_MAX})`,
  scoreCardHint: `ผ่านเมื่อ ≥ ${PITCHING_SCORE_CARD_MIN_PASS}`,
  participationLabel: 'เข้าร่วมกิจกรรมและส่งงาน (%)',
  participationHint: `ผ่านเมื่อ ≥ ${PITCHING_PARTICIPATION_MIN_PASS}%`,
  minimumPassed: 'ผ่านเงื่อนไขขั้นต่ำ',
  minimumFailed: 'ไม่ผ่านเงื่อนไขขั้นต่ำ',
  evidenceTitle: 'หลักฐานที่ตรวจสอบ',
  commentsTitle: 'ความเห็นของคณะกรรมการ',
  commentPlaceholder: 'กรอกความเห็น',
  verdictTitle: 'ความเห็นสรุปของกรรมการ',
  verdictReasonLabel: 'เหตุผลประกอบการพิจารณา',
  verdictReasonPlaceholder: 'ระบุเหตุผลประกอบการพิจารณา',
  noConflictLabel: 'ข้าพเจ้าไม่มีส่วนได้เสียกับกิจการที่ประเมิน',
  unsavedHint: 'ข้อมูลจะถูกบันทึกเมื่อกดส่งแบบประเมิน',
  submit: 'ส่งแบบประเมิน',
  submitting: 'กำลังส่ง...',
  submitConfirmTitle: 'ส่งแบบประเมิน',
  submitConfirmDescription:
    'คะแนนรวมจะถูกบันทึกเข้าอันดับ และสถานะร้านค้าจะไม่เปลี่ยนแปลง ต้องการส่งแบบประเมินนี้หรือไม่?',
  submitConfirmLabel: 'ส่งแบบประเมิน',
  submitSuccess: 'ส่งแบบประเมินเรียบร้อย',
  // Submitting does not freeze the form — a judge revises its own scoring at any
  // time — so an already-submitted form opens exactly like a draft. Without this
  // the judge cannot tell the two apart, and "ส่งแบบประเมิน" reads as a first
  // submission when it is really a correction of what the ranking already holds.
  resubmitNotice: 'แบบประเมินนี้ส่งแล้ว การแก้ไขจะมีผลกับอันดับเมื่อกดบันทึกการแก้ไข',
  resubmit: 'บันทึกการแก้ไข',
  resubmitting: 'กำลังบันทึก...',
  resubmitConfirmTitle: 'บันทึกการแก้ไข',
  resubmitConfirmDescription:
    'คะแนนรวมในอันดับจะถูกคำนวณใหม่จากที่แก้ไข วันที่ส่งเดิมและสถานะร้านค้าจะไม่เปลี่ยนแปลง ต้องการบันทึกหรือไม่?',
  resubmitConfirmLabel: 'บันทึกการแก้ไข',
  resubmitSuccess: 'บันทึกการแก้ไขเรียบร้อย',
  rankingTitle: 'อันดับคะแนนเฉลี่ยกรรมการ',
  provinceLabel: 'จังหวัด',
  provinceAll: 'ทุกจังหวัด',
  provinceHint: 'อันดับยังคงเป็นอันดับของทั้งรอบ ไม่ได้เรียงใหม่เฉพาะจังหวัดที่เลือก',
  downloadExcel: 'ดาวน์โหลด Excel',
  downloadPdf: 'ดาวน์โหลด PDF',
  downloadSuccess: 'ดาวน์โหลดไฟล์สำเร็จ',
  rankingDownloadHint: 'ไฟล์จะมีทุกร้านในรอบนี้ ไม่ใช่เฉพาะหน้าที่แสดงอยู่',
  rankingEmpty: 'ยังไม่มีแบบประเมินที่ส่งแล้วในรอบนี้',
  rankColumn: 'อันดับ',
  storeColumn: 'ร้านอาหาร',
  provinceColumn: 'จังหวัด',
  judgeCountColumn: 'จำนวนกรรมการ',
  avgScoreColumn: 'คะแนนเฉลี่ย',
  levelColumn: 'ระดับผลการประเมิน',
  minimumPassedColumn: 'ผ่านขั้นต่ำ',
  rankingItemLabel: 'ร้าน',
  selectRankingRow: 'เลือกร้านจากตารางอันดับเพื่อดูรายละเอียด',
  storeReportEmpty: 'ร้านนี้ยังไม่มีแบบประเมินที่ส่งแล้วในรอบนี้',
  rankOutOf: (rank: number, total: number) => `อันดับ ${rank} จาก ${total} ร้าน`,
  judgeCountValue: (count: number) => `${count} คน`,
  criterionAverageTitle: 'คะแนนเฉลี่ยรายเกณฑ์',
  judgeBreakdownTitle: 'ผลการประเมินจากกรรมการ',
  recommendationCountsTitle: 'มติกรรมการ',
  recommendationCountValue: (count: number) => `${count} คน`,
  noComment: '—',
  noCommentHint: 'กรรมการไม่ได้ระบุ',
} as const;

export const PITCHING_DASHBOARD_TEXT = {
  roundLabel: 'รอบคัดเลือก',
  storeLabel: 'ร้านอาหาร',
  judgeLabel: 'กรรมการ',
  judgeAll: 'ทุกกรรมการ (ค่าเฉลี่ย)',
  addScore: 'เพิ่มผลการประเมิน',

  storeCardTitle: 'ร้านอาหารที่กำลังประเมิน',
  ownerLabel: 'ผู้สมัคร',
  phoneLabel: 'เบอร์โทร',
  storeUnavailable: 'ไม่พบข้อมูลร้านนี้',
  fillScore: 'กรอกคะแนน',

  criteriaTitle: 'เกณฑ์การประเมิน',
  criteriaAverageColumn: 'คะแนนเฉลี่ย',
  criteriaJudgeColumn: 'คะแนนที่ให้',
  totalLabel: 'คะแนนรวม',
  totalHint: `(เต็ม ${PITCHING_TOTAL_MAX} คะแนน)`,
  criteriaEmpty: 'กรรมการท่านนี้ยังไม่ได้ให้คะแนนร้านนี้',

  summaryTitle: 'สรุปผลการประเมิน',
  avgTileTitle: 'คะแนนเฉลี่ย (ร้านนี้)',
  rankTileTitle: 'อันดับ',
  rankTileUnit: 'อันดับ',
  selectedShareTileTitle: 'กรรมการที่เห็นควรคัดเลือก',
  verdictTileTitle: 'ข้อเสนอแนะสถานะ',
  verdictNone: 'ยังไม่มีมติ',
  outOf: (value: string | number) => `/${value}`,
  selectedShareValue: (pct: number) => `${pct.toFixed(1)}%`,
  selectedShareDescription: (selected: number, total: number) => `${selected} จาก ${total} คน`,

  judgeOpinionTitle: 'ความคิดเห็นกรรมการ',
  opinionEmpty: 'กรรมการยังไม่ได้บันทึกความเห็น',
  opinionAutoJudgeHint:
    'ความเห็นเป็นข้อความรายคน จึงแสดงทีละท่าน — เลือกกรรมการจากตัวกรองด้านบนเพื่อดูของท่านอื่น',

  topRankingTitle: 'อันดับคะแนนสูงสุด',
  topRankingSubtitle: (size: number) => `(Top ${size})`,
  viewAllRanking: 'ดูอันดับทั้งหมด',
  rankingDialogTitle: 'อันดับคะแนนทั้งหมด',
  rankingDialogDescription: 'อันดับคะแนนเฉลี่ยกรรมการของทั้งรอบ เลือกร้านเพื่อดูรายละเอียด',
  storePhotoAlt: (name: string) => `รูปร้าน ${name}`,

  judgeTableTitle: 'ผลการประเมินจากกรรมการ (Judge-by-Judge)',
  judgeIndexColumn: '#',
  judgeNameColumn: 'กรรมการ',
  judgeTotalColumn: `คะแนนรวม (เต็ม ${PITCHING_TOTAL_MAX})`,
  judgeEvaluatedAtColumn: 'วันที่ประเมิน',
  judgeNoteColumn: 'หมายเหตุ',
  judgeStatusColumn: 'สถานะ',
  judgeTableEmpty: 'ยังไม่มีกรรมการประเมินร้านนี้',
  judgeTableItemLabel: 'รายการ',

  criteriaChartTitle: 'สถิติคะแนนเฉลี่ยรายเกณฑ์',
  criteriaChartSubtitle: '(จากกรรมการทั้งหมด)',
  criteriaChartSeriesLabel: 'คะแนนเฉลี่ย',

  distributionTitle: 'การกระจายคะแนนรวม',
  distributionSubtitle: '(ร้านที่มีผลการประเมินแล้ว)',
  distributionCenterLabel: 'ร้าน',
  distributionRowValue: (count: number, pct: number) => `${count} ร้าน (${pct.toFixed(1)}%)`,
  distributionEmpty: 'ยังไม่มีร้านที่ส่งแบบประเมินในรอบนี้',

  noStoreSelected: 'เลือกร้านอาหารจากด้านบนเพื่อดูผลการประเมิน',
  // The dashboard's picker is the ranking, so an empty picker means no store
  // has a submitted form in this round — not that the caller has no stores.
  noRankedStore: 'ยังไม่มีร้านที่ส่งแบบประเมินในรอบนี้',
} as const;
