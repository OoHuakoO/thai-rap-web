export const ACCESS_CONTROL_TEXT = {
  pageTitle: 'กำหนดสิทธิ์การเข้าถึงข้อมูล',
  pageDescription: 'กำหนดว่าผู้ใช้แต่ละระดับเข้าถึงหรือจัดการข้อมูลส่วนใดได้บ้าง',
  superAdminOnlyNote: 'เฉพาะ Super Admin เท่านั้นที่แก้ไขหน้านี้ได้',
  lastUpdated: (at: string, by: string | null) =>
    by ? `แก้ไขล่าสุด ${at} โดย ${by}` : `แก้ไขล่าสุด ${at}`,

  tabPermissions: 'สิทธิ์ตามระดับผู้ใช้',
  tabScopes: 'ขอบเขตข้อมูล',
  tabPublicFields: 'ข้อมูลที่เปิดเผยได้',
  tabRoles: 'ระดับผู้ใช้',

  save: 'บันทึกการเปลี่ยนแปลง',
  saving: 'กำลังบันทึก...',
  saveSuccess: 'บันทึกสิทธิ์การเข้าถึงแล้ว',
  reset: 'รีเซ็ตเป็นค่าเริ่มต้น',
  discard: 'ยกเลิกการแก้ไข',
  unsavedChanges: 'มีการแก้ไขที่ยังไม่ได้บันทึก',
  loadError: 'โหลดข้อมูลสิทธิ์ไม่สำเร็จ',

  resetConfirmTitle: 'รีเซ็ตสิทธิ์ทั้งหมด',
  resetConfirmDescription:
    'สิทธิ์ทุกระดับจะกลับไปเป็นค่าเริ่มต้นของระบบ การแก้ไขที่ทำไว้จะหายไป ต้องการดำเนินการต่อหรือไม่?',
  resetConfirmLabel: 'รีเซ็ต',

  permissionColumn: 'สิทธิ์การใช้งาน',
  lockedHint: 'สิทธิ์นี้สงวนไว้สำหรับ Super Admin เท่านั้น',
  superAdminLockedHint: 'Super Admin มีสิทธิ์ทุกรายการเสมอ',

  scopeTitle: 'ขอบเขตข้อมูลที่แต่ละระดับเข้าถึงได้',
  scopeDescription:
    'สิทธิ์บอกว่า "ทำอะไรได้" ส่วนขอบเขตบอกว่า "กับข้อมูลของร้านไหน" เช่น ผู้ประเมินแก้ผลประเมินได้เฉพาะร้านที่ได้รับมอบหมาย',
  scopeRoleColumn: 'ระดับผู้ใช้',

  publicFieldsTitle: 'ข้อมูลร้านที่เปิดเผยต่อผู้ใช้ทั่วไป',
  publicFieldsDescription:
    'เลือกเฉพาะข้อมูลที่โครงการพิจารณาแล้วว่าเปิดเผยได้ ผู้ใช้ระดับที่มีขอบเขตข้อมูล "เฉพาะข้อมูลที่เปิดเผย" จะเห็นเฉพาะรายการที่เลือกไว้',
  sensitiveBadge: 'ข้อมูลอ่อนไหว',
  sensitiveWarning: 'มีการเปิดเผยข้อมูลอ่อนไหว โปรดตรวจสอบก่อนบันทึก',
  publicFieldsSelected: (count: number, total: number) => `เปิดเผย ${count} จาก ${total} รายการ`,

  rolesTitle: 'ระดับผู้ใช้งานในระบบ',
  rolesDescription: 'สรุประดับการเข้าถึงของผู้ใช้แต่ละประเภทตามข้อกำหนดของโครงการ',
  roleLevelLabel: (level: number) => `ระดับ ${level}`,
  rolePermissionCount: (count: number) => `${count} สิทธิ์`,
} as const;
