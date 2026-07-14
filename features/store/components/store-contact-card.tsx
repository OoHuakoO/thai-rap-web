import { Card } from '@/components/ui/card';
import { FacebookIcon, LineIcon, InstagramIcon } from '@/components/shared/brand-icons';
import { STORE_DETAIL_TEXT } from '../constants/store-detail.constants';
import type { Store } from '../types/store.types';

interface StoreContactCardProps {
  store: Store;
}

export function StoreContactCard({ store }: StoreContactCardProps) {
  const hasSocialLinks =
    store.socialLinks.facebook || store.socialLinks.line || store.socialLinks.instagram;

  return (
    <Card className="mt-2 space-y-2 p-2.5 shadow-none">
      <p className="text-sm font-bold text-charcoal">{STORE_DETAIL_TEXT.contactInfoTitle}</p>
      <div className="grid grid-cols-[auto_1fr] gap-x-2.5 gap-y-1 text-[13px]">
        <span className="text-muted-foreground">{STORE_DETAIL_TEXT.ownerNameLabel}</span>
        <span className="font-medium text-charcoal">{store.ownerName}</span>
        <span className="text-muted-foreground">{STORE_DETAIL_TEXT.phoneLabel}</span>
        <span className="font-medium text-charcoal">{store.phone}</span>
        <span className="text-muted-foreground">{STORE_DETAIL_TEXT.emailLabel}</span>
        <span className="break-all font-medium text-charcoal">
          {store.email || STORE_DETAIL_TEXT.emailEmpty}
        </span>
        <span className="text-muted-foreground">{STORE_DETAIL_TEXT.addressLabel}</span>
        <span className="font-medium leading-relaxed text-charcoal">{store.address}</span>
      </div>

      <div>
        <span className="text-[13px] text-muted-foreground">
          {STORE_DETAIL_TEXT.onlineChannelsLabel}
        </span>
        {hasSocialLinks ? (
          <div className="mt-1 flex items-center gap-1.5">
            {store.socialLinks.facebook && (
              <a
                href={store.socialLinks.facebook}
                target="_blank"
                rel="noopener noreferrer"
                title={STORE_DETAIL_TEXT.facebookTitle}
              >
                <FacebookIcon className="h-7 w-7" />
              </a>
            )}
            {store.socialLinks.line && (
              <a
                href={store.socialLinks.line}
                target="_blank"
                rel="noopener noreferrer"
                title={STORE_DETAIL_TEXT.lineTitle}
              >
                <LineIcon className="h-7 w-7" />
              </a>
            )}
            {store.socialLinks.instagram && (
              <a
                href={store.socialLinks.instagram}
                target="_blank"
                rel="noopener noreferrer"
                title={STORE_DETAIL_TEXT.instagramTitle}
              >
                <InstagramIcon className="h-7 w-7" />
              </a>
            )}
          </div>
        ) : (
          <p className="mt-1 text-[13px] text-muted-foreground">
            {STORE_DETAIL_TEXT.onlineChannelsEmpty}
          </p>
        )}
      </div>

      <div className="grid grid-cols-[auto_1fr] gap-x-2.5 text-[13px]">
        <span className="text-muted-foreground">{STORE_DETAIL_TEXT.avgRevenueLabel}</span>
        {store.avgRevenueMin !== null && store.avgRevenueMax !== null ? (
          <span className="font-medium text-orange">
            {store.avgRevenueMin.toLocaleString()} {STORE_DETAIL_TEXT.avgRevenueRangeSeparator}{' '}
            {store.avgRevenueMax.toLocaleString()} {STORE_DETAIL_TEXT.currencyUnit}
          </span>
        ) : (
          <span className="text-muted-foreground">{STORE_DETAIL_TEXT.avgRevenueEmpty}</span>
        )}
      </div>
    </Card>
  );
}
