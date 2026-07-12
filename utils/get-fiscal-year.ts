const BUDDHIST_YEAR_OFFSET = 543;
const FISCAL_YEAR_START_MONTH = 10; // ปีงบประมาณไทยเริ่ม 1 ต.ค.

export function getCurrentFiscalYearBE(date: Date = new Date()): number {
  const month = date.getMonth() + 1;
  const ceYear = month >= FISCAL_YEAR_START_MONTH ? date.getFullYear() + 1 : date.getFullYear();
  return ceYear + BUDDHIST_YEAR_OFFSET;
}
