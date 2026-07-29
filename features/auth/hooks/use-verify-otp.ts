'use client';

import { useMutation } from '@tanstack/react-query';
import { authService } from '../services/auth.service';

export function useVerifyOtp() {
  return useMutation({ mutationFn: authService.verifyOtp });
}
