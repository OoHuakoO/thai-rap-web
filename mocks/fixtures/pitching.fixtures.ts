import type {
  Pitching,
  PitchingCriterion,
  PitchingLevel,
  PitchingRound,
  UpdatePitchingDto,
} from '@/features/pitching';

// Mirrors the API's seeded PitchingCriterion rows — pinned ids, per-round
// maxScores summing to 100. Only the first rows of each round carry the real
// wording; the rest exist so a mock form still has the right shape and total.
const PITCH_DECK_CRITERIA: PitchingCriterion[] = [
  ['1', 'แนะนำร้านและข้อมูลพื้นฐาน', 5],
  ['2', 'จุดแข็งและอัตลักษณ์ของร้าน', 15],
  ['3', 'ตัวเลขการเงินปัจจุบัน', 15],
  ['4', 'ลูกค้าและตลาด', 10],
  ['5', 'แผนทำร้านให้แข็งแรง', 15],
  ['6', 'ไอเดียผลิตภัณฑ์ที่อยากต่อยอด', 10],
  ['7', 'ศักยภาพการขยายธุรกิจ', 10],
  ['8', 'ทีมและความพร้อมของผู้ประกอบการ', 10],
  ['9', 'สิ่งที่ต้องการจากโครงการ', 5],
  ['10', 'เหตุผลที่ควรได้รับคัดเลือก', 5],
].map(([code, title, maxScore], index) => ({
  id: 101 + index,
  round: 'PITCH_DECK' as const,
  code: code as string,
  section: null,
  title: title as string,
  guideline: 'สิ่งที่กรรมการควรพิจารณา',
  maxScore: maxScore as number,
  sortOrder: index + 1,
}));

const ACCELERATION_CRITERIA: PitchingCriterion[] = [
  ['1.1', 'A', 'ผล Score Card 8 มิติ', 10],
  ['1.2', 'A', 'ระบบหลังบ้านเป็นมาตรฐาน', 10],
  ['2.1', 'A', 'นำความรู้ไปปรับใช้จริง', 8],
  ['2.2', 'A', 'บันทึกข้อมูลธุรกิจสม่ำเสมอ', 6],
  ['2.3', 'A', 'เข้าร่วมและส่งงานมีคุณภาพ', 6],
  ['3.1', 'B', 'Market Validation', 8],
  ['3.2', 'B', 'กลุ่มเป้าหมายและช่องทางขาย', 6],
  ['3.3', 'B', 'จุดขายและความแตกต่าง', 6],
  ['4.1', 'B', 'กระบวนการผลิตทำซ้ำได้', 8],
  ['4.2', 'B', 'ขยายกำลังผลิตได้', 4],
  ['4.3', 'B', 'ความพร้อมด้านมาตรฐาน', 5],
  ['4.4', 'B', 'บรรจุภัณฑ์เหมาะสม', 3],
  ['5.1', 'B', 'แผนธุรกิจและยอดขายเติบโต', 6],
  ['5.2', 'B', 'รายได้ ต้นทุน กำไรและเงินสด', 6],
  ['5.3', 'B', 'Unit Economics', 6],
  ['5.4', 'B', 'แผนใช้วงเงินและความเสี่ยง', 2],
].map(([code, section, title, maxScore], index) => ({
  id: 201 + index,
  round: 'ACCELERATION' as const,
  code: code as string,
  section: section as string,
  title: title as string,
  guideline: 'เกณฑ์พิจารณาและแนวทางให้คะแนน',
  maxScore: maxScore as number,
  sortOrder: 11 + index,
}));

export const pitchingCriteria: PitchingCriterion[] = [
  ...PITCH_DECK_CRITERIA,
  ...ACCELERATION_CRITERIA,
];

export function criteriaForRound(round: PitchingRound): PitchingCriterion[] {
  return pitchingCriteria.filter((criterion) => criterion.round === round);
}

function scoredCriteria(round: PitchingRound, fill: (max: number) => number) {
  return criteriaForRound(round).map((criterion) => ({
    ...criterion,
    score: fill(criterion.maxScore),
    note: null,
  }));
}

