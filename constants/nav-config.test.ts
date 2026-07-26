import { beforeEach, describe, expect, it } from 'vitest';
import { useAccessControlStore } from '@/stores/access-control-store';
import type { AccessControlConfig, Permission, Role } from '@/types/auth.types';
import { ROLES } from '@/types/auth.types';
import { getDefaultRouteForRole, resolvePostLoginRoute } from './nav-config';
import { DEFAULT_ACCESS_CONTROL } from './permissions';
import { ROUTES } from './routes';

function saveConfig(rolePermissions: Partial<Record<Role, Permission[]>>) {
  const config: AccessControlConfig = {
    rolePermissions: {
      ...structuredClone(DEFAULT_ACCESS_CONTROL.rolePermissions),
      ...rolePermissions,
    },
    roleScopes: structuredClone(DEFAULT_ACCESS_CONTROL.roleScopes),
    publicStoreFields: [...DEFAULT_ACCESS_CONTROL.publicStoreFields],
    updatedAt: '2024-05-22T14:40:00Z',
    updatedBy: null,
  };
  useAccessControlStore.getState().setConfig(config);
}

describe('nav-config', () => {
  beforeEach(() => {
    useAccessControlStore.getState().reset();
  });

  describe('getDefaultRouteForRole', () => {
    it('returns the first nav destination the role can actually open', () => {
      expect(getDefaultRouteForRole(ROLES.ENTREPRENEUR)).toBe(ROUTES.STORES);
      expect(getDefaultRouteForRole(ROLES.VIEWER)).toBe(ROUTES.NEWS);
    });

    it('skips a nav item whose permission the saved matrix revoked', () => {
      // Nav still lists Restaurant Profiles for ENTREPRENEUR, but without
      // store:read the route guard rejects it — returning it here would make
      // the dashboard layout redirect to a route it immediately bounces again.
      saveConfig({ ENTREPRENEUR: ['news:read', 'analytics:read', 'reports:read'] });
      expect(getDefaultRouteForRole(ROLES.ENTREPRENEUR)).toBe(ROUTES.ANALYTICS);
    });

    it('falls back to 403 when the role can open nothing', () => {
      // HOME is permission-gated too, so it is not a safe fallback here.
      saveConfig({ VIEWER: [] });
      expect(getDefaultRouteForRole(ROLES.VIEWER)).toBe(ROUTES.ERROR_403);
    });
  });

  describe('resolvePostLoginRoute', () => {
    it('returns the requested path when the role may open it', () => {
      expect(resolvePostLoginRoute(ROLES.ENTREPRENEUR, ROUTES.REPORTS)).toBe(ROUTES.REPORTS);
    });

    it('ignores a path the role may not open', () => {
      expect(resolvePostLoginRoute(ROLES.ENTREPRENEUR, ROUTES.USERS)).toBe(ROUTES.STORES);
    });

    it('ignores an off-site path', () => {
      expect(resolvePostLoginRoute(ROLES.ENTREPRENEUR, '//evil.example.com')).toBe(ROUTES.STORES);
      expect(resolvePostLoginRoute(ROLES.ENTREPRENEUR, 'https://evil.example.com')).toBe(
        ROUTES.STORES
      );
    });

    it('falls back to the default route when no path is given', () => {
      expect(resolvePostLoginRoute(ROLES.ENTREPRENEUR, null)).toBe(ROUTES.STORES);
      expect(resolvePostLoginRoute(ROLES.ENTREPRENEUR)).toBe(ROUTES.STORES);
    });
  });
});
