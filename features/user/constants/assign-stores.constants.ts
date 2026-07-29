export const ASSIGN_STORES_TEXT = {
  assessorTrigger: 'มอบหมายร้าน',
  ownerTrigger: 'กำหนดร้านที่เป็นเจ้าของ',

  assessorTitle: 'กำหนดสิทธิ์การประเมินร้าน',
  assessorDescription: (name: string) =>
    `เลือกร้านที่ "${name}" มีสิทธิ์ประเมิน ผู้ประเมินจะให้คะแนนได้เฉพาะร้านในรายการนี้เท่านั้น`,
  ownerTitle: 'กำหนดร้านให้ผู้ประกอบการ',
  ownerDescription: (name: string) =>
    `เลือกร้านที่ "${name}" เป็นเจ้าของ ร้านที่มีเจ้าของอยู่แล้วจะถูกโอนมาให้ผู้ใช้นี้`,

  searchPlaceholder: 'ค้นหารหัสหรือชื่อร้าน',
  selectedCount: (count: number) => `เลือกแล้ว ${count} ร้าน`,
  clearAll: 'ล้างทั้งหมด',
  empty: 'ไม่พบร้านค้า',
  loadError: 'โหลดรายชื่อร้านไม่สำเร็จ',
  ownedByOther: 'มีเจ้าของแล้ว',

  save: 'บันทึก',
  saving: 'กำลังบันทึก...',
  cancel: 'ยกเลิก',
  assessorSuccess: 'บันทึกร้านที่มอบหมายแล้ว',
  ownerSuccess: 'บันทึกร้านที่เป็นเจ้าของแล้ว',
} as const;

// 100 is the API's hard ceiling (`@Max(100)` on PaginationDto) — asking for
// more is a 422, not a bigger page. The picker takes the whole first page and
// leans on the search box for anything past it rather than adding pagination
// controls inside a dialog.
export const ASSIGN_STORES_PAGE_SIZE = 100;