const seed: Pitching[] = [
  {
    id: 'pitching-1',
    storeId: '1',
    storeCode: 'RAP69-001',
    storeName: 'บ้านริมน้ำ จันทบุรี',
    province: 'จันทบุรี',
    round: 'PITCH_DECK',
    judgeId: '4',
    judgeName: 'ดร.กฤษฎา วงษ์สมบัติ',
    status: 'SUBMITTED',
    totalScore: 83,
    currentScore: 83,
    level: 'HIGHLY_SUITABLE',
    recommendation: 'SELECTED',
    evaluatedAt: '2026-05-20T10:30:00Z',
    updatedAt: '2026-05-20T10:30:00Z',
    submittedAt: '2026-05-20T10:30:00Z',
    createdAt: '2026-05-20T09:00:00Z',
    prototypeProduct: null,
    minimumConditions: null,
    evidenceChecked: [],
    comments: {
      strengths: 'แผนนิเทศศิลป์และเมนูโดดเด่น',
      urgentImprovements: 'แผนการตลาดออนไลน์ยังไม่ชัดเจน',
      salesCostFeasibility: 'มีโอกาสลดต้นทุนวัตถุดิบได้',
      productMarketPotential: 'ต่อยอดเป็นสินค้าพร้อมทานได้',
      suggestions: 'ควรเข้าร่วมอบรมเชิงลึกด้านการตลาด',
    },
    recommendationReason: 'ศักยภาพโดยรวมอยู่ในเกณฑ์ที่ดี',
    noConflictOfInterest: true,
    criteria: scoredCriteria('PITCH_DECK', (max) => Math.round(max * 0.83)),
  },
];

let store: Pitching[] = [...seed];

export const pitchingDb = {
  reset: () => {
    store = [...seed];
  },
  getAll: () => store,
  findById: (id: string) => store.find((item) => item.id === id) ?? null,
  findMine: (storeId: string, round: PitchingRound, judgeId: string) =>
    store.find(
      (item) => item.storeId === storeId && item.round === round && item.judgeId === judgeId
    ) ?? null,
  create: (item: Pitching) => {
    store = [...store, item];
    return item;
  },
  update: (id: string, data: UpdatePitchingDto): Pitching | null => {
    return patch(id, (current) => ({
      ...current,
      prototypeProduct: data.prototypeProduct ?? current.prototypeProduct,
      evidenceChecked: data.evidenceChecked ?? current.evidenceChecked,
      comments: data.comments ?? current.comments,
      recommendation: data.recommendation ?? current.recommendation,
      recommendationReason: data.recommendationReason ?? current.recommendationReason,
      noConflictOfInterest: data.noConflictOfInterest ?? current.noConflictOfInterest,
      evaluatedAt: data.evaluatedAt ?? current.evaluatedAt,
      minimumConditions: current.minimumConditions
        ? buildMinimumConditions(
            data.scoreCardTotal === undefined
              ? current.minimumConditions.scoreCardTotal
              : data.scoreCardTotal,
            data.participationPct === undefined
              ? current.minimumConditions.participationPct
              : data.participationPct
          )
        : null,
    }));
  },
  setScore: (id: string, criterionId: number, score?: number | null, note?: string) =>
    patch(id, (current) => {
      const criteria = current.criteria.map((criterion) =>
        criterion.id === criterionId
          ? {
              ...criterion,
              score: score === undefined ? criterion.score : score,
              note: note === undefined ? criterion.note : note,
            }
          : criterion
      );
      return { ...current, criteria, currentScore: sumScores(criteria) };
    }),
  submit: (id: string) =>
    patch(id, (current) => {
      const totalScore = sumScores(current.criteria);
      return {
        ...current,
        status: 'SUBMITTED',
        totalScore,
        currentScore: totalScore,
        level: levelFor(totalScore),
        submittedAt: new Date().toISOString(),
      };
    }),
};

function patch(id: string, updater: (current: Pitching) => Pitching): Pitching | null {
  const index = store.findIndex((item) => item.id === id);
  if (index === -1) return null;
  const updated = { ...updater(store[index]), updatedAt: new Date().toISOString() };
  store = [...store.slice(0, index), updated, ...store.slice(index + 1)];
  return updated;
}

export function sumScores(criteria: { score: number | null }[]): number {
  return criteria.reduce((total, criterion) => total + (criterion.score ?? 0), 0);
}

export function levelFor(score: number): PitchingLevel {
  if (score >= 80) return 'HIGHLY_SUITABLE';
  if (score >= 70) return 'SUITABLE';
  if (score >= 60) return 'FAIR';
  return 'NOT_READY';
}

export function buildMinimumConditions(
  scoreCardTotal: number | null,
  participationPct: number | null
) {
  const scoreCardPassed = scoreCardTotal !== null && scoreCardTotal >= 30;
  const participationPassed = participationPct !== null && participationPct >= 90;
  return {
    scoreCardTotal,
    participationPct,
    scoreCardPassed,
    participationPassed,
    passed: scoreCardPassed && participationPassed,
  };
}
