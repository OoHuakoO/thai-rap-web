'use client';

import { Loading } from '@/components/shared/loading';
import { extractErrorMessage } from '@/utils/extract-error-message';
import { STORE_DETAIL_TEXT } from '../constants/store-detail.constants';
import { useStore } from '../hooks/use-stores';
import { EditStoreForm } from './edit-store-form';

interface StoreEditPageProps {
  storeId: string;
}

export function StoreEditPage({ storeId }: StoreEditPageProps) {
  const { data: store, isLoading, isError, error } = useStore(storeId);

  if (isLoading) return <Loading className="py-16" />;

  if (isError) {
    return <p className="py-8 text-center text-destructive">{extractErrorMessage(error)}</p>;
  }

  if (!store) {
    return <p className="py-8 text-center text-muted-foreground">{STORE_DETAIL_TEXT.notFound}</p>;
  }

  return <EditStoreForm store={store} />;
}
