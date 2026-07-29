import { describe, expect, it } from 'vitest';
import { ROLES } from '@/types/auth.types';
import { getDefaultRouteForRole, resolvePostLoginRoute } from './nav-config';
import { ROUTES } from './routes';

describe('nav-config', () => {
  describe('getDefaultRouteForRole', () => {
    it('returns the first nav destination the role can actually open', () => {
      // The overview is the first nav entry and every role holding
      // dashboard:read lands there — an ENTREPRENEUR included, since the API
      // now scopes /dashboard/* to the stores it owns instead of refusing it.
      expect(getDefaultRouteForRole(ROLES.ENTREPRENEUR)).toBe(ROUTES.HOME);
      expect(getDefaultRouteForRole(ROLES.JUDGE)).toBe(ROUTES.HOME);
    });

    // Announcements went admin-only, leaving the project overview as the one
    // page a general user lands on.
    it('sends a general user to the project overview', () => {
      expect(getDefaultRouteForRole(ROLES.VIEWER)).toBe(ROUTES.HOME);
    });
  });

  describe('resolvePostLoginRoute', () => {
    it('returns the requested path when the role may open it', () => {
      expect(resolvePostLoginRoute(ROLES.ENTREPRENEUR, ROUTES.STORES)).toBe(ROUTES.STORES);
    });

    it('ignores a path the role may not open', () => {
      expect(resolvePostLoginRoute(ROLES.ENTREPRENEUR, ROUTES.USERS)).toBe(ROUTES.HOME);
      expect(resolvePostLoginRoute(ROLES.ENTREPRENEUR, ROUTES.REPORTS)).toBe(ROUTES.HOME);
    });

    it('ignores an off-site path', () => {
      expect(resolvePostLoginRoute(ROLES.ENTREPRENEUR, '//evil.example.com')).toBe(ROUTES.HOME);
      expect(resolvePostLoginRoute(ROLES.ENTREPRENEUR, 'https://evil.example.com')).toBe(
        ROUTES.HOME
      );
    });

    it('falls back to the default route when no path is given', () => {
      expect(resolvePostLoginRoute(ROLES.ENTREPRENEUR, null)).toBe(ROUTES.HOME);
      expect(resolvePostLoginRoute(ROLES.ENTREPRENEUR)).toBe(ROUTES.HOME);
    });
  });
});
