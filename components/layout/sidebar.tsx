'use client'

import { useState } from 'react'
import type { ReactNode } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/utils/cn'
import { getInitials } from '@/utils/get-initials'
import { ROUTES } from '@/constants/routes'
import { getNavItemsForRole, getBottomNavItemsForRole } from '@/constants/nav-config'
import { useAuthStore } from '@/stores/auth-store'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { ROLE_LABELS } from '@/types/auth.types'

interface SidebarProps {
  className?: string
}

interface SidebarNavLinkProps {
  href: string
  disabled?: boolean
  collapsed: boolean
  labelTh: string
  padding: string
  linkClassName: string
  children: ReactNode
}

function SidebarNavLink({
  href,
  disabled,
  collapsed,
  labelTh,
  padding,
  linkClassName,
  children,
}: SidebarNavLinkProps) {
  const title = disabled
    ? collapsed
      ? `${labelTh} (ยังไม่เปิดใช้งาน)`
      : 'ยังไม่เปิดใช้งาน'
    : collapsed
      ? labelTh
      : undefined

  const base = cn(
    'flex items-center gap-2.5 rounded-md transition-colors',
    padding,
    collapsed ? 'justify-center px-0' : 'px-2'
  )

  if (disabled) {
    return (
      <span aria-disabled="true" title={title} className={cn(base, 'cursor-not-allowed text-gray-500 opacity-50')}>
        {children}
      </span>
    )
  }

  return (
    <Link href={href} title={title} className={cn(base, linkClassName)}>
      {children}
    </Link>
  )
}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname()
  const user = useAuthStore((s) => s.user)
  const [collapsed, setCollapsed] = useState(false)

  const navItems = user ? getNavItemsForRole(user.role) : []
  const bottomItems = user ? getBottomNavItemsForRole(user.role) : []

  return (
    <aside
      className={cn(
        'flex h-full flex-col bg-dark-nav py-3 transition-[width] duration-200',
        collapsed ? 'w-[62px] px-1.5' : 'w-[260px] px-3',
        className
      )}
    >
      {/* Logo */}
      <div
        className={cn(
          'mb-3 flex flex-col items-center gap-1.5 border-b border-white/10 pb-3',
          collapsed ? 'px-0' : 'px-2'
        )}
      >
        <Image
          src="/thai-rap-mark.png"
          alt="THAI-RAP"
          width={collapsed ? 34 : 88}
          height={collapsed ? 25 : 64}
          className="shrink-0"
        />
        {!collapsed && (
          <p className="text-xl font-extrabold tracking-wider text-white">THAI-RAP</p>
        )}
      </div>

      {/* Main nav */}
      <nav aria-label="Main navigation" className="flex flex-1 flex-col gap-0.5 overflow-y-auto">
        {navItems.map(({ label, labelTh, href, icon: Icon, disabled }) => {
          const isActive = href === ROUTES.HOME ? pathname === href : pathname.startsWith(href)

          const iconBox = (
            <span
              className={cn(
                'flex h-7 w-7 shrink-0 items-center justify-center rounded-md',
                isActive && !disabled ? 'bg-white/20' : 'bg-white/10'
              )}
            >
              <Icon className="h-4 w-4" />
            </span>
          )

          const labels = !collapsed && (
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-medium leading-tight">{labelTh}</span>
              <span className="block truncate text-[9px] leading-tight opacity-60">{label}</span>
            </span>
          )

          return (
            <SidebarNavLink
              key={href}
              href={href}
              disabled={disabled}
              collapsed={collapsed}
              labelTh={labelTh}
              padding="py-1.5"
              linkClassName={
                isActive ? 'bg-orange text-white' : 'text-gray-300 hover:bg-white/10 hover:text-white'
              }
            >
              {iconBox}
              {labels}
            </SidebarNavLink>
          )
        })}
      </nav>

      {/* Collapse toggle */}
      <button
        type="button"
        onClick={() => setCollapsed((c) => !c)}
        aria-label={collapsed ? 'ขยายแถบเมนู' : 'ย่อแถบเมนู'}
        className={cn(
          'mt-1 flex items-center gap-2 rounded-md border-t border-white/10 py-2 text-[11px] text-white/45 transition-colors hover:bg-white/5 hover:text-white/75',
          collapsed ? 'justify-center px-0' : 'px-2'
        )}
      >
        {collapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronLeft className="h-3.5 w-3.5" />}
        {!collapsed && <span>ย่อแถบเมนู</span>}
      </button>

      {/* Bottom nav (manual, etc.) */}
      {bottomItems.length > 0 && (
        <>
          <Separator className="my-1.5 bg-white/10" />
          <nav aria-label="Help navigation" className="flex flex-col gap-0.5">
            {bottomItems.map(({ label, labelTh, href, icon: Icon, disabled }) => (
              <SidebarNavLink
                key={href}
                href={href}
                disabled={disabled}
                collapsed={collapsed}
                labelTh={labelTh}
                padding="py-2"
                linkClassName="text-gray-300 hover:bg-white/10 hover:text-white"
              >
                <Icon className="h-4 w-4 shrink-0" />
                {!collapsed && (
                  <span className="truncate text-xs font-medium">
                    {labelTh} / {label}
                  </span>
                )}
              </SidebarNavLink>
            ))}
          </nav>
        </>
      )}

      {/* User info */}
      {user && (
        <>
          <Separator className="my-1.5 bg-white/10" />
          <div
            className={cn(
              'flex items-center gap-2.5 rounded-md py-2',
              collapsed ? 'justify-center px-0' : 'px-2'
            )}
          >
            <Avatar className="h-8 w-8 shrink-0">
              <AvatarFallback className="bg-orange text-xs font-bold text-white">
                {getInitials(user.name)}
              </AvatarFallback>
            </Avatar>
            {!collapsed && (
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-semibold text-white">{user.name}</p>
                <p className="truncate text-[11px] text-gray-400">{ROLE_LABELS[user.role]}</p>
              </div>
            )}
          </div>
        </>
      )}
    </aside>
  )
}
