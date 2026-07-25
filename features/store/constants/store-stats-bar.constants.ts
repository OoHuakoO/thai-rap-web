// Text for the store stats summary bar (participation + T0–T3 assessment KPIs).

// Line-art artwork for each KPI tile. These are alpha masks rendered through
// MaskIcon, so they take their colour from the tile — not baked-in white.
export const STORE_STATS_ICONS = {
  participation: '/icons/stats/participation.png',
  t0Completed: '/icons/stats/t0.png',
  t1Completed: '/icons/stats/t1.png',
  t2Completed: '/icons/stats/t2.png',
  t3Completed: '/icons/stats/t3.png',
} as const;

export const STORE_STATS_TEXT = {
  participationTitle: 'จำนวนร้านเข้าร่วม',
  targetLabel: (target: number) => `เป้าหมาย ${target} ร้าน`,
  t0CompletedTitle: 'ประเมินแล้ว T0',
  t1CompletedTitle: 'ประเมินแล้ว T1',
  t2CompletedTitle: 'ประเมินแล้ว T2',
  t3CompletedTitle: 'ประเมินแล้ว T3',
  storeUnit: 'ร้าน',
} as const;
