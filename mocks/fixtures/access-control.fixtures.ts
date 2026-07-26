import { DEFAULT_ACCESS_CONTROL } from '@/constants/permissions';
import type { AccessControlConfig, UpdateAccessControlDto } from '@/types/auth.types';

function buildDefault(): AccessControlConfig {
  return {
    // Deep-copied so a mutation through the handler can never write back into
    // the DEFAULT_ACCESS_CONTROL tables the whole app reads as fallback.
    rolePermissions: structuredClone(DEFAULT_ACCESS_CONTROL.rolePermissions),
    roleScopes: structuredClone(DEFAULT_ACCESS_CONTROL.roleScopes),
    publicStoreFields: [...DEFAULT_ACCESS_CONTROL.publicStoreFields],
    updatedAt: '2024-05-22T14:40:00Z',
    updatedBy: 'นางสาวศิริวรรณ จันทร์ดี',
  };
}

let config: AccessControlConfig = buildDefault();

export const accessControlDb = {
  reset: () => {
    config = buildDefault();
    return config;
  },

  get: (): AccessControlConfig => config,

  update: (data: UpdateAccessControlDto, updatedBy: string | null): AccessControlConfig => {
    config = {
      rolePermissions: structuredClone(data.rolePermissions),
      roleScopes: structuredClone(data.roleScopes),
      publicStoreFields: [...data.publicStoreFields],
      updatedAt: new Date().toISOString(),
      updatedBy,
    };
    return config;
  },
};
