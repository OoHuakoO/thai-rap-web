'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ROLES } from '@/types/auth.types';
import {
  CREATE_USER_FORM_TEXT,
  CREATE_USER_ROLE_OPTIONS,
} from '../constants/create-user-form.constants';
import { createUserSchema } from '../schemas/create-user.schema';
import type { CreateUserFormValues } from '../schemas/create-user.schema';
import { useCreateUser } from '../hooks/use-users';

export function CreateUserForm() {
  const { mutate: createUser, isPending, isError, error } = useCreateUser();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CreateUserFormValues>({
    resolver: zodResolver(createUserSchema),
    defaultValues: { role: ROLES.ENTREPRENEUR },
  });

  const onSubmit = (data: CreateUserFormValues) => {
    createUser(data, { onSuccess: () => reset() });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {isError && (
        <p className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {error instanceof Error ? error.message : CREATE_USER_FORM_TEXT.errorFallback}
        </p>
      )}

      <div className="space-y-1.5">
        <Label htmlFor="name">{CREATE_USER_FORM_TEXT.nameLabel}</Label>
        <Input
          id="name"
          {...register('name')}
          placeholder={CREATE_USER_FORM_TEXT.namePlaceholder}
        />
        {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="email">{CREATE_USER_FORM_TEXT.emailLabel}</Label>
        <Input
          id="email"
          {...register('email')}
          type="email"
          placeholder={CREATE_USER_FORM_TEXT.emailPlaceholder}
        />
        {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="role">{CREATE_USER_FORM_TEXT.roleLabel}</Label>
        <Select
          value={watch('role')}
          onValueChange={(val) => setValue('role', val as CreateUserFormValues['role'])}
        >
          <SelectTrigger id="role">
            <SelectValue placeholder={CREATE_USER_FORM_TEXT.rolePlaceholder} />
          </SelectTrigger>
          <SelectContent>
            {CREATE_USER_ROLE_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.role && <p className="text-sm text-destructive">{errors.role.message}</p>}
      </div>

      <Button type="submit" disabled={isPending} className="w-full">
        {isPending ? CREATE_USER_FORM_TEXT.submitting : CREATE_USER_FORM_TEXT.submit}
      </Button>
    </form>
  );
}
