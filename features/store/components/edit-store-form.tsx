'use client';

import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { TagInput } from '@/components/shared/tag-input';
import { useAlert } from '@/components/shared/confirm-dialog';
import { ROUTES } from '@/constants/routes';
import { extractErrorMessage } from '@/utils/extract-error-message';
import { useProvinces } from '@/features/province';
import { EDIT_STORE_FORM_TEXT, STORE_FORM_TEXT } from '../constants/store-form.constants';
import { STORE_DIALOG_TEXT } from '../constants/store-dialog.constants';
import { storeFormSchema } from '../schemas/store.schema';
import type { StoreFormValues } from '../schemas/store.schema';
import { useUpdateStore } from '../hooks/use-stores';
import type { Store } from '../types/store.types';

interface EditStoreFormProps {
  store: Store;
  onSuccess?: () => void;
}

export function EditStoreForm({ store, onSuccess }: EditStoreFormProps) {
  const router = useRouter();
  const { mutate: updateStore, isPending, isError, error } = useUpdateStore(store.id);
  const { data: provinces } = useProvinces();
  const alert = useAlert();

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<StoreFormValues>({
    resolver: zodResolver(storeFormSchema),
    defaultValues: {
      name: store.name,
      province: store.province,
      storeType: store.storeType,
      ownerName: store.ownerName,
      phone: store.phone,
      address: store.address,
      email: store.email ?? '',
      avgRevenueMin: store.avgRevenueMin !== null ? String(store.avgRevenueMin) : '',
      avgRevenueMax: store.avgRevenueMax !== null ? String(store.avgRevenueMax) : '',
      mainProblems: store.mainProblems,
      goals: store.goals,
      facebook: store.socialLinks.facebook ?? '',
      line: store.socialLinks.line ?? '',
      instagram: store.socialLinks.instagram ?? '',
    },
  });

  const onSubmit = (data: StoreFormValues) => {
    const { facebook, line, instagram, ...rest } = data;
    const socialLinks: Record<string, string> = {};
    if (facebook) socialLinks.facebook = facebook;
    if (line) socialLinks.line = line;
    if (instagram) socialLinks.instagram = instagram;

    updateStore(
      {
        ...rest,
        email: data.email || undefined,
        avgRevenueMin: data.avgRevenueMin ? Number(data.avgRevenueMin) : undefined,
        avgRevenueMax: data.avgRevenueMax ? Number(data.avgRevenueMax) : undefined,
        socialLinks,
      },
      {
        onSuccess: async () => {
          await alert({
            title: STORE_DIALOG_TEXT.successTitle,
            description: EDIT_STORE_FORM_TEXT.updateSuccess,
          });
          onSuccess?.();
          router.push(ROUTES.STORES);
        },
      }
    );
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {isError && (
        <p className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {extractErrorMessage(error)}
        </p>
      )}

      <div className="grid grid-cols-1 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="edit-name">{STORE_FORM_TEXT.nameLabel}</Label>
          <Input id="edit-name" {...register('name')} />
          {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="edit-province">{STORE_FORM_TEXT.provinceLabel}</Label>
          <Controller
            name="province"
            control={control}
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger id="edit-province">
                  <SelectValue placeholder={STORE_FORM_TEXT.provincePlaceholder} />
                </SelectTrigger>
                <SelectContent>
                  {(provinces ?? []).map((p) => (
                    <SelectItem key={p.id} value={p.nameTh}>
                      {p.nameTh}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.province && <p className="text-xs text-destructive">{errors.province.message}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="edit-storeType">{STORE_FORM_TEXT.storeTypeLabel}</Label>
          <Input id="edit-storeType" {...register('storeType')} />
          {errors.storeType && (
            <p className="text-xs text-destructive">{errors.storeType.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="edit-ownerName">{STORE_FORM_TEXT.ownerNameLabel}</Label>
          <Input id="edit-ownerName" {...register('ownerName')} />
          {errors.ownerName && (
            <p className="text-xs text-destructive">{errors.ownerName.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="edit-phone">{STORE_FORM_TEXT.phoneLabel}</Label>
          <Input id="edit-phone" {...register('phone')} />
          {errors.phone && <p className="text-xs text-destructive">{errors.phone.message}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="edit-email">{STORE_FORM_TEXT.emailLabel}</Label>
          <Input id="edit-email" type="email" {...register('email')} />
          {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="edit-avgRevenueMin">{STORE_FORM_TEXT.avgRevenueLabel}</Label>
          <div className="flex items-center gap-2">
            <Input id="edit-avgRevenueMin" inputMode="numeric" {...register('avgRevenueMin')} />
            <span className="text-muted-foreground">
              {STORE_FORM_TEXT.avgRevenueRangeSeparator}
            </span>
            <Input id="edit-avgRevenueMax" inputMode="numeric" {...register('avgRevenueMax')} />
          </div>
          {(errors.avgRevenueMin || errors.avgRevenueMax) && (
            <p className="text-xs text-destructive">
              {errors.avgRevenueMin?.message ?? errors.avgRevenueMax?.message}
            </p>
          )}
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="edit-address">{STORE_FORM_TEXT.addressLabel}</Label>
        <Textarea id="edit-address" {...register('address')} />
        {errors.address && <p className="text-xs text-destructive">{errors.address.message}</p>}
      </div>

      <div className="space-y-1.5">
        <Label>{STORE_FORM_TEXT.mainProblemsLabel}</Label>
        <Controller
          name="mainProblems"
          control={control}
          render={({ field }) => (
            <TagInput
              value={field.value}
              onChange={field.onChange}
              placeholder={STORE_FORM_TEXT.tagInputPlaceholder}
            />
          )}
        />
      </div>

      <div className="space-y-1.5">
        <Label>{STORE_FORM_TEXT.goalsLabel}</Label>
        <Controller
          name="goals"
          control={control}
          render={({ field }) => (
            <TagInput
              value={field.value}
              onChange={field.onChange}
              placeholder={STORE_FORM_TEXT.tagInputPlaceholder}
            />
          )}
        />
      </div>

      <div className="space-y-2">
        <Label>{STORE_FORM_TEXT.socialLabel}</Label>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          <Input {...register('facebook')} placeholder={STORE_FORM_TEXT.facebookPlaceholder} />
          <Input {...register('line')} placeholder={STORE_FORM_TEXT.linePlaceholder} />
          <Input {...register('instagram')} placeholder={STORE_FORM_TEXT.instagramPlaceholder} />
        </div>
      </div>

      <Button type="submit" disabled={isPending} className="w-full">
        {isPending ? EDIT_STORE_FORM_TEXT.saving : EDIT_STORE_FORM_TEXT.submit}
      </Button>
    </form>
  );
}
