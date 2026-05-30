'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/utils/cn';
import { ROUTES } from '@/constants/routes';
import { LayoutDashboard, Users, BarChart3, Settings } from 'lucide-react';

const navItems = [
  { label: 'Dashboard', href: ROUTES.HOME, icon: LayoutDashboard },
  { label: 'Users', href: ROUTES.USERS, icon: Users },
  { label: 'Analytics', href: ROUTES.ANALYTICS, icon: BarChart3 },
  { label: 'Settings', href: ROUTES.SETTINGS, icon: Settings },
];

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        'flex h-full w-60 flex-col border-r bg-card px-3 py-4',
        className
      )}
    >
      <div className="mb-6 px-2">
        <h1 className="text-xl font-bold tracking-tight text-orange">Thai Rap</h1>
      </div>

      <nav aria-label="Main navigation" className="flex flex-col gap-1">
        {navItems.map(({ label, href, icon: Icon }) => {
          const isActive = href === ROUTES.HOME ? pathname === href : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
