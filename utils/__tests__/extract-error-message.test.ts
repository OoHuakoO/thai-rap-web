// Run with: npx vitest (requires vitest + @testing-library setup from Sprint 8)
import { describe, it, expect } from 'vitest'
import { ApiError } from '@/services/api-error'
import { extractErrorMessage } from '../extract-error-message'

describe('extractErrorMessage', () => {
  it('returns message from ApiError instance', () => {
    const err = new ApiError({ message: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง', statusCode: 401, code: 'UNAUTHORIZED' })
    expect(extractErrorMessage(err)).toBe('อีเมลหรือรหัสผ่านไม่ถูกต้อง')
  })

  it('returns message from plain Error', () => {
    expect(extractErrorMessage(new Error('plain error'))).toBe('plain error')
  })

  it('returns default message for unknown type', () => {
    expect(extractErrorMessage(null)).toBe('เกิดข้อผิดพลาดที่ไม่คาดคิด')
    expect(extractErrorMessage(42)).toBe('เกิดข้อผิดพลาดที่ไม่คาดคิด')
  })
})
