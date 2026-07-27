import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useForm } from 'react-hook-form';
import { describe, expect, it } from 'vitest';
import type { Province } from '@/features/province';
import type { StoreType } from '@/features/store-type';
import type { StoreFormValues } from '../schemas/store.schema';
import { StoreGeneralInfoFields } from './store-general-info-fields';

const provinces: Province[] = [{ id: 1, nameTh: 'จันทบุรี' }];
const storeTypes: StoreType[] = [
  { id: 1, nameTh: 'อาหารไทย' },
  { id: 2, nameTh: 'คาเฟ่' },
];

function Harness() {
  const {
    register,
    control,
    formState: { errors },
  } = useForm<StoreFormValues>({ defaultValues: { mainProblems: [], goals: [] } });

  return (
    <StoreGeneralInfoFields
      register={register}
      control={control}
      errors={errors}
      provinces={provinces}
      storeTypes={storeTypes}
    />
  );
}

describe('StoreGeneralInfoFields', () => {
  it('offers the seeded store types as a dropdown instead of free text', async () => {
    render(<Harness />);

    await userEvent.click(screen.getByRole('combobox', { name: 'ประเภทร้าน' }));

    expect(screen.getByRole('option', { name: 'อาหารไทย' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'คาเฟ่' })).toBeInTheDocument();
  });

  it('selects a store type', async () => {
    render(<Harness />);

    const trigger = screen.getByRole('combobox', { name: 'ประเภทร้าน' });
    await userEvent.click(trigger);
    await userEvent.click(screen.getByRole('option', { name: 'คาเฟ่' }));

    expect(trigger).toHaveTextContent('คาเฟ่');
  });
});
