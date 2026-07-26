import { beforeEach, describe, expect, it } from 'vitest';
import { useAccessControlStore } from '@/stores/access-control-store';
import type { AccessControlConfig } from '@/types/auth.types';
import { DATA_SCOPES, PERMISSIONS, ROLES, STORE_FIELDS } from '@/types/auth.types';
import {
  DEFAULT_ACCESS_CONTROL,
  ROLE_PERMISSIONS,
  canAccessRoute,
  canViewStoreField,
  getDataScope,
  hasPermission,
} from './permissions';
import { ROUTES } from './routes';

function saveConfig(overrides: Partial<AccessControlConfig>) {
  useAccessControlStore.getState().setConfig({
    rolePermissions: structuredClone(DEFAULT_ACCESS_CONTROL.rolePermissions),
    roleScopes: structuredClone(DEFAULT_ACCESS_CONTROL.roleScopes),
    publicStoreFields: [...DEFAULT_ACCESS_CONTROL.publicStoreFields],
    updatedAt: '2024-05-22T14:40:00Z',
    updatedBy: null,
    ...overrides,
  });
}

describe('permissions', () => {
  beforeEach(() => {
    useAccessControlStore.getState().reset();
  });

  describe('default matrix', () => {
    it('gives a general user only announcements and disclosed store data', () => {
      expect(ROLE_PERMISSIONS.VIEWER).toEqual([
        PERMISSIONS.NEWS_READ,
        PERMISSIONS.STORE_READ_PUBLIC,
      ]);
      expect(hasPermission(ROLES.VIEWER, PERMISSIONS.STORE_READ)).toBe(false);
      expect(hasPermission(ROLES.VIEWER, PERMISSIONS.ASSESSMENT_READ)).toBe(false);
    });

    it('lets a mentor assess, and scopes that to assigned stores only', () => {
      expect(hasPermission(ROLES.MENTOR, PERMISSIONS.ASSESSMENT_WRITE)).toBe(true);
      expect(getDataScope(ROLES.MENTOR, 'assessment')).toBe(DATA_SCOPES.ASSIGNED);
    });

    it('scopes an entrepreneur to its own store', () => {
      expect(hasPermission(ROLES.ENTREPRENEUR, PERMISSIONS.STORE_WRITE)).toBe(true);
      expect(getDataScope(ROLES.ENTREPRENEUR, 'store')).toBe(DATA_SCOPES.OWN);
    });

    it('lets an admin manage every store but only assess assigned ones', () => {
      expect(getDataScope(ROLES.ADMIN, 'store')).toBe(DATA_SCOPES.ALL);
      expect(getDataScope(ROLES.ADMIN, 'assessment')).toBe(DATA_SCOPES.ASSIGNED);
    });

    it('reserves permission management for the super admin', () => {
      expect(hasPermission(ROLES.SUPER_ADMIN, PERMISSIONS.PERMISSIONS_MANAGE)).toBe(true);
      expect(hasPermission(ROLES.ADMIN, PERMISSIONS.PERMISSIONS_MANAGE)).toBe(false);
    });
  });

  describe('saved config', () => {
    it('applies a permission the super admin granted', () => {
      expect(hasPermission(ROLES.VIEWER, PERMISSIONS.DASHBOARD_READ)).toBe(false);

      saveConfig({
        rolePermissions: {
          ...DEFAULT_ACCESS_CONTROL.rolePermissions,
          VIEWER: [PERMISSIONS.NEWS_READ, PERMISSIONS.DASHBOARD_READ],
        },
      });

      expect(hasPermission(ROLES.VIEWER, PERMISSIONS.DASHBOARD_READ)).toBe(true);
      expect(hasPermission(ROLES.VIEWER, PERMISSIONS.STORE_READ_PUBLIC)).toBe(false);
    });

    it('still refuses permissions:manage to a non-super-admin the config granted it to', () => {
      saveConfig({
        rolePermissions: {
          ...DEFAULT_ACCESS_CONTROL.rolePermissions,
          ADMIN: [PERMISSIONS.PERMISSIONS_MANAGE],
        },
      });

      expect(hasPermission(ROLES.ADMIN, PERMISSIONS.PERMISSIONS_MANAGE)).toBe(false);
    });

    it('applies a changed data scope', () => {
      saveConfig({
        roleScopes: {
          ...DEFAULT_ACCESS_CONTROL.roleScopes,
          MENTOR: { ...DEFAULT_ACCESS_CONTROL.roleScopes.MENTOR, assessment: DATA_SCOPES.ALL },
        },
      });

      expect(getDataScope(ROLES.MENTOR, 'assessment')).toBe(DATA_SCOPES.ALL);
    });
  });

  describe('canAccessRoute', () => {
    it('lets only the super admin reach the access-control page', () => {
      expect(canAccessRoute(ROLES.SUPER_ADMIN, ROUTES.USER_PERMISSIONS)).toBe(true);
      expect(canAccessRoute(ROLES.ADMIN, ROUTES.USER_PERMISSIONS)).toBe(false);
      expect(canAccessRoute(ROLES.ME_TEAM, ROUTES.USER_PERMISSIONS)).toBe(false);
    });

    it('matches the nested route against its own entry, not the parent /users one', () => {
      // ME_TEAM holds users:read, so /users is allowed while its child is not.
      expect(canAccessRoute(ROLES.ME_TEAM, ROUTES.USERS)).toBe(true);
      expect(canAccessRoute(ROLES.ME_TEAM, ROUTES.USER_PERMISSIONS)).toBe(false);
    });

    it('keeps a general user out of the internal pages', () => {
      expect(canAccessRoute(ROLES.VIEWER, ROUTES.NEWS)).toBe(true);
      expect(canAccessRoute(ROLES.VIEWER, ROUTES.HOME)).toBe(false);
      expect(canAccessRoute(ROLES.VIEWER, ROUTES.ASSESSMENT)).toBe(false);
    });
  });

  describe('canViewStoreField', () => {
    it('hides undisclosed fields from a public-scoped role', () => {
      expect(canViewStoreField(ROLES.VIEWER, STORE_FIELDS.NAME)).toBe(true);
      expect(canViewStoreField(ROLES.VIEWER, STORE_FIELDS.PHONE)).toBe(false);
      expect(canViewStoreField(ROLES.VIEWER, STORE_FIELDS.LATEST_SCORE)).toBe(false);
    });

    it('shows every field to a role with a wider scope', () => {
      expect(canViewStoreField(ROLES.ADMIN, STORE_FIELDS.PHONE)).toBe(true);
      expect(canViewStoreField(ROLES.ASSESSOR, STORE_FIELDS.LATEST_SCORE)).toBe(true);
    });

    it('discloses a field once the super admin adds it to the public list', () => {
      saveConfig({
        publicStoreFields: [...DEFAULT_ACCESS_CONTROL.publicStoreFields, STORE_FIELDS.PHONE],
      });

      expect(canViewStoreField(ROLES.VIEWER, STORE_FIELDS.PHONE)).toBe(true);
    });
  });
});
