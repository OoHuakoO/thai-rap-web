export type ZoneColor = 'red' | 'orange' | 'yellow' | 'blue' | 'green'

export function getZone(totalScore: number): string {
  if (totalScore < 40) return 'Red Zone'
  if (totalScore < 60) return 'Survival Zone'
  if (totalScore < 75) return 'Improve Zone'
  if (totalScore < 85) return 'Growth Zone'
  return 'Model Zone'
}

export const ZONE_DESCRIPTIONS: Record<string, string> = {
  'Red Zone': 'ร้านเสี่ยงสูง ต้องแก้เร่งด่วน',
  'Survival Zone': 'พอไปต่อได้ แต่ระบบยังอ่อน',
  'Improve Zone': 'มีศักยภาพ ควรเข้า Incubation',
  'Growth Zone': 'พร้อมพัฒนาเร็ว',
  'Model Zone': 'มีศักยภาพเป็นร้านต้นแบบ',
}

export const ZONE_COLORS: Record<string, ZoneColor> = {
  'Red Zone': 'red',
  'Survival Zone': 'orange',
  'Improve Zone': 'yellow',
  'Growth Zone': 'blue',
  'Model Zone': 'green',
}

export const ZONE_COLOR_HEX: Record<ZoneColor, string> = {
  red: '#dc2626',
  orange: '#ea580c',
  yellow: '#d97706',
  blue: '#2563eb',
  green: '#16a34a',
}

export const ZONE_BADGE_CLASSES: Record<ZoneColor, string> = {
  red: 'border-red-200 bg-red-50 text-red-700',
  orange: 'border-orange-200 bg-orange-50 text-orange-700',
  yellow: 'border-yellow-200 bg-yellow-50 text-yellow-700',
  blue: 'border-blue-200 bg-blue-50 text-blue-700',
  green: 'border-green-200 bg-green-50 text-green-700',
}
