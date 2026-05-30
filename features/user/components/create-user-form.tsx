'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useCreateUser } from '../hooks/use-users'

const createUserSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  role: z.enum(['admin', 'assessor', 'mentor', 'entrepreneur', 'judge', 'me_team']),
})

type CreateUserFormValues = z.infer<typeof createUserSchema>

const ROLE_OPTIONS: { value: CreateUserFormValues['role']; label: string }[] = [
  { value: 'entrepreneur', label: 'ผู้ประกอบการ' },
  { value: 'assessor',     label: 'ผู้ประเมิน (Assessor)' },
  { value: 'mentor',       label: 'ที่ปรึกษา (Mentor / Coach)' },
  { value: 'judge',        label: 'กรรมการ Pitching' },
  { value: 'me_team',      label: 'ทีม M&E' },
  { value: 'admin',        label: 'ผู้ดูแลระบบ (Admin / PMO)' },
]

export function CreateUserForm() {
  const { mutate: createUser, isPending, isError, error } = useCreateUser()

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CreateUserFormValues>({
    resolver: zodResolver(createUserSchema),
    defaultValues: { role: 'entrepreneur' },
  })

  const onSubmit = (data: CreateUserFormValues) => {
    createUser(data, { onSuccess: () => reset() })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {isError && (
        <p className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {error instanceof Error ? error.message : 'เกิดข้อผิดพลาด'}
        </p>
      )}

      <div className="space-y-1.5">
        <Label htmlFor="name">ชื่อ</Label>
        <Input id="name" {...register('name')} placeholder="John Doe" />
        {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="email">อีเมล</Label>
        <Input id="email" {...register('email')} type="email" placeholder="john@example.com" />
        {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="role">บทบาท</Label>
        <Select
          value={watch('role')}
          onValueChange={(val) => setValue('role', val as CreateUserFormValues['role'])}
        >
          <SelectTrigger id="role">
            <SelectValue placeholder="เลือกบทบาท" />
          </SelectTrigger>
          <SelectContent>
            {ROLE_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.role && <p className="text-sm text-destructive">{errors.role.message}</p>}
      </div>

      <Button type="submit" disabled={isPending} className="w-full">
        {isPending ? 'กำลังสร้าง...' : 'สร้างผู้ใช้งาน'}
      </Button>
    </form>
  )
}
