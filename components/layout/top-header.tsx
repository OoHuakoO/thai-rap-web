'use client'

import { useAuthStore } from '@/stores/useAuthStore'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { cn } from '@/utils/cn'
import { Bell, LogOut } from 'lucide-react'
import { ROLE_LABELS } from '@/types/auth.types'

interface TopHeaderProps {
  className?: string
}

export function TopHeader({ className }: TopHeaderProps) {
  const { user, logout } = useAuthStore()

  return (
    <header
      className={cn(
        'flex h-12 items-center justify-end border-b bg-white px-6 gap-2',
        className
      )}
    >
      <Button variant="ghost" size="icon" aria-label="Notifications" className="h-8 w-8">
        <Bell className="h-4 w-4" />
      </Button>

      {user && (
        <>
          <div className="flex items-center gap-2">
            <Avatar className="h-7 w-7">
              <AvatarFallback className="bg-orange text-[11px] font-bold text-white">
                {user.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="hidden sm:block">
              <p className="text-xs font-semibold leading-tight">{user.name}</p>
              <p className="text-[11px] text-muted-foreground leading-tight">{ROLE_LABELS[user.role]}</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={logout} aria-label="Log out" className="h-8 w-8">
            <LogOut className="h-4 w-4" />
          </Button>
        </>
      )}
    </header>
  )
}
