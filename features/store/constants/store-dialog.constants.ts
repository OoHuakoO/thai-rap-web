// Text for confirm / success dialogs across store components.

export const STORE_DIALOG_TEXT = {
  successTitle: 'สำเร็จ',
  deleteConfirmLabel: 'ลบ',

  deleteStoreTitle: 'ลบร้าน',
  deleteStoreDescription: (name: string) =>
    `ต้องการลบร้าน "${name}" ใช่หรือไม่? การลบไม่สามารถกู้คืนได้`,

  deleteCoverTitle: 'ลบหน้าปก',
  deleteCoverDescription: 'ต้องการลบหน้าปกร้านใช่หรือไม่?',

  deleteDocumentTitle: 'ลบเอกสาร',
  deleteDocumentDescription: (fileName: string) => `ต้องการลบเอกสาร "${fileName}" ใช่หรือไม่?`,

  deletePhotoTitle: (label: string) => `ลบ${label}`,
  deletePhotoDescription: (label: string) => `ต้องการลบ${label}นี้ใช่หรือไม่?`,
} as const;
