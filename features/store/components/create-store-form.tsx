'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
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
import { CREATE_STORE_FORM_TEXT, STORE_FORM_TEXT } from '../constants/store-form.constants';
import { STORE_DIALOG_TEXT } from '../constants/store-dialog.constants';
import { storeFormSchema } from '../schemas/store.schema';
import type { StoreFormValues } from '../schemas/store.schema';
import { useCreateStore } from '../hooks/use-stores';
import { storeService } from '../services/store.service';
import { StoreMediaPicker } from './store-media-picker';
import type { Store } from '../types/store.types';

async function uploadSelectedMedia(
  store: Store,
  media: {
    logoFile: File | null;
    storefrontFiles: File[];
    menuFiles: File[];
    documentFiles: File[];
  }
) {
  if (media.logoFile) {
    await storeService.uploadLogo(store.id, media.logoFile).catch((err) => {
      toast.error(CREATE_STORE_FORM_TEXT.logoUploadError(extractErrorMessage(err)));
    });
  }
  for (const file of media.storefrontFiles) {
    await storeService.uploadStorefrontPhoto(store.id, file).catch((err) => {
      toast.error(
        CREATE_STORE_FORM_TEXT.storefrontUploadError(file.name, extractErrorMessage(err))
      );
    });
  }
  for (const file of media.menuFiles) {
    await storeService.uploadPhoto(store.id, file).catch((err) => {
      toast.error(CREATE_STORE_FORM_TEXT.menuUploadError(file.name, extractErrorMessage(err)));
    });
  }
  for (const file of media.documentFiles) {
    await storeService.uploadDocument(store.id, file).catch((err) => {
      toast.error(CREATE_STORE_FORM_TEXT.documentUploadError(file.name, extractErrorMessage(err)));
    });
  }
}

export function CreateStoreForm() {
  const router = useRouter();
  const { mutate: createStore, isPending, isError, error } = useCreateStore();
  const { data: provinces } = useProvinces();
  const alert = useAlert();

  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [storefrontFiles, setStorefrontFiles] = useState<File[]>([]);
  const [menuFiles, setMenuFiles] = useState<File[]>([]);
  const [documentFiles, setDocumentFiles] = useState<File[]>([]);
  const [isUploadingMedia, setIsUploadingMedia] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<StoreFormValues>({
    resolver: zodResolver(storeFormSchema),
    defaultValues: { mainProblems: [], goals: [] },
  });

  const onSubmit = (data: StoreFormValues) => {
    const { facebook, line, instagram, ...rest } = data;
    const socialLinks: Record<string, string> = {};
    if (facebook) socialLinks.facebook = facebook;
    if (line) socialLinks.line = line;
    if (instagram) socialLinks.instagram = instagram;

    createStore(
      {
        ...rest,
        email: data.email || undefined,
        avgRevenueMin: data.avgRevenueMin ? Number(data.avgRevenueMin) : undefined,
        avgRevenueMax: data.avgRevenueMax ? Number(data.avgRevenueMax) : undefined,
        socialLinks: Object.keys(socialLinks).length > 0 ? socialLinks : undefined,
      },
      {
        onSuccess: async (created) => {
          setIsUploadingMedia(true);
          await uploadSelectedMedia(created, {
            logoFile,
            storefrontFiles,
            menuFiles,
            documentFiles,
          });
          setIsUploadingMedia(false);
          await alert({
            title: STORE_DIALOG_TEXT.successTitle,
            description: CREATE_STORE_FORM_TEXT.createSuccess,
          });
          router.push(ROUTES.STORES);
        },
      }
    );
  };

  const isBusy = isPending || isUploadingMedia;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {isError && (
        <p className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {extractErrorMessage(error)}
        </p>
      )}

      <div className="grid grid-cols-1 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="name">{STORE_FORM_TEXT.nameLabel}</Label>
          <Input
            id="name"
            {...register('name')}
            placeholder={CREATE_STORE_FORM_TEXT.namePlaceholder}
          />
          {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="province">{STORE_FORM_TEXT.provinceLabel}</Label>
          <Controller
            name="province"
            control={control}
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger id="province">
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
          <Label htmlFor="storeType">{STORE_FORM_TEXT.storeTypeLabel}</Label>
          <Input
            id="storeType"
            {...register('storeType')}
            placeholder={CREATE_STORE_FORM_TEXT.storeTypePlaceholder}
          />
          {errors.storeType && (
            <p className="text-xs text-destructive">{errors.storeType.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="ownerName">{STORE_FORM_TEXT.ownerNameLabel}</Label>
          <Input
            id="ownerName"
            {...register('ownerName')}
            placeholder={CREATE_STORE_FORM_TEXT.ownerNamePlaceholder}
          />
          {errors.ownerName && (
            <p className="text-xs text-destructive">{errors.ownerName.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="phone">{STORE_FORM_TEXT.phoneLabel}</Label>
          <Input
            id="phone"
            {...register('phone')}
            placeholder={CREATE_STORE_FORM_TEXT.phonePlaceholder}
          />
          {errors.phone && <p className="text-xs text-destructive">{errors.phone.message}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="email">{STORE_FORM_TEXT.emailLabel}</Label>
          <Input
            id="email"
            type="email"
            {...register('email')}
            placeholder={CREATE_STORE_FORM_TEXT.emailPlaceholder}
          />
          {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="avgRevenueMin">{STORE_FORM_TEXT.avgRevenueLabel}</Label>
          <div className="flex items-center gap-2">
            <Input
              id="avgRevenueMin"
              inputMode="numeric"
              {...register('avgRevenueMin')}
              placeholder={CREATE_STORE_FORM_TEXT.avgRevenueMinPlaceholder}
            />
            <span className="text-muted-foreground">
              {STORE_FORM_TEXT.avgRevenueRangeSeparator}
            </span>
            <Input
              id="avgRevenueMax"
              inputMode="numeric"
              {...register('avgRevenueMax')}
              placeholder={CREATE_STORE_FORM_TEXT.avgRevenueMaxPlaceholder}
            />
          </div>
          {(errors.avgRevenueMin || errors.avgRevenueMax) && (
            <p className="text-xs text-destructive">
              {errors.avgRevenueMin?.message ?? errors.avgRevenueMax?.message}
            </p>
          )}
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="address">{STORE_FORM_TEXT.addressLabel}</Label>
        <Textarea
          id="address"
          {...register('address')}
          placeholder={CREATE_STORE_FORM_TEXT.addressPlaceholder}
        />
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

      <StoreMediaPicker
        logoFile={logoFile}
        onLogoChange={setLogoFile}
        storefrontFiles={storefrontFiles}
        onStorefrontFilesChange={setStorefrontFiles}
        menuFiles={menuFiles}
        onMenuFilesChange={setMenuFiles}
        documentFiles={documentFiles}
        onDocumentFilesChange={setDocumentFiles}
      />

      <Button type="submit" disabled={isBusy} className="w-full">
        {isUploadingMedia
          ? CREATE_STORE_FORM_TEXT.uploading
          : isPending
            ? CREATE_STORE_FORM_TEXT.saving
            : CREATE_STORE_FORM_TEXT.submit}
      </Button>
    </form>
  );
}
