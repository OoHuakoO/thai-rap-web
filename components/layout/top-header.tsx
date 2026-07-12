'use client'

import Image from 'next/image'
import { useAuthStore } from '@/stores/useAuthStore'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { cn } from '@/utils/cn'
import { Bell, Building2, ChevronDown, LogOut } from 'lucide-react'
import { ROLE_LABELS } from '@/types/auth.types'
import { useLogout } from '@/features/auth'
import { ASSESSMENT_ROUND_STORE_COUNT, INCUBATION_TARGET_COUNT } from '@/constants'

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
      <div className="flex items-center justify-between gap-3 border-b border-muted px-4 py-1.5">
        <Image
          src="/thai-rap-logo.png"
          alt="THAI-RAP — Restaurant Assessment & Performance"
          width={128}
          height={36}
          priority
        />

        <div className="flex items-center gap-3">
          <div className="hidden items-center gap-1.5 rounded-full border border-orange bg-cream px-2.5 py-1 text-[10px] font-semibold text-orange lg:flex">
            <Building2 className="h-3 w-3" />
            <span>
              รอบประเมิน: <b>{ASSESSMENT_ROUND_STORE_COUNT} ร้าน</b> → Incubation:{' '}
              <b>{INCUBATION_TARGET_COUNT} ร้าน</b>
            </span>
          </div>

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
      <div className="relative overflow-hidden bg-gradient-to-br from-cream-soft to-cream-light px-4 py-2.5 text-center">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute right-10 top-1/2 h-[60px] w-[120px] -translate-y-1/2 bg-[radial-gradient(circle,rgba(241,113,40,0.18)_1.5px,transparent_1.5px)] [background-size:10px_10px]"
        />
        <p className="text-[13.5px] font-bold leading-normal text-orange-dark">
          หน่วยบริหารเครือข่าย การพัฒนาผู้ประกอบการธุรกิจอาหาร ในภูมิภาค ภาคตะวันออก
        </p>
        <p className="mt-0.5 text-xs font-semibold text-charcoal">
          ภายใต้โครงการการสร้างผู้ประกอบการร้านอาหารไทยมืออาชีพ
        </p>
        <p className="mt-0.5 text-[10.5px] text-muted-foreground">
          ประจำปีงบประมาณ พ.ศ. 2569 &nbsp;|&nbsp; มหาวิทยาลัยราชภัฏรำไพพรรณี จังหวัดจันทบุรี
        </p>
      </div>
    </header>
  )
}
