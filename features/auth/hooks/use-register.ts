'use client';

import { useMutation } from '@tanstack/react-query';
import { authService } from '../services/auth.service';

// No login() and no redirect on success: the API creates the account as PENDING
// and returns no tokens, so there is no session to establish. The form renders
// a "waiting for approval" state instead.
export function useRegister() {
  return useMutation({
    mutationFn: authService.register,
  });
}
