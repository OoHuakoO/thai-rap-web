'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { extractErrorMessage } from '@/utils/extract-error-message'
import { useCreateStore } from '../hooks/use-stores'

const createStoreSchema = z.object({
  name: z.string().min(1, 'กรุณากรอกชื่อร้าน'),
  province: z.string().min(1, 'กรุณากรอกจังหวัด'),
  storeType: z.string().min(1, 'กรุณากรอกประเภทร้าน'),
  ownerName: z.string().min(1, 'กรุณากรอกชื่อเจ้าของร้าน'),
  phone: z.string().min(1, 'กรุณากรอกเบอร์โทร'),
  address: z.string().min(1, 'กรุณากรอกที่อยู่'),
  email: z.string().email('อีเมลไม่ถูกต้อง').optional().or(z.literal('')),
  mainProblems: z.string().optional(),
  goals: z.string().optional(),
})

type CreateStoreFormValues = z.infer<typeof createStoreSchema>

interface CreateStoreFormProps {
  onSuccess?: () => void
}

export function CreateStoreForm({ onSuccess }: CreateStoreFormProps) {
  const { mutate: createStore, isPending, isError, error } = useCreateStore()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateStoreFormValues>({
    resolver: zodResolver(createStoreSchema),
  })

  const onSubmit = (data: CreateStoreFormValues) => {
    createStore(
      { ...data, email: data.email || undefined },
      {
        onSuccess: () => {
          reset()
          onSuccess?.()
        },
      }
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {isError && (
        <p className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {extractErrorMessage(error)}
        </p>
      )}

      <div className="grid grid-cols-1 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="name">ชื่อร้าน</Label>
          <Input id="name" {...register('name')} placeholder="ร้านส้มตำป้าแดง" />
          {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="province">จังหวัด</Label>
          <Input id="province" {...register('province')} placeholder="ชลบุรี" />
          {errors.province && (
            <p className="text-xs text-destructive">{errors.province.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="storeType">ประเภทร้าน</Label>
          <Input id="storeType" {...register('storeType')} placeholder="อาหารตามสั่ง" />
          {errors.storeType && (
            <p className="text-xs text-destructive">{errors.storeType.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="ownerName">เจ้าของร้าน</Label>
          <Input id="ownerName" {...register('ownerName')} placeholder="สมศรี ใจดี" />
          {errors.ownerName && (
            <p className="text-xs text-destructive">{errors.ownerName.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="phone">เบอร์โทร</Label>
          <Input id="phone" {...register('phone')} placeholder="0812345678" />
          {errors.phone && <p className="text-xs text-destructive">{errors.phone.message}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="email">อีเมล (ไม่บังคับ)</Label>
          <Input id="email" type="email" {...register('email')} placeholder="somsri@example.com" />
          {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="address">ที่อยู่</Label>
        <Textarea id="address" {...register('address')} placeholder="123 หมู่ 4 ต.บางพระ อ.ศรีราชา" />
        {errors.address && <p className="text-xs text-destructive">{errors.address.message}</p>}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="mainProblems">ปัญหาหลักของร้าน (ไม่บังคับ)</Label>
        <Textarea id="mainProblems" {...register('mainProblems')} />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="goals">เป้าหมายการพัฒนา (ไม่บังคับ)</Label>
        <Textarea id="goals" {...register('goals')} />
      </div>

      <Button type="submit" disabled={isPending} className="w-full">
        {isPending ? 'กำลังบันทึก...' : 'เพิ่มร้าน'}
      </Button>
    </form>
  )
}
