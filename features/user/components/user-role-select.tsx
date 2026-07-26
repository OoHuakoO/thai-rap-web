'use client';

import { toast } from 'sonner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { Role } from '@/types/auth.types';
import { extractErrorMessage } from '@/utils/extract-error-message';
import { CREATE_USER_ROLE_OPTIONS } from '../constants/create-user-form.constants';
import { USER_LIST_TEXT } from '../constants/user-list.constants';
import { useUpdateUser } from '../hooks/use-users';
import type { User } from '../types/user.types';

interface UserRoleSelectProps {
  user: User;
}

/** Inline role change from the user table — the level is the only field edited often enough to warrant it. */
export function UserRoleSelect({ user }: UserRoleSelectProps) {
  const { mutate: updateUser, isPending } = useUpdateUser(user.id);

  const handleChange = (role: string) => {
    updateUser(
      { role: role as Role },
      {
        onSuccess: () => toast.success(USER_LIST_TEXT.roleChangeSuccess),
        onError: (error) => toast.error(extractErrorMessage(error)),
      }
    );
  };

  return (
    <Select value={user.role} onValueChange={handleChange} disabled={isPending}>
      <SelectTrigger className="h-9 w-52" aria-label={`${USER_LIST_TEXT.columnRole} ${user.name}`}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {CREATE_USER_ROLE_OPTIONS.map((opt) => (
          <SelectItem key={opt.value} value={opt.value}>
            {opt.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
