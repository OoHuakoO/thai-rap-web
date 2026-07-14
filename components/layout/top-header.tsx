'use client'

import Image from 'next/image'
import { useAuthStore } from '@/stores/auth-store'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { cn } from '@/utils/cn'
import { Bell, ChevronDown, LogOut } from 'lucide-react'
import { ROLE_LABELS } from '@/types/auth.types'
import { useLogout } from '@/features/auth'
import { getCurrentFiscalYearBE } from '@/utils/get-fiscal-year'

// Placeholder until the notifications API exists
const NOTIFICATION_COUNT = 0

interface TopHeaderProps {
  className?: string
}

export function TopHeader({ className }: TopHeaderProps) {
  const user = useAuthStore((s) => s.user)
  const { mutate: logout } = useLogout()

  return (
    <header className={cn('border-b bg-white', className)}>
      {/* Row 1: partner logos + quota + notifications + user */}
      <div className="flex items-center justify-between gap-3 border-b border-muted px-4 py-2">
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
          <Button variant="ghost" size="icon" aria-label="Notifications" className="relative h-8 w-8">
            <Bell className="h-4 w-4" />
            {NOTIFICATION_COUNT > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-orange px-1 text-[8px] font-bold text-white">
                {NOTIFICATION_COUNT}
              </span>
            )}
          </Button>

          {user && (
            <>
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-gradient-to-br from-orange to-orange-light text-[11px] font-bold text-white">
                    {user.name.charAt(0).toUpperCase()}
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
      </div>

      {/* Row 2: project banner */}
      <div className="relative overflow-hidden bg-gradient-to-br from-cream-soft to-cream-light px-4 py-4 text-center">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute right-10 top-1/2 h-[60px] w-[120px] -translate-y-1/2 bg-[radial-gradient(circle,rgba(241,113,40,0.18)_1.5px,transparent_1.5px)] [background-size:10px_10px]"
        />
        <p className="text-xl font-extrabold leading-normal text-purple-banner sm:text-2xl">
          หน่วยบริหารเครือข่าย การพัฒนาผู้ประกอบการธุรกิจอาหาร ในภูมิภาค ภาคตะวันออก
        </p>
        <p className="mt-1 text-base font-semibold text-charcoal">
          ภายใต้โครงการการสร้างผู้ประกอบการร้านอาหารไทยมืออาชีพ
        </p>
        <div className="mx-auto mt-3 flex max-w-md items-center gap-2">
          <span className="h-px flex-1 bg-gradient-to-r from-transparent to-orange" />
          <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-orange" />
          <span className="whitespace-nowrap text-sm font-semibold text-orange-dark">
            ประจำปีงบประมาณ พ.ศ. {getCurrentFiscalYearBE()}
          </span>
          <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-orange" />
          <span className="h-px flex-1 bg-gradient-to-l from-transparent to-orange" />
        </div>
        <p className="mt-1.5 text-sm text-muted-foreground">
          มหาวิทยาลัยราชภัฏรำไพพรรณี จังหวัดจันทบุรี
        </p>
      </div>
    </header>
  )
}
