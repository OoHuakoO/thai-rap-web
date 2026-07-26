import type { AssessmentRound } from '@/features/dashboard/types/dashboard.types';

/** One synthetic store behind every number the dashboard shows. */
export interface DashboardStore {
  storeId: string;
  storeName: string;
  province: string;
  storeType: string;
  /** Score per round, or null when the store never reached that round. */
  scores: Record<AssessmentRound, number | null>;
  /** Highest round the store has completed; null when only registered. */
  reachedRound: AssessmentRound | null;
  /** Passed the pitching cut and moved on to the final round. */
  isSelected: boolean;
}

export const DASHBOARD_STORE_COUNT = 100;
export const DASHBOARD_TARGET_STORES = 120;

// Funnel sizes, largest first — each stage is a subset of the one before it, so
// the counts have to descend. Everything the dashboard reports (KPI cards,
// incubation steps, province rollups) is counted off these.
const FUNNEL: Record<AssessmentRound, number> = {
  T0: 96,
  T1: 78,
  T2: 61,
  T3: 44,
};

// Selection into the programme is its own cut, not a funnel stage — it used to
// ride on the (now removed) T4 count, so it needs its own number to keep the
// selected-store figures the dashboard reports unchanged.
const SELECTED_COUNT = 18;

const ROUND_ORDER: AssessmentRound[] = ['T0', 'T1', 'T2', 'T3'];

// Weighted so จันทบุรี (the host province) dominates the donut the way it does
// in the real programme, and the two smallest provinces still appear.
const PROVINCE_WEIGHTS: { province: string; weight: number }[] = [
  { province: 'จันทบุรี', weight: 28 },
  { province: 'ชลบุรี', weight: 24 },
  { province: 'ระยอง', weight: 18 },
  { province: 'ตราด', weight: 12 },
  { province: 'ฉะเชิงเทรา', weight: 10 },
  { province: 'ปราจีนบุรี', weight: 5 },
  { province: 'สระแก้ว', weight: 3 },
];

// Name prefix decides the store type, so "กาแฟบางแสน" can't come back tagged
// as อาหารทะเล. Prefixes with several plausible types pick one at random.
const NAME_PREFIXES: { prefix: string; types: string[] }[] = [
  { prefix: 'ครัว', types: ['อาหารไทย', 'อาหารตามสั่ง', 'อาหารพื้นบ้าน'] },
  { prefix: 'ร้าน', types: ['อาหารทะเล', 'ปิ้งย่าง', 'อาหารตามสั่ง'] },
  { prefix: 'บ้าน', types: ['อาหารทะเล', 'อาหารไทย'] },
  { prefix: 'เรือน', types: ['อาหารไทย', 'อาหารพื้นบ้าน'] },
  { prefix: 'สวนอาหาร', types: ['อาหารไทย', 'อาหารทะเล'] },
  { prefix: 'ก๋วยเตี๋ยว', types: ['ก๋วยเตี๋ยว'] },
  { prefix: 'ข้าวแกง', types: ['อาหารจานเดียว'] },
  { prefix: 'ส้มตำ', types: ['อาหารอีสาน'] },
  { prefix: 'กาแฟ', types: ['เครื่องดื่ม'] },
  { prefix: 'ขนมไทย', types: ['ของหวาน'] },
];

const NAME_PLACES = [
  'ริมธาร',
  'ทะเลสด',
  'คุณย่า',
  'ลุงหนวด',
  'แม่ศรี',
  'บ้านเพ',
  'ท่าใหม่',
  'บางแสน',
  'เกาะช้าง',
  'แปดริ้ว',
  'อ่างศิลา',
  'มาบตาพุด',
  'คลองใหญ่',
  'บางปะกง',
  'ศรีราชา',
  'ปากน้ำ',
  'เขาคิชฌกูฏ',
  'หนองมน',
  'บ่อไร่',
  'วังน้ำเย็น',
];

/**
 * Deterministic PRNG. A fresh `Math.random()` per page load would make every
 * KPI, percentage and ranking jump on reload, which reads as a bug rather than
 * as mock data.
 */
function mulberry32(seed: number): () => number {
  let state = seed;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function pickProvince(roll: number): string {
  const total = PROVINCE_WEIGHTS.reduce((sum, item) => sum + item.weight, 0);
  let cursor = roll * total;
  for (const item of PROVINCE_WEIGHTS) {
    cursor -= item.weight;
    if (cursor <= 0) return item.province;
  }
  return PROVINCE_WEIGHTS[PROVINCE_WEIGHTS.length - 1].province;
}

function round2(value: number): number {
  return Math.round(Math.min(100, Math.max(0, value)) * 100) / 100;
}

/**
 * Builds the 100-store dataset. Stores are ordered by how far they got through
 * the programme: index 0 reached the final round, the tail never got assessed.
 */
export function createDashboardStores(): DashboardStore[] {
  const random = mulberry32(20260520);

  const stores: DashboardStore[] = [];

  for (let index = 0; index < DASHBOARD_STORE_COUNT; index += 1) {
    const province = pickProvince(random());
    const { prefix, types } = NAME_PREFIXES[index % NAME_PREFIXES.length];
    const storeType = types[Math.floor(random() * types.length)];
    const place = NAME_PLACES[Math.floor(index / NAME_PREFIXES.length) % NAME_PLACES.length];

    // Every store starts somewhere between a weak and a solid T0, then gains a
    // little each round — with the occasional store that slips back.
    const baseScore = 48 + random() * 26;
    const scores: Record<AssessmentRound, number | null> = {
      T0: null,
      T1: null,
      T2: null,
      T3: null,
    };

    let running = baseScore;
    let reachedRound: AssessmentRound | null = null;

    for (const round of ROUND_ORDER) {
      if (index >= FUNNEL[round]) break;
      if (round !== 'T0') running += random() * 9 - 1.5;
      scores[round] = round2(running);
      reachedRound = round;
    }

    stores.push({
      storeId: `store-${String(index + 1).padStart(3, '0')}`,
      storeName: `${prefix}${place}`,
      province,
      storeType,
      scores,
      reachedRound,
      isSelected: index < SELECTED_COUNT,
    });
  }

  return stores;
}

/** Latest score the store has, regardless of which round produced it. */
export function latestScore(store: DashboardStore): number | null {
  return store.reachedRound === null ? null : store.scores[store.reachedRound];
}

export { FUNNEL as DASHBOARD_FUNNEL, ROUND_ORDER as DASHBOARD_ROUND_ORDER };
