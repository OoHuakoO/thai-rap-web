'use client';

import { useAuthStore } from '@/stores/useAuthStore';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/utils/cn';
import { Bell, LogOut } from 'lucide-react';

interface TopHeaderProps {
  title?: string;
  className?: string;
}

export function TopHeader({ title, className }: TopHeaderProps) {
  const { user, logout } = useAuthStore();

  return (
    <header
      className={cn(
        'flex h-14 items-center justify-between border-b bg-card px-6',
        className
      )}
    >
      {title && <h2 className="text-base font-semibold">{title}</h2>}

      <div className="ml-auto flex items-center gap-3">
        <Button variant="ghost" size="icon" aria-label="Notifications">
          <Bell className="h-4 w-4" />
        </Button>

        {user && (
          <>
            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-orange text-xs font-bold text-white">
                  {user.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium">{user.name}</span>
            </div>
            <Button variant="ghost" size="icon" onClick={logout} aria-label="Log out">
              <LogOut className="h-4 w-4" />
            </Button>
          </>
        )}
      </div>
    </header>
  );
}
