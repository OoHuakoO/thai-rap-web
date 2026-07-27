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
    it('gives a general user only announcements, the manual and disclosed store data', () => {
      expect(ROLE_PERMISSIONS.VIEWER).toEqual([
        PERMISSIONS.NEWS_READ,
        PERMISSIONS.MANUAL_READ,
        PERMISSIONS.STORE_READ_PUBLIC,
      ]);
      expect(hasPermission(ROLES.VIEWER, PERMISSIONS.STORE_READ)).toBe(false);
      expect(hasPermission(ROLES.VIEWER, PERMISSIONS.ASSESSMENT_READ)).toBe(false);
    });

    // Brief "แบบ 50 ข้อ" §16: ผู้ติดตาม/Assessor "ให้คะแนน", ที่ปรึกษา/Mentor "ดูผล".
    it('lets a mentor read an assessment but never score it', () => {
      expect(hasPermission(ROLES.MENTOR, PERMISSIONS.ASSESSMENT_READ)).toBe(true);
      expect(hasPermission(ROLES.MENTOR, PERMISSIONS.ASSESSMENT_WRITE)).toBe(false);
      expect(getDataScope(ROLES.MENTOR, 'assessment')).toBe(DATA_SCOPES.ASSIGNED);
    });

    it('lets an assessor score, scoped to assigned stores only', () => {
      expect(hasPermission(ROLES.ASSESSOR, PERMISSIONS.ASSESSMENT_WRITE)).toBe(true);
      expect(getDataScope(ROLES.ASSESSOR, 'assessment')).toBe(DATA_SCOPES.ASSIGNED);
    });

    // The API only ever accepted store writes from admin roles and the owning
    // entrepreneur — an assessor holding store:write was a client-side lie that
    // rendered buttons whose request came back 403.
    it('does not let an assessor edit store data', () => {
      expect(hasPermission(ROLES.ASSESSOR, PERMISSIONS.STORE_READ)).toBe(true);
      expect(hasPermission(ROLES.ASSESSOR, PERMISSIONS.STORE_WRITE)).toBe(false);
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

    it('reserves user management for the super admin', () => {
      expect(hasPermission(ROLES.SUPER_ADMIN, PERMISSIONS.USERS_READ)).toBe(true);
      expect(hasPermission(ROLES.SUPER_ADMIN, PERMISSIONS.USERS_WRITE)).toBe(true);
      expect(hasPermission(ROLES.SUPER_ADMIN, PERMISSIONS.USERS_DELETE)).toBe(true);

      expect(hasPermission(ROLES.ADMIN, PERMISSIONS.USERS_READ)).toBe(false);
      expect(hasPermission(ROLES.ADMIN, PERMISSIONS.USERS_WRITE)).toBe(false);
      expect(hasPermission(ROLES.ME_TEAM, PERMISSIONS.USERS_READ)).toBe(false);
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

    it('still refuses user management to a non-super-admin the config granted it to', () => {
      saveConfig({
        rolePermissions: {
          ...DEFAULT_ACCESS_CONTROL.rolePermissions,
          ADMIN: [PERMISSIONS.USERS_READ, PERMISSIONS.USERS_WRITE, PERMISSIONS.USERS_DELETE],
        },
      });

      expect(hasPermission(ROLES.ADMIN, PERMISSIONS.USERS_READ)).toBe(false);
      expect(hasPermission(ROLES.ADMIN, PERMISSIONS.USERS_DELETE)).toBe(false);
      expect(canAccessRoute(ROLES.ADMIN, ROUTES.USERS)).toBe(false);
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

    it('lets only the super admin reach user management', () => {
      expect(canAccessRoute(ROLES.SUPER_ADMIN, ROUTES.USERS)).toBe(true);
      expect(canAccessRoute(ROLES.ADMIN, ROUTES.USERS)).toBe(false);
      expect(canAccessRoute(ROLES.ME_TEAM, ROUTES.USERS)).toBe(false);
    });

    it('matches the nested route against its own entry, not the parent /users one', () => {
      // Both routes are SUPER_ADMIN-only, so the two entries are told apart by
      // their permission: a matrix granting users:read without permissions:manage
      // opens /users and must still leave its child closed.
      saveConfig({
        rolePermissions: {
          ...DEFAULT_ACCESS_CONTROL.rolePermissions,
          SUPER_ADMIN: [PERMISSIONS.USERS_READ],
        },
      });

      expect(canAccessRoute(ROLES.SUPER_ADMIN, ROUTES.USERS)).toBe(true);
      expect(canAccessRoute(ROLES.SUPER_ADMIN, ROUTES.USER_PERMISSIONS)).toBe(false);
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
