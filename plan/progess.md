# Thai Rap Web — Progress

## Sprint 0 ✅ DONE

- Next.js 15 App Router, TypeScript strict, Tailwind, shadcn (21 UI components)
- Brand colors: #F17128 (orange), #F58544 (orange-light), #FFF0E5 (cream), #58595B (charcoal)
- 17 shared components in `components/shared/`
- Layout: `sidebar.tsx` (role-filtered, Thai labels), `top-header.tsx` (Avatar)
- Auth store: `useAuthStore` with `login(user, token)`, `can(permission)`, `hasRole(role)`
- Permissions: `constants/permissions.ts` — `hasPermission()` + `canAccessRoute()`
- Nav config: `constants/nav-config.ts` — `getNavItemsForRole(role)`
- MSW: browser worker, `user.handlers.ts` (CRUD + error scenarios)
- API client: `services/api.ts` — Axios with auth interceptor, logout on 401

---

## Sprint 1 — Auth + Shell ✅ DONE

### Sprint 1.1 + 1.2 ✅ — Roles & Routes Update

- Roles updated to 6: `admin`, `assessor`, `mentor`, `entrepreneur`, `judge`, `me_team`
- Routes updated: `/restaurants` → `/stores`, `/scoring` → `/pitching`
- `ASSESSMENT_DETAIL(storeId, round)` — 2-param signature
- Files: `types/auth.types.ts`, `constants/routes.ts`, `constants/permissions.ts`, `constants/nav-config.ts`, `mocks/fixtures/user.fixtures.ts`, `mocks/factories/user.factory.ts`, `features/user/components/create-user-form.tsx`

### Sprint 1.3 ✅ — App Shell Layout

- `components/layout/app-shell.tsx` — Sidebar + TopHeader + main content
- `app/(dashboard)/layout.tsx` — protected, `mounted` state + `Loading` spinner + redirect `/login`
- `app/(auth)/layout.tsx` — `mounted` state + redirect `/` if already authenticated
- `app/layout.tsx` — stripped to Providers only
- `app/page.tsx` moved to `app/(dashboard)/page.tsx`

### Sprint 1.4 ✅ — Login Page (Mock)

- `app/(auth)/login/page.tsx` — Server Component + metadata
- `features/auth/components/login-form.tsx` — React Hook Form + Zod, email + password
- `features/auth/schemas/login.schema.ts` — Zod schema, Thai error messages
- `features/auth/services/auth.service.ts` — POST `/auth/login`
- `features/auth/hooks/use-login.ts` — useMutation + useAuthStore.login + router.replace
- `features/auth/types/auth-response.types.ts` — LoginDto, LoginResponse
- `features/auth/index.ts` — barrel export
- `mocks/handlers/auth.handlers.ts` — mock login: match email from userDb, return `{ user, token }`
- `utils/extract-error-message.ts` — normalize AxiosError → readable message

**Mock login:** ใช้ email จาก seed (any password ≥6 chars) `siriwan.j@rbru.ac.th`

---

## Sprint 2 — Dashboard Page ✅ DONE

### 2.1 Data Layer

- `features/dashboard/types/dashboard.types.ts` — DashboardKPI, ProvinceDistribution, Top20Item, IncubationStep, ProvinceComparison, ActivityItem, ReportStatusItem
- `mocks/fixtures/dashboard.fixtures.ts` — seed data (23 stores, 5 provinces: สระบุรี/ลพบุรี/ชัยนาท/สิงห์บุรี/อ่างทอง)
- `mocks/handlers/dashboard.handlers.ts` — 7 GET handlers (kpi, province-distribution, top20, incubation-steps, province-comparison, activity, reports-status)
- `features/dashboard/services/dashboard.service.ts` — 7 service functions
- `features/dashboard/hooks/use-dashboard.ts` — 7 useQuery hooks + `dashboardKeys`

### 2.2 Components (7)

- `kpi-row.tsx` — 6 StatCards (totalStores, activeStores, assessmentCount, completionRate, averageScore, incubationCount)
- `province-donut.tsx` — DonutChart รายจังหวัด + total center label
- `incubation-stepper.tsx` — TimelineSteps T0–T4 + ProgressBar per step
- `province-bar-chart.tsx` — BarChart T0 vs T1 รายจังหวัด
- `activity-feed.tsx` — AlertCard list + timestamp per item
- `top20-table.tsx` — DataTable rank/name/province/type/score + color-coded score
- `reports-status-table.tsx` — DataTable + StatusBadge

### 2.3 Page

- `app/(dashboard)/page.tsx` — Dashboard page, 3-column grid layout
- `app/(dashboard)/loading.tsx` — Loading spinner
- `app/(dashboard)/error.tsx` — Error boundary (client)
- `features/dashboard/index.ts` — barrel export

---

## Next: Sprint 3 — Restaurant Profiles

- `/stores` list page — table + filter + pagination
- Quick view panel (Sheet)
- Add/edit store form (Dialog)
- 5 provinces, 20+ seed stores
