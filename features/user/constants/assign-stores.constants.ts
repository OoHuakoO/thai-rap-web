/** `assessor` and `mentor` both write Store.assignedUsers; `owner` writes Store.ownerId. */
export type AssignStoresMode = 'assessor' | 'mentor' | 'owner';

// Copy keyed by mode rather than three flat `<mode><Field>` keys, so the dialog
// reads one entry instead of branching per string — and a fourth assignable
// role is one object here, not four more ternaries in the component.
export const ASSIGN_STORES_MODE_TEXT = {
  assessor: {
    trigger: 'มอบหมายร้าน',
    title: 'กำหนดสิทธิ์การประเมินร้าน',
    description: (name: string) =>
      `เลือกร้านที่ "${name}" มีสิทธิ์ประเมิน ผู้ประเมินจะให้คะแนนได้เฉพาะร้านในรายการนี้เท่านั้น`,
    success: 'บันทึกร้านที่มอบหมายแล้ว',
  },
  mentor: {
    trigger: 'มอบหมายร้าน',
    title: 'กำหนดร้านที่ให้คำปรึกษา',
    description: (name: string) =>
      `เลือกร้านที่ "${name}" ดูแล ที่ปรึกษาจะเห็นข้อมูลร้านและผลการประเมินเฉพาะร้านในรายการนี้เท่านั้น`,
    success: 'บันทึกร้านที่มอบหมายแล้ว',
  },
  owner: {
    trigger: 'กำหนดร้านที่เป็นเจ้าของ',
    title: 'กำหนดร้านให้ผู้ประกอบการ',
    description: (name: string) =>
      `เลือกร้านที่ "${name}" เป็นเจ้าของ ร้านที่มีเจ้าของอยู่แล้วจะถูกโอนมาให้ผู้ใช้นี้`,
    success: 'บันทึกร้านที่เป็นเจ้าของแล้ว',
  },
} as const satisfies Record<
  AssignStoresMode,
  { trigger: string; title: string; description: (name: string) => string; success: string }
>;

export const ASSIGN_STORES_TEXT = {
  searchPlaceholder: 'ค้นหารหัสหรือชื่อร้าน',
  selectedCount: (count: number) => `เลือกแล้ว ${count} ร้าน`,
  clearAll: 'ล้างทั้งหมด',
  empty: 'ไม่พบร้านค้า',
  loadError: 'โหลดรายชื่อร้านไม่สำเร็จ',
  ownedByOther: 'มีเจ้าของแล้ว',

  save: 'บันทึก',
  saving: 'กำลังบันทึก...',
  cancel: 'ยกเลิก',
} as const;

// 100 is the API's hard ceiling (`@Max(100)` on PaginationDto) — asking for
// more is a 422, not a bigger page. The picker takes the whole first page and
// leans on the search box for anything past it rather than adding pagination
// controls inside a dialog.
export const ASSIGN_STORES_PAGE_SIZE = 100;
