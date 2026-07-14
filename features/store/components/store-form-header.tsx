import { UtensilsCrossed } from 'lucide-react';
import { STORE_EXPLORER_TEXT } from '../constants/store-explorer.constants';
import { CREATE_STORE_FORM_TEXT, EDIT_STORE_FORM_TEXT } from '../constants/store-form.constants';

interface StoreFormHeaderProps {
  mode: 'create' | 'edit';
}

export function StoreFormHeader({ mode }: StoreFormHeaderProps) {
  const title =
    mode === 'create' ? STORE_EXPLORER_TEXT.addStoreLabel : EDIT_STORE_FORM_TEXT.pageTitle;
  const subtitle =
    mode === 'create' ? CREATE_STORE_FORM_TEXT.pageSubtitle : EDIT_STORE_FORM_TEXT.pageSubtitle;

  return (
    <div className="flex items-center gap-4 rounded-xl border bg-gradient-to-br from-orange to-orange-light p-5 text-white shadow-sm">
      <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-xl bg-white/20">
        <UtensilsCrossed className="h-7 w-7" />
      </div>
      <div>
        <h1 className="text-2xl font-extrabold">{title}</h1>
        <p className="text-sm text-white/80">{subtitle}</p>
      </div>
    </div>
  );
}
