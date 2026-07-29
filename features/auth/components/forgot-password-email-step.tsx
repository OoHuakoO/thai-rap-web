'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { FieldError } from '@/components/shared/field-error';
import { ROUTES } from '@/constants/routes';
import { extractErrorMessage } from '@/utils/extract-error-message';
import { FORGOT_PASSWORD_FORM_TEXT } from '../constants/auth-form.constants';
import { forgotPasswordEmailSchema } from '../schemas/forgot-password.schema';
import type { ForgotPasswordEmailValues } from '../schemas/forgot-password.schema';
import { useForgotPassword } from '../hooks/use-forgot-password';

interface ForgotPasswordEmailStepProps {
  defaultEmail: string;
  onSent: (email: string) => void;
}

export function ForgotPasswordEmailStep({ defaultEmail, onSent }: ForgotPasswordEmailStepProps) {
  const { mutate: requestOtp, isPending, isError, error } = useForgotPassword();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordEmailValues>({
    resolver: zodResolver(forgotPasswordEmailSchema),
    defaultValues: { email: defaultEmail },
  });

  return (
    <form
      onSubmit={handleSubmit(({ email }) =>
        requestOtp({ email }, { onSuccess: () => onSent(email) })
      )}
      className="space-y-4"
    >
      {isError && (
        <p className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {extractErrorMessage(error)}
        </p>
      )}

      <div className="space-y-1.5">
        <Label htmlFor="email">{FORGOT_PASSWORD_FORM_TEXT.emailLabel}</Label>
        <Input
          id="email"
          type="email"
          placeholder={FORGOT_PASSWORD_FORM_TEXT.emailPlaceholder}
          autoComplete="email"
          {...register('email')}
        />
        <FieldError message={errors.email?.message} />
      </div>

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? FORGOT_PASSWORD_FORM_TEXT.sendingOtp : FORGOT_PASSWORD_FORM_TEXT.sendOtp}
      </Button>

      <p className="text-center text-sm">
        <Link href={ROUTES.LOGIN} className="font-medium text-orange hover:underline">
          {FORGOT_PASSWORD_FORM_TEXT.backToLogin}
        </Link>
      </p>
    </form>
  );
}
