'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'

interface ErrorAction {
  label: string
  onClick?: () => void
  href?: string
  variant?: 'default' | 'outline' | 'ghost'
}

interface ErrorPageProps {
  code: number
  title: string
  message: string
  actions?: ErrorAction[]
}

export function ErrorPage({ code, title, message, actions }: ErrorPageProps) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-6 text-center">
      <p className="select-none text-8xl font-extrabold text-orange opacity-20">{code}</p>
      <h1 className="mt-2 text-2xl font-bold text-charcoal">{title}</h1>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">{message}</p>

      {actions && actions.length > 0 && (
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          {actions.map((action) =>
            action.href ? (
              <Button key={action.label} variant={action.variant ?? 'default'} asChild>
                <Link href={action.href}>{action.label}</Link>
              </Button>
            ) : (
              <Button
                key={action.label}
                variant={action.variant ?? 'default'}
                onClick={action.onClick}
              >
                {action.label}
              </Button>
            )
          )}
        </div>
      )}
    </div>
  )
}
