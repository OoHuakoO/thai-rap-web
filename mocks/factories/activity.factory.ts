import type { Activity, CreateActivityDto } from '@/features/activity/types/activity.types';

let idCounter = 100;

const MOCK_AUTHOR = { id: '1', name: 'นายคมศักดิ์ กรณย์ประกิตต์' };

export function createActivity(overrides: Partial<Activity> = {}): Activity {
  const id = `activity-${++idCounter}`;
  const now = new Date().toISOString();
  return {
    id,
    title: `กิจกรรม ${id}`,
    description: 'รายละเอียดกิจกรรม',
    note: null,
    activityDate: now,
    location: null,
    photos: [],
    photoCount: 0,
    createdById: MOCK_AUTHOR.id,
    createdByName: MOCK_AUTHOR.name,
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}

export function createActivityFromDto(dto: CreateActivityDto): Activity {
  return createActivity({
    title: dto.title,
    description: dto.description,
    activityDate: dto.activityDate,
    location: dto.location ?? null,
    note: dto.note ?? null,
  });
}
