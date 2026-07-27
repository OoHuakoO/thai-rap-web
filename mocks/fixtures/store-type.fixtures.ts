import type { StoreType } from '@/features/store-type/types/store-type.types';

// Mirrors the ประเภทร้าน list seeded server-side in thai-rap-api/prisma/seed.ts.
const NAMES: string[] = ['อาหารไทย', 'อาหารทะเล', 'คาเฟ่', 'เดลิเวอรี', 'Catering', 'อื่น ๆ'];

const storeTypes: StoreType[] = NAMES.map((nameTh, index) => ({ id: index + 1, nameTh }));

export const storeTypeDb = {
  getAll: (): StoreType[] => storeTypes,
};
