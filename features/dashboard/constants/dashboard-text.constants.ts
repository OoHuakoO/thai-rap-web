export const DASHBOARD_KPI_TEXT = {
  storeUnit: 'ร้าน',
  totalStoresTitle: 'จำนวนร้านเข้าร่วม',
  targetStores: (target: number) => `เป้าหมาย ${target} ร้าน`,
  t0Title: 'ประเมินแล้ว T0',
  t1Title: 'ประเมินแล้ว T1',
  t2Title: 'ประเมินแล้ว T2',
  t3Title: 'ประเมินแล้ว T3',
  improvementTitle: 'อัตราการพัฒนา',
  empty: 'ยังไม่มีข้อมูลภาพรวมโครงการ',
} as const;

export const PROVINCE_DONUT_TEXT = {
  title: 'การกระจายตัวของร้านอาหารตามจังหวัด (ภาคตะวันออก)',
  centerUnit: 'ร้าน',
  legendEntry: (count: number, percentage: number) => `${count} ร้าน (${percentage}%)`,
  empty: 'ยังไม่มีข้อมูลการกระจายตัวรายจังหวัด',
} as const;

export const TOP20_TEXT = {
  title: 'Top 20 ร้านค้าที่ได้คะแนนสูงสุด',
  roundFilterLabel: 'รอบการประเมิน',
  rankColumn: 'อันดับ',
  storeNameColumn: 'ชื่อร้าน',
  provinceColumn: 'จังหวัด',
  storeTypeColumn: 'ประเภทอาหาร',
  scoreColumn: 'คะแนน T',
  footerLink: 'ดูรายชื่อทั้งหมด 20 ร้าน',
  empty: 'ยังไม่มีข้อมูลคะแนนร้านค้า',
} as const;

export const TOP20_DIALOG_TEXT = {
  title: 'Top 20 ร้านค้าที่ได้คะแนนสูงสุด',
  description: 'รายชื่อร้านค้า 20 อันดับแรกตามรอบการประเมินที่เลือก',
} as const;

export const INCUBATION_PROGRESS_TEXT = {
  title: 'สถานะการพัฒนาผู้ประกอบการ (Incubation Progress)',
  storeCount: (count: number) => `${count} ร้าน`,
  percentage: (percentage: number) => `${percentage}%`,
  empty: 'ยังไม่มีข้อมูลสถานะการพัฒนา',
} as const;

export const PROVINCE_COMPARISON_TEXT = {
  title: (from: string, to: string) => `เปรียบเทียบผลคะแนนเฉลี่ย (${from} vs ${to})`,
  roundPairLabel: 'คู่รอบที่เปรียบเทียบ',
  seriesLabel: (round: string) => `คะแนนเฉลี่ย ${round}`,
  footerLink: 'ดูรายละเอียดการวิเคราะห์',
  empty: 'ยังไม่มีข้อมูลเปรียบเทียบคะแนน',
} as const;

export const STORE_SCORES_DIALOG_TEXT = {
  title: 'ตารางคะแนนรายร้าน แยกตามจังหวัด',
  description: 'คะแนนรวมของแต่ละร้านในทุกรอบการประเมิน (T0–T3)',
  provinceColumn: 'จังหวัด',
  storeNameColumn: 'ชื่อร้าน',
  storeTypeColumn: 'ประเภทอาหาร',
  noScore: '-',
  downloadLabel: 'ดาวน์โหลด Excel',
  downloading: 'กำลังสร้างไฟล์...',
  downloadSuccess: 'ดาวน์โหลดไฟล์สำเร็จ',
  empty: 'ยังไม่มีข้อมูลคะแนนรายร้าน',
} as const;

export const ACTIVITY_FEED_TEXT = {
  title: 'กิจกรรมล่าสุด / ติดตามเร่งด่วน',
  footerLink: 'ดูทั้งหมด',
  empty: 'ยังไม่มีกิจกรรมล่าสุด',
} as const;

export const REPORTS_STATUS_TEXT = {
  title: 'เอกสาร / รายงาน',
  nameColumn: 'รายงาน',
  formatColumn: 'รูปแบบ',
  createdAtColumn: 'วันที่สร้าง',
  statusColumn: 'สถานะ',
  actionColumn: 'จัดการ',
  downloadLabel: (name: string) => `ดาวน์โหลด ${name}`,
  downloadSuccess: 'ดาวน์โหลดรายงานสำเร็จ',
  footerLink: 'ดูรายงานทั้งหมด',
  empty: 'ยังไม่มีรายงานที่ส่งออก',
} as const;

export const DASHBOARD_SHARED_TEXT = {
  dataAsOf: (date: string) => `ข้อมูล ณ วันที่ ${date}`,
} as const;
