'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loading } from '@/components/shared/loading';
import { useStore } from '@/features/store';
import { ROUND_PICKER_TEXT } from '../constants/assessment-text.constants';
import { RoundPills } from './round-pills';

interface RoundPickerProps {
  storeId: string;
}

export function RoundPicker({ storeId }: RoundPickerProps) {
  const { data: store, isLoading } = useStore(storeId);

  if (isLoading) return <Loading className="py-16" />;

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {ROUND_PICKER_TEXT.title}
          {store ? `: ${store.name}` : ''}
        </CardTitle>
        <p className="text-sm text-muted-foreground">{ROUND_PICKER_TEXT.subtitle}</p>
      </CardHeader>
      <CardContent>
        <RoundPills storeId={storeId} />
      </CardContent>
    </Card>
  );
}
