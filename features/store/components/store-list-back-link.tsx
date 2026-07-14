import { BackLink } from '@/components/shared/back-link';
import { ROUTES } from '@/constants/routes';
import { STORE_EXPLORER_TEXT } from '../constants/store-explorer.constants';

export function StoreListBackLink() {
  return <BackLink href={ROUTES.STORES}>{STORE_EXPLORER_TEXT.backToListLabel}</BackLink>;
}
