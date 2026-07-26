// Display text for the Performance Analytics page.
// Components must not hardcode user-facing strings — add them here instead.

export const ANALYTICS_PAGE_TEXT = {
  title: 'วิเคราะห์ศักยภาพ',
  subtitle: 'Performance Analytics',
  noStores: 'ยังไม่มีร้านให้วิเคราะห์',
  noAnalysis: 'ยังไม่มีผลวิเคราะห์สำหรับร้านนี้ — ต้องประเมินอย่างน้อย 1 รอบก่อน',
} as const;

export const ANALYTICS_TOOLBAR_TEXT = {
  storeLabel: 'ร้านอาหาร',
  compareLabel: 'เปรียบเทียบ',
  provinceLabel: 'จังหวัด',
  allProvinces: 'ทุกจังหวัด',
  searchPlaceholder: 'ค้นหาชื่อร้าน',
  noStoreFound: 'ไม่พบร้านที่ค้นหา',
  export: 'ส่งออก (Export)',
  exporting: 'กำลังส่งออก…',
  exportSuccess: 'ส่งออกรายงานวิเคราะห์สำเร็จ',
  lastUpdated: 'อัปเดตล่าสุด',
  refresh: 'โหลดข้อมูลใหม่',
} as const;

export const ANALYTICS_KPI_TEXT = {
  scoreUnit: 'คะแนน',
  outOf: 'จาก 100 คะแนน',
  noScore: 'ยังไม่ประเมิน',
  baselineTitle: (round: string) => `คะแนนรวม ${round}`,
  currentTitle: (round: string) => `คะแนนรวม ${round}`,
  improvementTitle: (from: string, to: string) => `อัตราพัฒนา (${to} - ${from})`,
  improvementFromZero: 'เริ่มจากศูนย์',
  rankTitle: 'อันดับในโครงการ',
  rankUnit: (total: number) => `จาก ${total} ร้าน`,
  rankTopPercent: (percent: number) => `Top ${percent.toFixed(2)}%`,
  zoneTitle: 'โซนปัจจุบัน',
  readinessTitle: 'Incubation Readiness Score',
  readinessOutOf: '/ 100',
  readinessReady: 'พร้อมเข้าสู่การบ่มเพาะ',
  readinessNotReady: 'ยังไม่พร้อมเข้าสู่การบ่มเพาะ',
} as const;

export const RADAR_CARD_TEXT = {
  title: 'ภาพรวมศักยภาพ 8 มิติ (Radar Comparison)',
  empty: 'ยังไม่มีคะแนนรายมิติ',
  legendAria: 'ชุดข้อมูลในกราฟเรดาร์',
} as const;

export const DIMENSION_COMPARISON_TEXT = {
  title: (from: string, to: string) => `เปรียบเทียบคะแนนรายมิติ (${from} vs ${to})`,
  axisLabel: 'คะแนน',
  empty: 'ยังไม่มีคะแนนรายมิติ',
  dimensionLegendTitle: 'มิติการประเมิน',
} as const;

export const TREND_CARD_TEXT = {
  title: 'แนวโน้มพัฒนาการ',
  titleWithRange: (from: string, to: string) => `แนวโน้มพัฒนาการ (${from} – ${to} Trend)`,
  axisLabel: 'คะแนน',
  empty: 'ยังไม่มีข้อมูลแนวโน้ม',
  projectedLegend: 'เป้าหมาย (ประมาณการ)',
} as const;

export const HIGHLIGHT_CARD_TEXT = {
  strengthsTitle: 'จุดแข็งเด่น (Strengths)',
  weaknessesTitle: 'จุดอ่อนที่ต้องพัฒนา (Weaknesses)',
  scoreOutOf: (score: number) => `${Math.round(score)}/100`,
  emptyStrengths: 'ยังไม่มีมิติที่โดดเด่น',
  emptyWeaknesses: 'ยังไม่พบมิติที่ต่ำกว่าเกณฑ์',
} as const;

export const RED_FLAGS_CARD_TEXT = {
  title: 'Red Flags',
  detailLink: 'ดูรายละเอียด',
  empty: 'ไม่พบความเสี่ยงสำคัญ',
  dialogTitle: 'รายละเอียด Red Flag',
  severityLabel: 'ระดับความรุนแรง',
  triggerQuestionsLabel: 'ข้อที่เข้าเงื่อนไข',
  recommendationLabel: 'คำแนะนำ',
  noRecommendation: 'ยังไม่มีคำแนะนำจากระบบ',
  resolved: 'แก้ไขแล้ว',
  close: 'ปิด',
} as const;

export const INCUBATION_STATUS_TEXT = {
  title: 'สถานะการคัดเลือก (Incubation Status)',
  stepLabel: 'ขั้นตอน:',
  chanceLabel: 'โอกาสได้รับคัดเลือก:',
  chanceValue: (chance: number) => `${Math.round(chance)}%`,
  empty: 'ยังไม่เข้าสู่กระบวนการคัดเลือก',
} as const;

export const TARGET_CARD_TEXT = {
  title: (round: string) => `เป้าหมาย (${round} Target)`,
  totalScore: (score: number) => `คะแนนรวม ${score} คะแนน`,
  readiness: (score: number) => `Incubation Readiness ${score} / 100`,
  topPercentile: (percent: number) => `โอกาสติด Top ${percent}% ของโครงการ`,
} as const;

export const AI_ANALYSIS_TEXT = {
  title: 'วิเคราะห์ด้วยระบบอัจฉริยะ (AI / System Analysis)',
  insightPrefix: 'คำแนะนำเชิงลึก:',
  footerAction: 'ดูการวิเคราะห์ฉบับเต็ม',
  dialogTitle: 'ผลวิเคราะห์ฉบับเต็ม',
  empty: 'ระบบยังไม่ได้วิเคราะห์ร้านนี้',
  close: 'ปิด',
} as const;

export const MENTOR_RECOMMENDATIONS_TEXT = {
  title: 'คำแนะนำจากเมนเทอร์ (Mentor Recommendations)',
  footerAction: 'ดูคำแนะนำทั้งหมด',
  dialogTitle: 'คำแนะนำจากเมนเทอร์ทั้งหมด',
  empty: 'ยังไม่มีคำแนะนำจากเมนเทอร์',
  close: 'ปิด',
} as const;

export const ACTION_PLANS_TEXT = {
  title: 'แผนพัฒนาศักยภาพ (Action Plans)',
  progressLabel: 'ความคืบหน้า',
  detailLink: 'ดูรายละเอียด',
  empty: 'ยังไม่มีแผนพัฒนาสำหรับร้านนี้',
  dialogTitle: (label: string) => `รายละเอียด${label}`,
  itemsLabel: 'รายการที่ต้องทำ',
  close: 'ปิด',
} as const;
