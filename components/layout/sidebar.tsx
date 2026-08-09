'use client';

import { useState } from 'react';
import type { ReactNode } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/utils/cn';
import { ROUTES } from '@/constants/routes';
import { getNavItemsForRole } from '@/constants/nav-config';
import type { NavIcon as NavIconType } from '@/constants/nav-config';
import { useAuthStore } from '@/stores/auth-store';

interface SidebarProps {
  className?: string;
}

interface NavIconProps {
  icon: NavIconType;
  size: number;
  className: string;
}

function NavIcon({ icon, size, className }: NavIconProps) {
  if (typeof icon === 'string') {
    return <Image src={icon} alt="" width={size} height={size} className={className} aria-hidden />;
  }

  const LucideNavIcon = icon;
  return <LucideNavIcon className={className} />;
}

interface SidebarNavLinkProps {
  href: string;
  collapsed: boolean;
  labelTh: string;
  padding: string;
  linkClassName: string;
  children: ReactNode;
}

function SidebarNavLink({
  href,
  collapsed,
  labelTh,
  padding,
  linkClassName,
  children,
}: SidebarNavLinkProps) {
  return (
    <Link
      href={href}
      // Collapsed hides the text label, so the tooltip is the only way to read it.
      title={collapsed ? labelTh : undefined}
      className={cn(
        'flex items-center gap-2.5 rounded-md transition-colors',
        padding,
        collapsed ? 'justify-center px-0' : 'px-2',
        linkClassName
      )}
    >
      {children}
    </Link>
  );
}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);
  const [collapsed, setCollapsed] = useState(false);

  const navItems = user ? getNavItemsForRole(user.role) : [];

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
        {!collapsed && <p className="text-xl font-extrabold tracking-wider text-white">THAI-RAP</p>}
      </div>

      {/* Main nav */}
      <nav aria-label="Main navigation" className="flex flex-1 flex-col gap-0.5 overflow-y-auto">
        {navItems.map(({ label, labelTh, href, icon }) => {
          const isActive = href === ROUTES.HOME ? pathname === href : pathname.startsWith(href);

          const iconBox = (
            <span
              className={cn(
                'flex h-10 w-10 shrink-0 items-center justify-center rounded-md',
                isActive ? 'bg-white/20' : 'bg-white/10'
              )}
            >
              <NavIcon icon={icon} size={28} className="h-7 w-7" />
            </span>
          );

          const labels = !collapsed && (
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-medium leading-tight">{labelTh}</span>
              <span className="block truncate text-[9px] leading-tight opacity-60">{label}</span>
            </span>
          );

          return (
            <SidebarNavLink
              key={href}
              href={href}
              collapsed={collapsed}
              labelTh={labelTh}
              padding="py-1.5"
              linkClassName={
                isActive
                  ? 'bg-orange text-white'
                  : 'text-gray-300 hover:bg-white/10 hover:text-white'
              }
            >
              {iconBox}
              {labels}
            </SidebarNavLink>
          );
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
        {collapsed ? (
          <ChevronRight className="h-3.5 w-3.5" />
        ) : (
          <ChevronLeft className="h-3.5 w-3.5" />
        )}
        {!collapsed && <span>ย่อแถบเมนู</span>}
      </button>
    </aside>
  );
}
