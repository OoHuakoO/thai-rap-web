'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ROUTES } from '@/constants/routes';
import { useAuthStore } from '@/stores/auth-store';
import { PERMISSIONS } from '@/types/auth.types';
import { REPORT_TEXT } from '../constants/report.constants';
import { OverviewReportPanel } from './overview-report-panel';

interface StoreReportSectionProps {
  storeId: string;
}

/** The all-rounds report inline on a store's detail page. */
export function StoreReportSection({ storeId }: StoreReportSectionProps) {
  const can = useAuthStore((state) => state.can);
  if (!can(PERMISSIONS.REPORTS_READ)) return null;

  return (
    <Card className="shadow-sm">
      <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-2">
        <CardTitle className="text-base">{REPORT_TEXT.pageTitle}</CardTitle>
        <Link
          href={ROUTES.REPORTS}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-orange transition-colors hover:text-orange-light"
        >
          {REPORT_TEXT.pageTitle}
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </CardHeader>
      <CardContent>
        <OverviewReportPanel storeId={storeId} />
      </CardContent>
    </Card>
  );
}
