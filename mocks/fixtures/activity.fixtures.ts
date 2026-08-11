import type { Activity, ActivityPhoto } from '@/features/activity/types/activity.types';

const MOCK_AUTHOR = { id: '1', name: 'นายคมศักดิ์ กรณย์ประกิตต์' };

function photo(id: string, sortOrder: number): ActivityPhoto {
  return {
    id,
    url: `/uploads/activities/${id}.jpg`,
    sortOrder,
    uploadedAt: '2026-06-15T00:00:00.000Z',
  };
}

const seed: Activity[] = [
  {
    id: 'activity-01',
    title: 'ค่ายอบรมผู้ประกอบการ รุ่นที่ 1',
    description: 'อบรมเข้มข้น 3 วัน ด้านการเงินและการตลาดสำหรับร้านอาหาร',
    note: 'ผู้เข้าร่วม 48 ร้าน จาก 12 จังหวัด',
    activityDate: '2026-06-14T00:00:00.000Z',
    location: 'โรงแรมเซ็นทรา ศูนย์ราชการ กรุงเทพฯ',
    photos: [photo('activity-01-photo-1', 0), photo('activity-01-photo-2', 1)],
    photoCount: 2,
    createdById: MOCK_AUTHOR.id,
    createdByName: MOCK_AUTHOR.name,
    createdAt: '2026-06-15T00:00:00.000Z',
    updatedAt: '2026-06-15T00:00:00.000Z',
  },
  {
    id: 'activity-02',
    title: 'ลงพื้นที่ติดตามร้านค้า จังหวัดเชียงใหม่',
    description: 'ผู้ติดตามลงพื้นที่ประเมินรอบ T1 ร่วมกับที่ปรึกษา',
    note: null,
    activityDate: '2026-05-28T00:00:00.000Z',
    location: 'จังหวัดเชียงใหม่',
    photos: [photo('activity-02-photo-1', 0)],
    photoCount: 1,
    createdById: MOCK_AUTHOR.id,
    createdByName: MOCK_AUTHOR.name,
    createdAt: '2026-05-29T00:00:00.000Z',
    updatedAt: '2026-05-29T00:00:00.000Z',
  },
  {
    id: 'activity-03',
    title: 'เวทีพิชชิ่งรอบคัดเลือก',
    description: 'ร้านค้านำเสนอแผนธุรกิจต่อคณะกรรมการ',
    note: null,
    activityDate: '2026-05-10T00:00:00.000Z',
    location: null,
    photos: [],
    photoCount: 0,
    createdById: MOCK_AUTHOR.id,
    createdByName: MOCK_AUTHOR.name,
    createdAt: '2026-05-11T00:00:00.000Z',
    updatedAt: '2026-05-11T00:00:00.000Z',
  },
];

let store: Activity[] = seed.map((item) => ({ ...item, photos: [...item.photos] }));
let photoCounter = 0;

function withPhotoCount(activity: Activity): Activity {
  return { ...activity, photoCount: activity.photos.length };
}

function replace(index: number, activity: Activity): Activity {
  const next = withPhotoCount(activity);
  store = [...store.slice(0, index), next, ...store.slice(index + 1)];
  return next;
}

export const activityDb = {
  reset: () => {
    store = seed.map((item) => ({ ...item, photos: [...item.photos] }));
    photoCounter = 0;
  },
  // Newest activity date first — the order the API lists albums in.
  getAll: (search?: string) => {
    const term = search?.trim().toLowerCase();
    const filtered = term
      ? store.filter(
          (item) =>
            item.title.toLowerCase().includes(term) ||
            (item.location ?? '').toLowerCase().includes(term)
        )
      : [...store];
    return filtered.sort((a, b) => b.activityDate.localeCompare(a.activityDate));
  },
  findById: (id: string) => store.find((item) => item.id === id) ?? null,
  create: (activity: Activity) => {
    const next = withPhotoCount(activity);
    store = [next, ...store];
    return next;
  },
  update: (id: string, data: Partial<Activity>): Activity | null => {
    const index = store.findIndex((item) => item.id === id);
    if (index === -1) return null;
    return replace(index, { ...store[index], ...data });
  },
  remove: (id: string): boolean => {
    const before = store.length;
    store = store.filter((item) => item.id !== id);
    return store.length < before;
  },
  addPhotos: (id: string, count: number): Activity | null => {
    const index = store.findIndex((item) => item.id === id);
    if (index === -1) return null;

    const activity = store[index];
    const added: ActivityPhoto[] = Array.from({ length: count }, (_, offset) => {
      photoCounter += 1;
      return {
        id: `photo-${photoCounter}`,
        url: `/uploads/activities/${id}/photos/photo-${photoCounter}.jpg`,
        sortOrder: activity.photos.length + offset,
        uploadedAt: new Date().toISOString(),
      };
    });
    return replace(index, { ...activity, photos: [...activity.photos, ...added] });
  },
  updatePhoto: (
    id: string,
    photoId: string,
    data: { sortOrder?: number }
  ): ActivityPhoto | null => {
    const index = store.findIndex((item) => item.id === id);
    if (index === -1) return null;

    const activity = store[index];
    const photoIndex = activity.photos.findIndex((item) => item.id === photoId);
    if (photoIndex === -1) return null;

    const updated: ActivityPhoto = {
      ...activity.photos[photoIndex],
      ...(data.sortOrder === undefined ? {} : { sortOrder: data.sortOrder }),
    };
    const photos = [...activity.photos];
    photos[photoIndex] = updated;
    replace(index, { ...activity, photos });
    return updated;
  },
  removePhoto: (id: string, photoId: string): boolean => {
    const index = store.findIndex((item) => item.id === id);
    if (index === -1) return false;

    const activity = store[index];
    const photos = activity.photos.filter((item) => item.id !== photoId);
    if (photos.length === activity.photos.length) return false;

    replace(index, { ...activity, photos });
    return true;
  },
};
