'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { FieldError } from '@/components/shared/field-error';
import { ROUTES } from '@/constants/routes';
import { ROLE_LABELS } from '@/types/auth.types';
import type { Role } from '@/types/auth.types';
import { REGISTER_FORM_TEXT } from '../constants/auth-form.constants';
import { registerSchema, REGISTERABLE_ROLES } from '../schemas/register.schema';
import type { RegisterFormValues } from '../schemas/register.schema';
import { useRegister } from '../hooks/use-register';
import { extractErrorMessage } from '@/utils/extract-error-message';

export function RegisterForm() {
  const { mutate: registerUser, isPending, isError, error } = useRegister();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { role: 'ENTREPRENEUR' },
  });

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="space-y-1 text-center">
        <p className="text-2xl font-bold text-orange">{REGISTER_FORM_TEXT.brand}</p>
        <CardTitle className="text-xl">{REGISTER_FORM_TEXT.title}</CardTitle>
        <CardDescription>{REGISTER_FORM_TEXT.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={handleSubmit(({ confirmPassword: _confirmPassword, ...payload }) =>
            registerUser(payload)
          )}
          className="space-y-4"
        >
          {isError && (
            <p className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {extractErrorMessage(error)}
            </p>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="name">{REGISTER_FORM_TEXT.nameLabel}</Label>
            <Input
              id="name"
              placeholder={REGISTER_FORM_TEXT.namePlaceholder}
              autoComplete="name"
              {...register('name')}
            />
            <FieldError message={errors.name?.message} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="email">{REGISTER_FORM_TEXT.emailLabel}</Label>
            <Input
              id="email"
              type="email"
              placeholder={REGISTER_FORM_TEXT.emailPlaceholder}
              autoComplete="email"
              {...register('email')}
            />
            <FieldError message={errors.email?.message} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="role">{REGISTER_FORM_TEXT.roleLabel}</Label>
            <Select
              value={watch('role')}
              onValueChange={(val) => setValue('role', val as RegisterFormValues['role'])}
            >
              <SelectTrigger id="role">
                <SelectValue placeholder={REGISTER_FORM_TEXT.rolePlaceholder} />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(ROLE_LABELS) as Role[]).map((role) => (
                  <SelectItem
                    key={role}
                    value={role}
                    disabled={
                      !REGISTERABLE_ROLES.includes(role as (typeof REGISTERABLE_ROLES)[number])
                    }
                  >
                    {ROLE_LABELS[role]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FieldError message={errors.role?.message} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password">{REGISTER_FORM_TEXT.passwordLabel}</Label>
            <Input
              id="password"
              type="password"
              placeholder={REGISTER_FORM_TEXT.passwordPlaceholder}
              autoComplete="new-password"
              {...register('password')}
            />
            <FieldError message={errors.password?.message} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="confirmPassword">{REGISTER_FORM_TEXT.confirmPasswordLabel}</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder={REGISTER_FORM_TEXT.confirmPasswordPlaceholder}
              autoComplete="new-password"
              {...register('confirmPassword')}
            />
            <FieldError message={errors.confirmPassword?.message} />
          </div>

          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? REGISTER_FORM_TEXT.submitting : REGISTER_FORM_TEXT.submit}
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            {REGISTER_FORM_TEXT.hasAccountPrompt}{' '}
            <Link href={ROUTES.LOGIN} className="font-medium text-orange hover:underline">
              {REGISTER_FORM_TEXT.loginLink}
            </Link>
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
