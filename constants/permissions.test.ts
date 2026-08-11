import { describe, expect, it } from 'vitest';
import { DATA_SCOPES, PERMISSIONS, ROLES, STORE_FIELDS } from '@/types/auth.types';
import {
  ROLE_PERMISSIONS,
  canAccessRoute,
  canViewStoreField,
  getDataScope,
  hasPermission,
} from './permissions';
import { ROUTES } from './routes';

describe('permissions', () => {
  describe('role matrix', () => {
    it('gives a general user the overview, announcements, activity albums and disclosed store data', () => {
      expect(ROLE_PERMISSIONS.VIEWER).toEqual([
        PERMISSIONS.DASHBOARD_READ,
        PERMISSIONS.NEWS_READ,
        PERMISSIONS.ACTIVITY_READ,
        PERMISSIONS.STORE_READ_PUBLIC,
      ]);
      expect(hasPermission(ROLES.VIEWER, PERMISSIONS.STORE_READ)).toBe(false);
      expect(hasPermission(ROLES.VIEWER, PERMISSIONS.ASSESSMENT_READ)).toBe(false);
    });

    it('lets every role but a judge read announcements, and only the admin roles publish them', () => {
      for (const role of Object.values(ROLES)) {
        expect(hasPermission(role, PERMISSIONS.NEWS_READ)).toBe(role !== ROLES.JUDGE);
      }

      expect(hasPermission(ROLES.SUPER_ADMIN, PERMISSIONS.NEWS_WRITE)).toBe(true);
      expect(hasPermission(ROLES.ADMIN, PERMISSIONS.NEWS_WRITE)).toBe(true);

      expect(hasPermission(ROLES.ASSESSOR, PERMISSIONS.NEWS_WRITE)).toBe(false);
      expect(hasPermission(ROLES.MENTOR, PERMISSIONS.NEWS_WRITE)).toBe(false);
      expect(hasPermission(ROLES.ENTREPRENEUR, PERMISSIONS.NEWS_WRITE)).toBe(false);
      expect(hasPermission(ROLES.JUDGE, PERMISSIONS.NEWS_WRITE)).toBe(false);
      expect(hasPermission(ROLES.VIEWER, PERMISSIONS.NEWS_WRITE)).toBe(false);
      expect(hasPermission(ROLES.VIEWER, PERMISSIONS.NEWS_DELETE)).toBe(false);
    });

    // "แบบ 50 ข้อ" §3.3 vs §3.4: ผู้ติดตาม/Assessor "ให้คะแนน", ที่ปรึกษา/Mentor
    // "ดูผลประเมินรายร้าน" — the mentor's own writing lives on the IDP pages.
    it('lets a mentor read an assessment but never score it', () => {
      expect(hasPermission(ROLES.MENTOR, PERMISSIONS.ASSESSMENT_READ)).toBe(true);
      expect(hasPermission(ROLES.MENTOR, PERMISSIONS.ASSESSMENT_WRITE)).toBe(false);
      expect(getDataScope(ROLES.MENTOR, 'assessment')).toBe(DATA_SCOPES.ASSIGNED);
    });

    // The scoring page is staff-only. A store reads its own result through
    // reports instead, so it holds neither assessment permission.
    it('keeps the assessment page away from a store', () => {
      expect(hasPermission(ROLES.ENTREPRENEUR, PERMISSIONS.ASSESSMENT_READ)).toBe(false);
      expect(hasPermission(ROLES.ENTREPRENEUR, PERMISSIONS.ASSESSMENT_WRITE)).toBe(false);
      expect(canAccessRoute(ROLES.ENTREPRENEUR, ROUTES.ASSESSMENT)).toBe(false);
      expect(canAccessRoute(ROLES.ENTREPRENEUR, ROUTES.REPORTS)).toBe(true);
    });

    // ผู้ประกอบการ gets the project overview, its own store profile, and its own
    // reports. วิเคราะห์ศักยภาพ stays programme-wide staff tooling.
    it('leaves a store with the overview, its own store profile and its own reports', () => {
      expect(canAccessRoute(ROLES.ENTREPRENEUR, ROUTES.HOME)).toBe(true);
      expect(canAccessRoute(ROLES.ENTREPRENEUR, ROUTES.STORES)).toBe(true);
      expect(canAccessRoute(ROLES.ENTREPRENEUR, ROUTES.REPORTS)).toBe(true);

      expect(canAccessRoute(ROLES.ENTREPRENEUR, ROUTES.ANALYTICS)).toBe(false);
    });

    // reports:read is granted at scope OWN — the page must never widen into
    // another store's numbers.
    it('scopes a store reports to the records it owns', () => {
      expect(getDataScope(ROLES.ENTREPRENEUR, 'reports')).toBe(DATA_SCOPES.OWN);
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

    it('reserves user management for the super admin', () => {
      expect(hasPermission(ROLES.SUPER_ADMIN, PERMISSIONS.USERS_READ)).toBe(true);
      expect(hasPermission(ROLES.SUPER_ADMIN, PERMISSIONS.USERS_WRITE)).toBe(true);
      expect(hasPermission(ROLES.SUPER_ADMIN, PERMISSIONS.USERS_DELETE)).toBe(true);

      expect(hasPermission(ROLES.ADMIN, PERMISSIONS.USERS_READ)).toBe(false);
      expect(hasPermission(ROLES.ADMIN, PERMISSIONS.USERS_WRITE)).toBe(false);
      expect(hasPermission(ROLES.ASSESSOR, PERMISSIONS.USERS_READ)).toBe(false);
    });
  });

  describe('canAccessRoute', () => {
    it('lets only the super admin reach user management', () => {
      expect(canAccessRoute(ROLES.SUPER_ADMIN, ROUTES.USERS)).toBe(true);
      expect(canAccessRoute(ROLES.ADMIN, ROUTES.USERS)).toBe(false);
      expect(canAccessRoute(ROLES.ASSESSOR, ROUTES.USERS)).toBe(false);
    });

    it('lets a general user see the overview and announcements but not the internal pages', () => {
      expect(canAccessRoute(ROLES.VIEWER, ROUTES.HOME)).toBe(true);
      expect(canAccessRoute(ROLES.VIEWER, ROUTES.NEWS)).toBe(true);
      expect(canAccessRoute(ROLES.VIEWER, ROUTES.ASSESSMENT)).toBe(false);
      expect(canAccessRoute(ROLES.VIEWER, ROUTES.STORES)).toBe(false);
    });

    it('opens announcements to every role but a judge', () => {
      for (const role of Object.values(ROLES)) {
        expect(canAccessRoute(role, ROUTES.NEWS)).toBe(role !== ROLES.JUDGE);
      }
    });

    // A judge is on the panel, not in the programme: it opens พิชชิ่ง and its
    // own report, and neither ภาพรวมโครงการ nor ข่าวประชาสัมพันธ์.
    it('keeps the overview and announcements away from a judge', () => {
      expect(hasPermission(ROLES.JUDGE, PERMISSIONS.DASHBOARD_READ)).toBe(false);
      expect(hasPermission(ROLES.JUDGE, PERMISSIONS.NEWS_READ)).toBe(false);
      expect(canAccessRoute(ROLES.JUDGE, ROUTES.HOME)).toBe(false);
      expect(canAccessRoute(ROLES.JUDGE, ROUTES.NEWS)).toBe(false);

      expect(canAccessRoute(ROLES.JUDGE, ROUTES.PITCHING)).toBe(true);
      expect(canAccessRoute(ROLES.JUDGE, ROUTES.REPORTS)).toBe(true);
    });

    it('keeps the create and edit announcement pages to the roles holding news:write', () => {
      expect(canAccessRoute(ROLES.ADMIN, ROUTES.NEWS_NEW)).toBe(true);
      expect(canAccessRoute(ROLES.SUPER_ADMIN, ROUTES.NEWS_EDIT('42'))).toBe(true);

      // Reaching /news no longer implies reaching what publishes to it — the
      // longer entries win the match, so a reader is turned away by news:write.
      expect(canAccessRoute(ROLES.VIEWER, ROUTES.NEWS_NEW)).toBe(false);
      expect(canAccessRoute(ROLES.ENTREPRENEUR, ROUTES.NEWS_EDIT('42'))).toBe(false);
      expect(canAccessRoute(ROLES.JUDGE, ROUTES.NEWS_EDIT('42'))).toBe(false);
    });

    // ประมวลภาพกิจกรรม is the one programme-wide page with no role shut out —
    // a judge reaches it even though the overview and announcements are closed
    // to it.
    it('opens the activity gallery to every role, judge included', () => {
      for (const role of Object.values(ROLES)) {
        expect(hasPermission(role, PERMISSIONS.ACTIVITY_READ)).toBe(true);
        expect(canAccessRoute(role, ROUTES.ACTIVITIES)).toBe(true);
        expect(canAccessRoute(role, ROUTES.ACTIVITY_DETAIL('42'))).toBe(true);
      }
    });

    it('keeps the create and edit activity pages to the roles holding activity:write', () => {
      expect(canAccessRoute(ROLES.ADMIN, ROUTES.ACTIVITY_NEW)).toBe(true);
      expect(canAccessRoute(ROLES.SUPER_ADMIN, ROUTES.ACTIVITY_EDIT('42'))).toBe(true);

      for (const role of [
        ROLES.ASSESSOR,
        ROLES.MENTOR,
        ROLES.ENTREPRENEUR,
        ROLES.JUDGE,
        ROLES.VIEWER,
      ]) {
        expect(hasPermission(role, PERMISSIONS.ACTIVITY_WRITE)).toBe(false);
        expect(canAccessRoute(role, ROUTES.ACTIVITY_NEW)).toBe(false);
        expect(canAccessRoute(role, ROUTES.ACTIVITY_EDIT('42'))).toBe(false);
      }
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
  });
});
