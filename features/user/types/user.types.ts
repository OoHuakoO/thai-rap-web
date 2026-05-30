import type { Role } from '@/types/auth.types'

export interface User {
  id: string
  name: string
  email: string
  role: Role
  createdAt: string
  updatedAt: string
}

export interface CreateUserDto {
  name: string
  email: string
  role: Role
}

export type UpdateUserDto = Partial<CreateUserDto>
