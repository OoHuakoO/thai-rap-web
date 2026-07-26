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
import { FieldError } from '@/components/shared/field-error';
import { ROLES } from '@/types/auth.types';
import { extractErrorMessage } from '@/utils/extract-error-message';
import {
  CREATE_USER_FORM_TEXT,
  CREATE_USER_ROLE_OPTIONS,
} from '../constants/create-user-form.constants';
import { createUserSchema } from '../schemas/create-user.schema';
import type { CreateUserFormValues } from '../schemas/create-user.schema';
import { useCreateUser } from '../hooks/use-users';

interface CreateUserFormProps {
  onCreated?: () => void;
}

export function CreateUserForm({ onCreated }: CreateUserFormProps) {
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
    createUser(
      {
        name: data.name,
        email: data.email,
        role: data.role,
        // Empty optional fields are omitted rather than sent as '' — the API
        // stores null for "not provided".
        ...(data.phone ? { phone: data.phone } : {}),
        ...(data.organization ? { organization: data.organization } : {}),
      },
      {
        onSuccess: () => {
          reset();
          onCreated?.();
        },
      }
    );
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {isError && (
        <p className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {error ? extractErrorMessage(error) : CREATE_USER_FORM_TEXT.errorFallback}
        </p>
      )}

      <div className="space-y-1.5">
        <Label htmlFor="name">{CREATE_USER_FORM_TEXT.nameLabel}</Label>
        <Input
          id="name"
          {...register('name')}
          placeholder={CREATE_USER_FORM_TEXT.namePlaceholder}
        />
        <FieldError message={errors.name?.message} />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="email">{CREATE_USER_FORM_TEXT.emailLabel}</Label>
        <Input
          id="email"
          {...register('email')}
          type="email"
          placeholder={CREATE_USER_FORM_TEXT.emailPlaceholder}
        />
        <FieldError message={errors.email?.message} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="phone">{CREATE_USER_FORM_TEXT.phoneLabel}</Label>
          <Input
            id="phone"
            {...register('phone')}
            inputMode="numeric"
            placeholder={CREATE_USER_FORM_TEXT.phonePlaceholder}
          />
          <FieldError message={errors.phone?.message} />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="organization">{CREATE_USER_FORM_TEXT.organizationLabel}</Label>
          <Input
            id="organization"
            {...register('organization')}
            placeholder={CREATE_USER_FORM_TEXT.organizationPlaceholder}
          />
          <FieldError message={errors.organization?.message} />
        </div>
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
        <p className="text-xs text-muted-foreground">{CREATE_USER_FORM_TEXT.roleHint}</p>
        <FieldError message={errors.role?.message} />
      </div>

      <Button type="submit" disabled={isPending} className="w-full">
        {isPending ? CREATE_USER_FORM_TEXT.submitting : CREATE_USER_FORM_TEXT.submit}
      </Button>
    </form>
  );
}
