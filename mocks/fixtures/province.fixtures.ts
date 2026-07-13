import type { Province } from '@/features/province/types/province.types';

// Mirrors the 7 ภาคตะวันออก provinces seeded server-side in thai-rap-api/prisma/seed.ts.
const NAMES: string[] = [
  'จันทบุรี',
  'ฉะเชิงเทรา',
  'ชลบุรี',
  'ตราด',
  'ปราจีนบุรี',
  'ระยอง',
  'สระแก้ว',
];

const provinces: Province[] = [...NAMES]
  .sort((a, b) => a.localeCompare(b, 'th'))
  .map((nameTh, index) => ({ id: index + 1, nameTh }));

export const provinceDb = {
  getAll: (): Province[] => provinces,
};
