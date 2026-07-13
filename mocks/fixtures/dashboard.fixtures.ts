import type {
  DashboardKPI,
  ProvinceDistribution,
  Top20Item,
  IncubationStep,
  ProvinceComparison,
  ActivityItem,
  ReportStatusItem,
} from '@/features/dashboard/types/dashboard.types';

export const dashboardKpi: DashboardKPI = {
  totalStores: 23,
  activeStores: 18,
  assessmentCount: 45,
  completionRate: 78,
  averageScore: 67.5,
  incubationCount: 5,
};

export const provinceDistribution: ProvinceDistribution[] = [
  { province: 'สระบุรี', count: 6 },
  { province: 'ลพบุรี', count: 5 },
  { province: 'ชัยนาท', count: 5 },
  { province: 'สิงห์บุรี', count: 4 },
  { province: 'อ่างทอง', count: 3 },
];

export const top20Stores: Top20Item[] = [
  { rank: 1, id: 's01', name: 'ร้านครัวริมน้ำ', province: 'สระบุรี', type: 'อาหารไทย', score: 88 },
  { rank: 2, id: 's02', name: 'บ้านอาหารชัยนาท', province: 'ชัยนาท', type: 'อาหารไทย', score: 85 },
  {
    rank: 3,
    id: 's03',
    name: 'ห้องอาหารลพบุรี',
    province: 'ลพบุรี',
    type: 'อาหารพื้นบ้าน',
    score: 83,
  },
  { rank: 4, id: 's04', name: 'ครัวสวนผัก', province: 'อ่างทอง', type: 'อาหารสุขภาพ', score: 81 },
  { rank: 5, id: 's05', name: 'อาหารป้าแดง', province: 'สิงห์บุรี', type: 'อาหารไทย', score: 79 },
  {
    rank: 6,
    id: 's06',
    name: 'ร้านข้าวต้มสระบุรี',
    province: 'สระบุรี',
    type: 'อาหารจานด่วน',
    score: 77,
  },
  {
    rank: 7,
    id: 's07',
    name: 'ครัวเรือนไทย',
    province: 'ลพบุรี',
    type: 'อาหารพื้นบ้าน',
    score: 76,
  },
  { rank: 8, id: 's08', name: 'อาหารสวนลุง', province: 'ชัยนาท', type: 'อาหารสุขภาพ', score: 74 },
  { rank: 9, id: 's09', name: 'บ้านอิ่มอร่อย', province: 'สิงห์บุรี', type: 'อาหารไทย', score: 73 },
  {
    rank: 10,
    id: 's10',
    name: 'ร้านกาแฟและอาหารว่าง',
    province: 'อ่างทอง',
    type: 'เบเกอรี่',
    score: 71,
  },
  { rank: 11, id: 's11', name: 'ครัวคุณแม่', province: 'สระบุรี', type: 'อาหารไทย', score: 70 },
  {
    rank: 12,
    id: 's12',
    name: 'อาหารทะเลลพบุรี',
    province: 'ลพบุรี',
    type: 'อาหารทะเล',
    score: 69,
  },
  { rank: 13, id: 's13', name: 'สวนอาหารชัยนาท', province: 'ชัยนาท', type: 'อาหารไทย', score: 68 },
  {
    rank: 14,
    id: 's14',
    name: 'ข้าวหมูแดงอ่างทอง',
    province: 'อ่างทอง',
    type: 'อาหารจานด่วน',
    score: 67,
  },
  {
    rank: 15,
    id: 's15',
    name: 'ร้านผัดไทยสิงห์บุรี',
    province: 'สิงห์บุรี',
    type: 'อาหารไทย',
    score: 65,
  },
  {
    rank: 16,
    id: 's16',
    name: 'ก๋วยเตี๋ยวเรือสระบุรี',
    province: 'สระบุรี',
    type: 'อาหารจานด่วน',
    score: 64,
  },
  {
    rank: 17,
    id: 's17',
    name: 'ครัวลาวลพบุรี',
    province: 'ลพบุรี',
    type: 'อาหารพื้นบ้าน',
    score: 63,
  },
  { rank: 18, id: 's18', name: 'บ้านข้าวหลาม', province: 'สิงห์บุรี', type: 'ขนมไทย', score: 61 },
  {
    rank: 19,
    id: 's19',
    name: 'ร้านน้ำเต้าหู้ชัยนาท',
    province: 'ชัยนาท',
    type: 'เครื่องดื่ม',
    score: 58,
  },
  {
    rank: 20,
    id: 's20',
    name: 'อาหารปิ้งย่างสระบุรี',
    province: 'สระบุรี',
    type: 'อาหารปิ้งย่าง',
    score: 55,
  },
];

