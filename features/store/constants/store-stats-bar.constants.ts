// Text for the store stats summary bar (KPI cards + province distribution).

export const STORE_STATS_TEXT = {
  totalStoresTitle: 'จำนวนร้านทั้งหมด',
  targetLabel: (target: number) => `เป้าหมาย ${target} ร้าน`,
  t0CompletedTitle: 'ร้านที่ประเมินแล้ว T0',
  t1CompletedTitle: 'ร้านที่ประเมินแล้ว T1',
  passedTitle: 'ร้านที่ผ่านเข้ารอบ',
  storeUnit: 'ร้าน',
  provinceDistributionTitle: 'การกระจายตัวของร้านอาหารรายจังหวัด',
  provinceCountLabel: (count: number, pct: number) => `${count} ร้าน (${pct}%)`,
} as const;
