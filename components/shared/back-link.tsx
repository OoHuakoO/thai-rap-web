import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { cn } from '@/utils/cn';
import type { ReactNode } from 'react';

interface BackLinkProps {
  href: string;
  children: ReactNode;
  className?: string;
}

export function BackLink({ href, children, className }: BackLinkProps) {
  return (
    <Link
      href={href}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-lg border bg-card px-3 py-1.5 text-sm font-semibold text-charcoal shadow-sm transition-colors hover:border-orange hover:bg-orange/5 hover:text-orange',
        className
      )}
    >
      <ChevronLeft className="h-4 w-4" />
      {children}
    </Link>
  );
}