export const incubationSteps: IncubationStep[] = [
  { label: 'T0', sublabel: 'ประเมินเบื้องต้น', count: 23, percent: 100, status: 'completed' },
  { label: 'T1', sublabel: 'ประเมินเชิงลึก', count: 18, percent: 78, status: 'completed' },
  { label: 'T2', sublabel: 'พัฒนาต่อเนื่อง', count: 12, percent: 52, status: 'active' },
  { label: 'T3', sublabel: 'ติดตามผล', count: 8, percent: 35, status: 'pending' },
  { label: 'T4', sublabel: 'เข้าสู่อุทยาน', count: 5, percent: 22, status: 'pending' },
];

export const provinceComparison: ProvinceComparison[] = [
  { province: 'สระบุรี', t0: 62, t1: 71 },
  { province: 'ลพบุรี', t0: 58, t1: 68 },
  { province: 'ชัยนาท', t0: 65, t1: 74 },
  { province: 'สิงห์บุรี', t0: 60, t1: 69 },
  { province: 'อ่างทอง', t0: 55, t1: 63 },
];

export const activityItems: ActivityItem[] = [
  {
    id: 'a1',
    variant: 'warning',
    title: 'คะแนนต่ำกว่าเกณฑ์',
    message: 'ร้านอาหารปิ้งย่างสระบุรี มีคะแนน T1 ต่ำกว่าเกณฑ์ (55/100)',
    timestamp: '2025-05-28T10:00:00Z',
  },
  {
    id: 'a2',
    variant: 'success',
    title: 'ส่งรายงานสำเร็จ',
    message: 'รายงาน T1 สระบุรีส่งครบแล้ว 6/6 ร้าน',
    timestamp: '2025-05-27T14:30:00Z',
  },
  {
    id: 'a3',
    variant: 'info',
    title: 'นัดกิจกรรม T2',
    message: 'กำหนดนัดติดตาม T2 ลพบุรี วันที่ 5 มิ.ย. 2568',
    timestamp: '2025-05-26T09:00:00Z',
  },
  {
    id: 'a4',
    variant: 'warning',
    title: 'เอกสารหมดอายุ',
    message: 'ร้านน้ำเต้าหู้ชัยนาท มีใบอนุญาต อย. หมดอายุภายใน 30 วัน',
    timestamp: '2025-05-25T11:00:00Z',
  },
  {
    id: 'a5',
    variant: 'info',
    message: 'เพิ่มผู้ประเมินใหม่ 2 คนเข้าระบบแล้ว',
    timestamp: '2025-05-24T08:00:00Z',
  },
];

export const reportsStatus: ReportStatusItem[] = [
  { id: 'r1', name: 'รายงาน T0 ภาพรวม', type: 'ภาพรวม', status: 'pass', updatedAt: '2568-03-15' },
  {
    id: 'r2',
    name: 'รายงาน T1 สระบุรี',
    type: 'รายจังหวัด',
    status: 'pass',
    updatedAt: '2568-05-20',
  },
  {
    id: 'r3',
    name: 'รายงาน T1 ลพบุรี',
    type: 'รายจังหวัด',
    status: 'pending',
    updatedAt: '2568-05-28',
  },
  { id: 'r4', name: 'แผน Action T2', type: 'แผนงาน', status: 'pending', updatedAt: '2568-05-28' },
  {
    id: 'r5',
    name: 'รายงาน Red Flag',
    type: 'แจ้งเตือน',
    status: 'warning',
    updatedAt: '2568-05-25',
  },
];
