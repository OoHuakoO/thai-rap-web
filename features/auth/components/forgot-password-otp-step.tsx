'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { FieldError } from '@/components/shared/field-error';
import { extractErrorMessage } from '@/utils/extract-error-message';
import {
  FORGOT_PASSWORD_FORM_TEXT,
  OTP_LENGTH,
  OTP_RESEND_COOLDOWN_SECONDS,
} from '../constants/auth-form.constants';
import { forgotPasswordOtpSchema } from '../schemas/forgot-password.schema';
import type { ForgotPasswordOtpValues } from '../schemas/forgot-password.schema';
import { useVerifyOtp } from '../hooks/use-verify-otp';
import { useForgotPassword } from '../hooks/use-forgot-password';

interface ForgotPasswordOtpStepProps {
  email: string;
  onVerified: (resetToken: string) => void;
  onChangeEmail: () => void;
}

export function ForgotPasswordOtpStep({
  email,
  onVerified,
  onChangeEmail,
}: ForgotPasswordOtpStepProps) {
  const { mutate: verifyOtp, isPending, isError, error } = useVerifyOtp();
  const { mutate: resendOtp, isPending: isResending } = useForgotPassword();
  const [cooldown, setCooldown] = useState(OTP_RESEND_COOLDOWN_SECONDS);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((seconds) => seconds - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordOtpValues>({
    resolver: zodResolver(forgotPasswordOtpSchema),
  });

  const handleResend = () => {
    resendOtp({ email }, { onSuccess: () => setCooldown(OTP_RESEND_COOLDOWN_SECONDS) });
  };

  return (
    <form
      onSubmit={handleSubmit(({ otp }) =>
        verifyOtp({ email, otp }, { onSuccess: ({ resetToken }) => onVerified(resetToken) })
      )}
      className="space-y-4"
    >
      {isError ? (
        <p className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {extractErrorMessage(error)}
        </p>
      ) : (
        <p className="rounded-md bg-muted p-3 text-sm text-muted-foreground">
          {FORGOT_PASSWORD_FORM_TEXT.otpSentNotice}
        </p>
      )}

      <div className="space-y-1.5">
        <Label htmlFor="otp">{FORGOT_PASSWORD_FORM_TEXT.otpLabel}</Label>
        <Input
          id="otp"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={OTP_LENGTH}
          placeholder={FORGOT_PASSWORD_FORM_TEXT.otpPlaceholder}
          className="text-center text-lg tracking-[0.5em]"
          {...register('otp')}
        />
        <FieldError message={errors.otp?.message} />
      </div>

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? FORGOT_PASSWORD_FORM_TEXT.verifyingOtp : FORGOT_PASSWORD_FORM_TEXT.verifyOtp}
      </Button>

      <div className="flex items-center justify-between text-sm">
        <button
          type="button"
          onClick={onChangeEmail}
          className="font-medium text-orange hover:underline"
        >
          {FORGOT_PASSWORD_FORM_TEXT.changeEmail}
        </button>
        {cooldown > 0 ? (
          <span className="text-muted-foreground">
            {FORGOT_PASSWORD_FORM_TEXT.resendCountdown(cooldown)}
          </span>
        ) : (
          <button
            type="button"
            onClick={handleResend}
            disabled={isResending}
            className="font-medium text-orange hover:underline disabled:opacity-50"
          >
            {FORGOT_PASSWORD_FORM_TEXT.resendOtp}
          </button>
        )}
      </div>
    </form>
  );
}
