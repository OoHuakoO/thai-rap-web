import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/utils/cn';

const FOOTER_LINK_CLASS =
  'inline-flex items-center gap-1.5 text-xs font-medium text-orange transition-colors hover:text-orange-light';

interface CardFooterLinkProps {
  href: string;
  label: string;
  className?: string;
}

export function CardFooterLink({ href, label, className }: CardFooterLinkProps) {
  return (
    <Link href={href} className={cn(FOOTER_LINK_CLASS, className)}>
      {label}
      <ArrowRight className="h-3.5 w-3.5" />
    </Link>
  );
}

interface CardFooterButtonProps {
  label: string;
  onClick: () => void;
  className?: string;
}

// Same affordance as CardFooterLink for footers that open a dialog instead of
// navigating — a link with no destination would break middle-click and Cmd+click.
export function CardFooterButton({ label, onClick, className }: CardFooterButtonProps) {
  return (
    <button type="button" onClick={onClick} className={cn(FOOTER_LINK_CLASS, className)}>
      {label}
      <ArrowRight className="h-3.5 w-3.5" />
    </button>
  );
}
