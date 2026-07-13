'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { FieldError } from '@/components/shared/field-error';
import { ROUTES } from '@/constants/routes';
import { LOGIN_FORM_TEXT } from '../constants/auth-form.constants';
import { loginSchema } from '../schemas/login.schema';
import type { LoginFormValues } from '../schemas/login.schema';
import { useLogin } from '../hooks/use-login';
import { extractErrorMessage } from '@/utils/extract-error-message';

export function LoginForm() {
  const { mutate: login, isPending, isError, error } = useLogin();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="space-y-1 text-center">
        <p className="text-2xl font-bold text-orange">{LOGIN_FORM_TEXT.brand}</p>
        <CardTitle className="text-xl">{LOGIN_FORM_TEXT.title}</CardTitle>
        <CardDescription>{LOGIN_FORM_TEXT.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit((data) => login(data))} className="space-y-4">
          {isError && (
            <p className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {extractErrorMessage(error)}
            </p>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="email">{LOGIN_FORM_TEXT.emailLabel}</Label>
            <Input
              id="email"
              type="email"
              placeholder={LOGIN_FORM_TEXT.emailPlaceholder}
              autoComplete="email"
              {...register('email')}
            />
            <FieldError message={errors.email?.message} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password">{LOGIN_FORM_TEXT.passwordLabel}</Label>
            <Input
              id="password"
              type="password"
              placeholder={LOGIN_FORM_TEXT.passwordPlaceholder}
              autoComplete="current-password"
              {...register('password')}
            />
            <FieldError message={errors.password?.message} />
          </div>

          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? LOGIN_FORM_TEXT.submitting : LOGIN_FORM_TEXT.submit}
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            {LOGIN_FORM_TEXT.noAccountPrompt}{' '}
            <Link href={ROUTES.REGISTER} className="font-medium text-orange hover:underline">
              {LOGIN_FORM_TEXT.registerLink}
            </Link>
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
