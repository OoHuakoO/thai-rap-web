'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Plus, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { ROUTES } from '@/constants/routes';
import { useAuthStore } from '@/stores/auth-store';
import { PERMISSIONS } from '@/types/auth.types';
import { CREATE_USER_FORM_TEXT } from '../constants/create-user-form.constants';
import { USER_LIST_TEXT } from '../constants/user-list.constants';
import { CreateUserForm } from './create-user-form';

export function UserPageHeader() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const can = useAuthStore((s) => s.can);

  return (
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div>
        <h1 className="text-xl font-semibold text-text-main">{USER_LIST_TEXT.pageTitle}</h1>
        <p className="text-sm text-charcoal">{USER_LIST_TEXT.pageDescription}</p>
      </div>

      <div className="flex items-center gap-2">
        {can(PERMISSIONS.PERMISSIONS_MANAGE) && (
          <Button variant="outline" asChild>
            <Link href={ROUTES.USER_PERMISSIONS}>
              <ShieldCheck className="mr-2 h-4 w-4" />
              {USER_LIST_TEXT.managePermissions}
            </Link>
          </Button>
        )}

        {can(PERMISSIONS.USERS_WRITE) && (
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                {USER_LIST_TEXT.addUser}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{CREATE_USER_FORM_TEXT.dialogTitle}</DialogTitle>
                <DialogDescription>{CREATE_USER_FORM_TEXT.dialogDescription}</DialogDescription>
              </DialogHeader>
              <CreateUserForm
                onCreated={() => {
                  setIsCreateOpen(false);
                  toast.success(CREATE_USER_FORM_TEXT.createSuccess);
                }}
              />
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
}
