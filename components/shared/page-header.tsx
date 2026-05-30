import Image from 'next/image'
import { cn } from '@/utils/cn'

interface LogoItem {
  src: string
  alt: string
  width?: number
  height?: number
}

interface PageHeaderProps {
  title: string
  subtitle?: string
  period?: string
  institution?: string
  logos?: LogoItem[]
  className?: string
}

export function PageHeader({
  title,
  subtitle,
  period,
  institution,
  logos,
  className,
}: PageHeaderProps) {
  return (
    <div className={cn('w-full space-y-2 border-b bg-white px-6 py-4', className)}>
      {logos && logos.length > 0 && (
        <div className="flex items-center gap-3">
          {logos.map((logo) => (
            <Image
              key={logo.alt}
              src={logo.src}
              alt={logo.alt}
              width={logo.width ?? 40}
              height={logo.height ?? 40}
              className="h-10 w-auto object-contain"
            />
          ))}
        </div>
      )}

      <div className="space-y-0.5 text-center">
        <h1 className="text-lg font-bold text-charcoal">{title}</h1>
        {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
        {period && <p className="text-sm font-medium text-orange">{period}</p>}
        {institution && <p className="text-xs text-muted-foreground">{institution}</p>}
      </div>
    </div>
  )
}
