// Stands in for the PasswordResetOtp table. The real API emails a random code;
// there is no inbox in mock mode, so every request accepts one fixed code.
export const MOCK_OTP = '123456';

const MAX_ATTEMPTS = 5;

interface ResetRequest {
  email: string;
  attempts: number;
  consumed: boolean;
}

let store: Record<string, ResetRequest> = {};
let tokenCounter = 0;

export const passwordResetDb = {
  reset: () => {
    store = {};
    tokenCounter = 0;
  },
  request: (email: string) => {
    store[email] = { email, attempts: 0, consumed: false };
  },
  find: (email: string): ResetRequest | null => store[email] ?? null,
  countAttempt: (email: string) => {
    const found = store[email];
    if (found) found.attempts += 1;
  },
  isExhausted: (email: string) => (store[email]?.attempts ?? 0) >= MAX_ATTEMPTS,
  consume: (email: string): string => {
    const found = store[email];
    if (found) found.consumed = true;
    return `mock-reset-${++tokenCounter}-${email}`;
  },
  findByResetToken: (token: string): ResetRequest | null => {
    const match = /^mock-reset-\d+-(.+)$/.exec(token);
    const found = match ? store[match[1]] : undefined;
    return found?.consumed ? found : null;
  },
  clear: (email: string) => {
    delete store[email];
  },
};
