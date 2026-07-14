import { describe, it, expect } from 'vitest';
import { registerSchema } from './register.schema';
import { AUTH_VALIDATION_MESSAGES } from '../constants/auth-form.constants';

function validPayload(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    name: 'สมศรี ใจดี',
    email: 'somsri@example.com',
    password: 'password123',
    confirmPassword: 'password123',
    role: 'ENTREPRENEUR',
    ...overrides,
  };
}

describe('registerSchema', () => {
  it('accepts a valid payload', () => {
    const result = registerSchema.safeParse(validPayload());
    expect(result.success).toBe(true);
  });

  it('rejects a name shorter than 2 characters', () => {
    const result = registerSchema.safeParse(validPayload({ name: 'A' }));
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe(AUTH_VALIDATION_MESSAGES.nameMin);
    }
  });

  it('rejects a password shorter than 8 characters', () => {
    const result = registerSchema.safeParse(validPayload({ password: '1234567', confirmPassword: '1234567' }));
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe(AUTH_VALIDATION_MESSAGES.registerPasswordMin);
    }
  });

  it('rejects when confirmPassword does not match password', () => {
    const result = registerSchema.safeParse(validPayload({ confirmPassword: 'different1' }));
    expect(result.success).toBe(false);
    if (!result.success) {
      const issue = result.error.issues.find((i) => i.path[0] === 'confirmPassword');
      expect(issue?.message).toBe(AUTH_VALIDATION_MESSAGES.passwordMismatch);
    }
  });

  it('rejects a role outside the registerable set', () => {
    const result = registerSchema.safeParse(validPayload({ role: 'ADMIN' }));
    expect(result.success).toBe(false);
    if (!result.success) {
      const issue = result.error.issues.find((i) => i.path[0] === 'role');
      expect(issue?.message).toBe(AUTH_VALIDATION_MESSAGES.roleRequired);
    }
  });

  it('accepts ASSESSOR as a registerable role', () => {
    const result = registerSchema.safeParse(validPayload({ role: 'ASSESSOR' }));
    expect(result.success).toBe(true);
  });
});
