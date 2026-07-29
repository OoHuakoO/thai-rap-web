'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { FieldError } from '@/components/shared/field-error';
import { extractErrorMessage } from '@/utils/extract-error-message';
import { FORGOT_PASSWORD_FORM_TEXT } from '../constants/auth-form.constants';
import { resetPasswordSchema } from '../schemas/forgot-password.schema';
import type { ResetPasswordFormValues } from '../schemas/forgot-password.schema';
import { useResetPassword } from '../hooks/use-reset-password';

interface ForgotPasswordResetStepProps {
  resetToken: string;
  onReset: () => void;
}

export function ForgotPasswordResetStep({ resetToken, onReset }: ForgotPasswordResetStepProps) {
  const { mutate: resetPassword, isPending, isError, error } = useResetPassword();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
  });

  return (
    <form
      onSubmit={handleSubmit(({ password }) =>
        resetPassword({ resetToken, password }, { onSuccess: onReset })
      )}
      className="space-y-4"
    >
      {isError && (
        <p className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {extractErrorMessage(error)}
        </p>
      )}

      <div className="space-y-1.5">
        <Label htmlFor="password">{FORGOT_PASSWORD_FORM_TEXT.passwordLabel}</Label>
        <Input
          id="password"
          type="password"
          placeholder={FORGOT_PASSWORD_FORM_TEXT.passwordPlaceholder}
          autoComplete="new-password"
          {...register('password')}
        />
        <FieldError message={errors.password?.message} />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="confirmPassword">{FORGOT_PASSWORD_FORM_TEXT.confirmPasswordLabel}</Label>
        <Input
          id="confirmPassword"
          type="password"
          placeholder={FORGOT_PASSWORD_FORM_TEXT.confirmPasswordPlaceholder}
          autoComplete="new-password"
          {...register('confirmPassword')}
        />
        <FieldError message={errors.confirmPassword?.message} />
      </div>

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending
          ? FORGOT_PASSWORD_FORM_TEXT.submittingPassword
          : FORGOT_PASSWORD_FORM_TEXT.submitPassword}
      </Button>
    </form>
  );
}
