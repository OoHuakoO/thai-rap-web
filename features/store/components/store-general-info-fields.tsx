import { Controller } from 'react-hook-form';
import type { Control, FieldErrors, UseFormRegister } from 'react-hook-form';
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
import { FieldError } from '@/components/shared/field-error';
import type { Province } from '@/features/province';
import { STORE_FORM_TEXT } from '../constants/store-form.constants';
import type { StoreFormValues } from '../schemas/store.schema';

interface StoreGeneralInfoFieldsPlaceholders {
  name?: string;
  storeType?: string;
  ownerName?: string;
  phone?: string;
  email?: string;
  avgRevenueMin?: string;
  avgRevenueMax?: string;
  address?: string;
}

interface StoreGeneralInfoFieldsProps {
  register: UseFormRegister<StoreFormValues>;
  control: Control<StoreFormValues>;
  errors: FieldErrors<StoreFormValues>;
  provinces: Province[] | undefined;
  idPrefix?: string;
  placeholders?: StoreGeneralInfoFieldsPlaceholders;
}

export function StoreGeneralInfoFields({
  register,
  control,
  errors,
  provinces,
  idPrefix = '',
  placeholders,
}: StoreGeneralInfoFieldsProps) {
  return (
    <>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor={`${idPrefix}province`}>{STORE_FORM_TEXT.provinceLabel}</Label>
          <Controller
            name="province"
            control={control}
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger id={`${idPrefix}province`}>
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
          <FieldError message={errors.province?.message} />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor={`${idPrefix}storeType`}>{STORE_FORM_TEXT.storeTypeLabel}</Label>
          <Input
            id={`${idPrefix}storeType`}
            {...register('storeType')}
            placeholder={placeholders?.storeType}
          />
          <FieldError message={errors.storeType?.message} />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor={`${idPrefix}ownerName`}>{STORE_FORM_TEXT.ownerNameLabel}</Label>
          <Input
            id={`${idPrefix}ownerName`}
            {...register('ownerName')}
            placeholder={placeholders?.ownerName}
          />
          <FieldError message={errors.ownerName?.message} />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor={`${idPrefix}phone`}>{STORE_FORM_TEXT.phoneLabel}</Label>
          <Input
            id={`${idPrefix}phone`}
            {...register('phone')}
            placeholder={placeholders?.phone}
          />
          <FieldError message={errors.phone?.message} />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor={`${idPrefix}email`}>{STORE_FORM_TEXT.emailLabel}</Label>
          <Input
            id={`${idPrefix}email`}
            type="email"
            {...register('email')}
            placeholder={placeholders?.email}
          />
          <FieldError message={errors.email?.message} />
        </div>

        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor={`${idPrefix}avgRevenueMin`}>{STORE_FORM_TEXT.avgRevenueLabel}</Label>
          <div className="flex items-center gap-2">
            <Input
              id={`${idPrefix}avgRevenueMin`}
              inputMode="numeric"
              {...register('avgRevenueMin')}
              placeholder={placeholders?.avgRevenueMin}
            />
            <span className="text-muted-foreground">
              {STORE_FORM_TEXT.avgRevenueRangeSeparator}
            </span>
            <Input
              id={`${idPrefix}avgRevenueMax`}
              inputMode="numeric"
              {...register('avgRevenueMax')}
              placeholder={placeholders?.avgRevenueMax}
            />
          </div>
          <FieldError message={errors.avgRevenueMin?.message ?? errors.avgRevenueMax?.message} />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor={`${idPrefix}address`}>{STORE_FORM_TEXT.addressLabel}</Label>
        <Textarea
          id={`${idPrefix}address`}
          {...register('address')}
          placeholder={placeholders?.address}
        />
        <FieldError message={errors.address?.message} />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
      </div>

      <div className="space-y-2">
        <Label>{STORE_FORM_TEXT.socialLabel}</Label>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          <Input {...register('facebook')} placeholder={STORE_FORM_TEXT.facebookPlaceholder} />
          <Input {...register('line')} placeholder={STORE_FORM_TEXT.linePlaceholder} />
          <Input {...register('instagram')} placeholder={STORE_FORM_TEXT.instagramPlaceholder} />
        </div>
      </div>
    </>
  );
}
