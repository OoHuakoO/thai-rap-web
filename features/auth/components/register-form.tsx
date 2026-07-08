'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ROUTES } from '@/constants/routes'
import { ROLE_LABELS } from '@/types/auth.types'
import type { Role } from '@/types/auth.types'
import { registerSchema, REGISTERABLE_ROLES } from '../schemas/register.schema'
import type { RegisterFormValues } from '../schemas/register.schema'
import { useRegister } from '../hooks/use-register'
import { extractErrorMessage } from '@/utils/extract-error-message'

export function RegisterForm() {
  const { mutate: registerUser, isPending, isError, error } = useRegister()

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { role: 'ENTREPRENEUR' },
  })

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="space-y-1 text-center">
        <p className="text-2xl font-bold text-orange">Thai Rap</p>
        <CardTitle className="text-xl">สมัครสมาชิก</CardTitle>
        <CardDescription>กรอกข้อมูลเพื่อสร้างบัญชีใหม่</CardDescription>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={handleSubmit(({ confirmPassword: _confirmPassword, ...payload }) =>
            registerUser(payload)
          )}
          className="space-y-4"
        >
          {isError && (
            <p className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {extractErrorMessage(error)}
            </p>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="name">ชื่อ</Label>
            <Input id="name" placeholder="สมศรี ใจดี" autoComplete="name" {...register('name')} />
            {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="email">อีเมล</Label>
            <Input
              id="email"
              type="email"
              placeholder="example@email.com"
              autoComplete="email"
              {...register('email')}
            />
            {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="role">บทบาท</Label>
            <Select
              value={watch('role')}
              onValueChange={(val) => setValue('role', val as RegisterFormValues['role'])}
            >
              <SelectTrigger id="role">
                <SelectValue placeholder="เลือกบทบาท" />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(ROLE_LABELS) as Role[]).map((role) => (
                  <SelectItem
                    key={role}
                    value={role}
                    disabled={!REGISTERABLE_ROLES.includes(role as (typeof REGISTERABLE_ROLES)[number])}
                  >
                    {ROLE_LABELS[role]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.role && <p className="text-xs text-destructive">{errors.role.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password">รหัสผ่าน</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              autoComplete="new-password"
              {...register('password')}
            />
            {errors.password && (
              <p className="text-xs text-destructive">{errors.password.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="confirmPassword">ยืนยันรหัสผ่าน</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="••••••••"
              autoComplete="new-password"
              {...register('confirmPassword')}
            />
            {errors.confirmPassword && (
              <p className="text-xs text-destructive">{errors.confirmPassword.message}</p>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? 'กำลังสมัครสมาชิก...' : 'สมัครสมาชิก'}
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            มีบัญชีแล้ว?{' '}
            <Link href={ROUTES.LOGIN} className="font-medium text-orange hover:underline">
              เข้าสู่ระบบ
            </Link>
          </p>
        </form>
      </CardContent>
    </Card>
  )
}
