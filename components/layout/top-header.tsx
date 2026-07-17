'use client'

import Image from 'next/image'
import { useAuthStore } from '@/stores/auth-store'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { cn } from '@/utils/cn'
import { Bell, ChevronDown, LogOut } from 'lucide-react'
import { ROLE_LABELS } from '@/types/auth.types'
import { useLogout } from '@/features/auth'
import { getInitials } from '@/utils/get-initials'

interface TopHeaderProps {
  className?: string
}

export function TopHeader({ className }: TopHeaderProps) {
  const user = useAuthStore((s) => s.user)
  const { mutate: logout } = useLogout()

  return (
    <header className={cn('flex items-center justify-between gap-3 border-b bg-white px-4 py-2', className)}>
      <div className="flex flex-1 justify-center">
        <Image
          src="/partner-logos.png"
          alt="พันธมิตรโครงการ THAI-RAP"
          width={1823}
          height={182}
          className="h-16 w-auto"
          priority
        />
      </div>

      <div className="flex shrink-0 items-center gap-3">
        <Button variant="ghost" size="icon" aria-label="Notifications" className="h-8 w-8">
          <Bell className="h-4 w-4" />
        </Button>

        {user && (
          <>
            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-gradient-to-br from-orange to-orange-light text-[11px] font-bold text-white">
                  {getInitials(user.name)}
                </AvatarFallback>
              </Avatar>
              <div className="hidden sm:block">
                <p className="text-xs font-semibold leading-tight">{user.name}</p>
                <p className="flex items-center gap-0.5 text-[10px] leading-tight text-muted-foreground">
                  {ROLE_LABELS[user.role]}
                  <ChevronDown className="h-2.5 w-2.5" />
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => logout()}
              aria-label="Log out"
              className="h-8 w-8"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </>
        )}
      </div>
    </header>
  )
}
