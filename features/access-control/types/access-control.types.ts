import type { Permission } from '@/types/auth.types';

/** A labelled block of related permissions — one section of the matrix table. */
export interface PermissionGroup {
  key: string;
  label: string;
  permissions: Permission[];
}

/** Every permission label in one place, so the matrix rows read as Thai copy. */
export type PermissionLabels = Record<Permission, string>;
