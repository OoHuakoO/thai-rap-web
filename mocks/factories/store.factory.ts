import type { Store, CreateStoreDto } from '@/features/store/types/store.types';

let idCounter = 100;

export function createStore(overrides: Partial<Store> = {}): Store {
  const id = String(++idCounter);
  const now = new Date().toISOString();
  return {
    id,
    name: `Store ${id}`,
    province: 'ชลบุรี',
    storeType: 'อาหารตามสั่ง',
    ownerName: 'เจ้าของร้าน',
    phone: '0800000000',
    email: null,
    address: '-',
    socialLinks: {},
    avgRevenueMin: null,
    avgRevenueMax: null,
    mainProblems: [],
    goals: [],
    menuPhotos: [],
    coverUrl: null,
    storePhotos: [],
    documents: [],
    status: 'REGISTERED',
    latestScore: null,
    latestAssessorName: null,
    latestAssessedAt: null,
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}

export function createStoreFromDto(dto: CreateStoreDto): Store {
  return createStore({
    name: dto.name,
    province: dto.province,
    storeType: dto.storeType,
    ownerName: dto.ownerName,
    phone: dto.phone,
    email: dto.email ?? null,
    address: dto.address,
    socialLinks: dto.socialLinks ?? {},
    avgRevenueMin: dto.avgRevenueMin ?? null,
    avgRevenueMax: dto.avgRevenueMax ?? null,
    mainProblems: dto.mainProblems ?? [],
    goals: dto.goals ?? [],
  });
}
