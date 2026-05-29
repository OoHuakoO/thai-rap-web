import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/utils/cn';
import { TrendingDown, TrendingUp } from 'lucide-react';
import type { StatCardData } from '@/types';

interface StatCardProps extends StatCardData {
  className?: string;
}

export function StatCard({ title, value, description, icon, trend, className }: StatCardProps) {
  const isPositive = (trend?.value ?? 0) >= 0;

  return (
    <Card className={cn(className)}>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-3xl font-bold">{value}</p>
            {description && (
              <p className="text-xs text-muted-foreground">{description}</p>
            )}
          </div>
          {icon && (
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
              {icon}
            </div>
          )}
        </div>

        {trend && (
          <div
            className={cn(
              'mt-3 flex items-center gap-1 text-xs font-medium',
              isPositive ? 'text-emerald-600' : 'text-red-500'
            )}
          >
            {isPositive ? (
              <TrendingUp className="h-3 w-3" />
            ) : (
              <TrendingDown className="h-3 w-3" />
            )}
            <span>
              {isPositive ? '+' : ''}
              {trend.value}% {trend.label}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
