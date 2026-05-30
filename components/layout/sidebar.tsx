'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/utils/cn'
import { ROUTES } from '@/constants/routes'
import { getNavItemsForRole, getBottomNavItemsForRole } from '@/constants/nav-config'
import { useAuthStore } from '@/stores/useAuthStore'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { ROLE_LABELS } from '@/types/auth.types'

interface SidebarProps {
  className?: string
}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname()
  const user = useAuthStore((s) => s.user)

  const navItems = user ? getNavItemsForRole(user.role) : []
  const bottomItems = user ? getBottomNavItemsForRole(user.role) : []

  return (
    <aside
      className={cn(
        'flex h-full w-60 flex-col bg-dark-nav px-3 py-4',
        className
      )}
    >
      {/* Logo */}
      <div className="mb-5 px-2">
        <h1 className="text-xl font-extrabold tracking-widest text-orange">THAI - RAP</h1>
        <p className="mt-0.5 text-[11px] text-gray-400">ระบบพัฒนาผู้ประกอบการอาหาร</p>
      </div>

      {/* Main nav */}
      <nav aria-label="Main navigation" className="flex flex-1 flex-col gap-0.5">
        {navItems.map(({ labelTh, href, icon: Icon }) => {
          const isActive = href === ROUTES.HOME ? pathname === href : pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-orange text-white'
                  : 'text-gray-300 hover:bg-white/10 hover:text-white'
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {labelTh}
            </Link>
          )
        })}
      </nav>

      {/* Bottom nav (manual, etc.) */}
      {bottomItems.length > 0 && (
        <>
          <Separator className="my-2 bg-white/10" />
          <nav aria-label="Help navigation" className="flex flex-col gap-0.5">
            {bottomItems.map(({ labelTh, href, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-gray-300 transition-colors hover:bg-white/10 hover:text-white"
              >
                <Icon className="h-4 w-4 shrink-0" />
                {labelTh}
              </Link>
            ))}
          </nav>
        </>
      )}

      {/* User info */}
      {user && (
        <>
          <Separator className="my-2 bg-white/10" />
          <div className="flex items-center gap-3 rounded-md px-3 py-2">
            <Avatar className="h-8 w-8 shrink-0">
              <AvatarFallback className="bg-orange text-xs font-bold text-white">
                {user.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold text-white">{user.name}</p>
              <p className="truncate text-[11px] text-gray-400">{ROLE_LABELS[user.role]}</p>
            </div>
          </div>
        </>
      )}
    </aside>
  )
}
