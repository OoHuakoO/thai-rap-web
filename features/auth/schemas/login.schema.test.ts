import { describe, it, expect } from 'vitest';
import { loginSchema } from './login.schema';
import { AUTH_VALIDATION_MESSAGES } from '../constants/auth-form.constants';

describe('loginSchema', () => {
  it('accepts a valid email and password', () => {
    const result = loginSchema.safeParse({
      email: 'alice@example.com',
      password: 'password123',
    });
    expect(result.success).toBe(true);
  });

  it('rejects an invalid email', () => {
    const result = loginSchema.safeParse({
      email: 'not-an-email',
      password: 'password123',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe(AUTH_VALIDATION_MESSAGES.emailInvalid);
    }
  });

  it('rejects a password shorter than 6 characters', () => {
    const result = loginSchema.safeParse({
      email: 'alice@example.com',
      password: '123',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe(AUTH_VALIDATION_MESSAGES.loginPasswordMin);
    }
  });
});
