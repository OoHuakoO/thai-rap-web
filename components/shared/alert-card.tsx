import { AlertTriangle, Info, CheckCircle, XCircle } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { cn } from '@/utils/cn'

type AlertVariant = 'info' | 'warning' | 'success' | 'error'

interface AlertCardProps {
  variant?: AlertVariant
  title?: string
  message: string
  className?: string
}

const variantConfig: Record<AlertVariant, { icon: React.ElementType; className: string; iconClass: string }> = {
  info:    { icon: Info,          className: 'border-blue-200 bg-blue-50 [&>svg]:text-blue-500',                  iconClass: 'text-blue-500' },
  warning: { icon: AlertTriangle, className: 'border-amber-200 bg-amber-50 [&>svg]:text-amber-500',               iconClass: 'text-amber-500' },
  success: { icon: CheckCircle,   className: 'border-score-green/20 bg-score-green/10 [&>svg]:text-score-green',  iconClass: 'text-score-green' },
  error:   { icon: XCircle,       className: 'border-score-red/20 bg-score-red/10 [&>svg]:text-score-red',        iconClass: 'text-score-red' },
}

export function AlertCard({ variant = 'info', title, message, className }: AlertCardProps) {
  const { icon: Icon, className: variantClass, iconClass } = variantConfig[variant]

  return (
    <Alert className={cn(variantClass, className)}>
      <Icon className={cn('h-4 w-4', iconClass)} />
      {title && <AlertTitle className="text-charcoal">{title}</AlertTitle>}
      <AlertDescription className="text-muted-foreground">{message}</AlertDescription>
    </Alert>
  )
}
