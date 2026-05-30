# THAI-RAP Sprint Plan

> อ้างอิง: spec/thai-rap-fullstack-spec-v2.md + design/Untitled-5-0[1-6]_0.jpg
> อัปเดต: 2026-05-30

---

## สถานะปัจจุบัน (Done ✅)

| หมวด | สิ่งที่ทำแล้ว |
|---|---|
| Project setup | Next.js 15, TypeScript strict, Tailwind, shadcn (21 components) |
| Design tokens | brand colors (#F17128, #F58544, #FFF0E5, #58595B), CSS vars, Tailwind aliases |
| Shared components | 17 components: PageHeader, StatusBadge, ScoreCircle, DonutChart, BarChart, SearchFilterBar, AlertCard, TimelineSteps, EventChip, ExportPanel, FileList + 6 เดิม |
| Layout | Sidebar (role-filtered NAV_ITEMS, Thai labels), TopHeader (Avatar) |
| Auth system | Role type (4 roles → **ต้องอัปเดตเป็น 6 roles ใน Sprint 1**), Permission type (18), useAuthStore (login/can/hasRole), canAccessRoute |
| Routes + Nav | ROUTES const, NAV_ITEMS, permissions.ts (single source of truth) |
| User feature | types, service, hooks, UserList, CreateUserForm (shadcn Label + Select) |
| MSW | browser worker, user.handlers.ts (CRUD + scenarios), user fixtures/factory |
| API client | Axios instance, auth interceptor, logout on 401 |

### ⚠️ Gap ระหว่าง spec และ code ปัจจุบัน

| รายการ | Spec | Current | แก้ใน Sprint |
|---|---|---|---|
| Routes | `/stores`, `/pitching` | `/restaurants`, `/scoring` | Sprint 1 |
| Roles | 6 roles (ADMIN, ASSESSOR, MENTOR, ENTREPRENEUR, JUDGE, ME_TEAM) | 4 roles | Sprint 1 |
| Auth | JWT จาก NestJS | Zustand เท่านั้น ยังไม่มี real auth | Sprint 1 |

### Architecture Decisions (confirmed)

| รายการ | ตัดสินใจ |
|---|---|
| Backend | **NestJS** — separate repo (ไม่อยู่ใน repo นี้) |
| Auth | **JWT จาก NestJS** — FE รับ token แล้วเก็บใน `useAuthStore` |
| File Storage | **Cloudinary** (ไม่ใช่ S3/MinIO) |
| API Base URL (dev) | `http://localhost:3000/thai-rap` |
| Roles | ยึดตาม spec: ADMIN, ASSESSOR, MENTOR, ENTREPRENEUR, JUDGE, ME_TEAM |

---

## Sprint 0 — Foundation ✅ DONE

ทำเสร็จแล้วทั้งหมดตามตาราง "สถานะปัจจุบัน" ด้านบน

---

## Sprint 1 — Auth + Layout Shell + Route Alignment

**เป้าหมาย:** เข้าสู่ระบบได้, layout ครบ, routes ตรงตาม spec

### 1.1 ปรับ Roles ให้ตรง spec

- [ ] อัปเดต `types/auth.types.ts` — Role: `'admin' | 'assessor' | 'mentor' | 'entrepreneur' | 'judge' | 'me_team'`
- [ ] อัปเดต `constants/permissions.ts` — สร้าง ROLE_PERMISSIONS ใหม่ 6 roles
- [ ] อัปเดต `constants/nav-config.ts` — allowedRoles ใหม่
- [ ] อัปเดต `mocks/fixtures/user.fixtures.ts` — seed data ใหม่

### 1.2 ปรับ Routes ให้ตรง spec

- [ ] `constants/routes.ts` — เปลี่ยน `RESTAURANTS` → `STORES` (`/stores`), `SCORING` → `PITCHING` (`/pitching`)
- [ ] อัปเดต `constants/nav-config.ts` + `constants/permissions.ts` ให้ตรง

### 1.3 App Layout

- [ ] `app/layout.tsx` — wrap ด้วย `MockProvider` + `QueryProvider`
- [ ] `components/layout/app-shell.tsx` — Sidebar + TopHeader + main content area
- [ ] `app/(dashboard)/layout.tsx` — protected layout (redirect ถ้า !isAuthenticated)
- [ ] `app/(auth)/layout.tsx` — auth layout (redirect ถ้า isAuthenticated แล้ว)

### 1.4 Login Page

- [ ] `app/(auth)/login/page.tsx` — Server Component + metadata
- [ ] `features/auth/components/login-form.tsx` — email + password + React Hook Form + Zod
- [ ] `features/auth/services/auth.service.ts` — `login(email, password)` → calls POST /api/auth/login
- [ ] `mocks/handlers/auth.handlers.ts` — mock login endpoint + fixtures
- [ ] เชื่อม `useAuthStore.login(user, token)` หลัง login สำเร็จ

**Deliverable:** เปิดแอป → หน้า login → กรอก credential → เข้าหน้า dashboard → sidebar ตาม role ✅

---

## Sprint 2 — Dashboard Page (C1)

**เป้าหมาย:** หน้า Dashboard ครบทุก widget ตาม spec C1

### 2.1 Types + Service + Hooks

- [ ] `features/dashboard/types/dashboard.types.ts` — DashboardKPI, ProvinceDistribution, Top20Item, IncubationStep, ActivityItem
- [ ] `features/dashboard/services/dashboard.service.ts` — เรียก 7 API endpoints ตาม E2 (/api/dashboard/*)
- [ ] `features/dashboard/hooks/use-dashboard.ts` — 7 useQuery hooks, queryKeys exported

### 2.2 MSW Handlers

- [ ] `mocks/handlers/dashboard.handlers.ts` — mock ข้อมูลครบ 7 endpoints
- [ ] `mocks/fixtures/dashboard.fixtures.ts` — seed data ตัวเลขจาก spec
- [ ] register ใน `mocks/handlers/index.ts`

### 2.3 Components

- [ ] `features/dashboard/components/kpi-row.tsx` — 6 KPI cards (icon + value + subtitle + progress)
- [ ] `features/dashboard/components/province-donut.tsx` — DonutChart + legend 5 จังหวัด
- [ ] `features/dashboard/components/top20-table.tsx` — DataTable (rank, ชื่อ, จังหวัด, ประเภท, คะแนน)
- [ ] `features/dashboard/components/incubation-stepper.tsx` — TimelineSteps (5 ขั้น + % + count)
- [ ] `features/dashboard/components/province-bar-chart.tsx` — BarChart T0 vs T1 รายจังหวัด
- [ ] `features/dashboard/components/activity-feed.tsx` — AlertCard list (warning/event/announcement)
- [ ] `features/dashboard/components/reports-status-table.tsx` — ตารางรายงานพร้อม status badge

### 2.4 Page

- [ ] `app/(dashboard)/page.tsx` — compose ทุก component, metadata, loading.tsx, error.tsx
- [ ] `features/dashboard/index.ts` — barrel export

**Deliverable:** Dashboard โหลดได้ครบ 7 sections, ใช้ mock data ✅

---

## Sprint 3 — Restaurant Profiles (C2)

**เป้าหมาย:** `/stores` list + quick view panel + add/edit store

### 3.1 Types + Service + Hooks

- [ ] `features/store/types/store.types.ts` — Store, CreateStoreDto, UpdateStoreDto, StoreStatus enum, StoreFilters
- [ ] `features/store/services/store.service.ts` — getAll (with filters + pagination), getById, getSummary, create, update, remove
- [ ] `features/store/hooks/use-stores.ts` — useStores (paginated), useStore, useCreateStore, useUpdateStore, useDeleteStore + storeKeys

### 3.2 MSW Handlers

- [ ] `mocks/handlers/store.handlers.ts` — CRUD + filters + pagination + summary endpoint
- [ ] `mocks/fixtures/store.fixtures.ts` — seed 20+ ร้านอาหาร จาก 5 จังหวัด
- [ ] `mocks/factories/store.factory.ts`

### 3.3 Components

- [ ] `features/store/components/store-filter-bar.tsx` — SearchFilterBar + province/type/status selects + Add button
- [ ] `features/store/components/store-table.tsx` — DataTable (thumbnail, ชื่อ, จังหวัด, ประเภท, status badge, คะแนน, ผู้ประเมิน, actions) + pagination + active-row highlight
- [ ] `features/store/components/store-quick-view.tsx` — Sheet slide-in: photo, owner info, docs, food photos, timeline
- [ ] `features/store/components/store-form.tsx` — Dialog form: ชื่อ, จังหวัด, ประเภท, เจ้าของ, เบอร์, อีเมล, social links
- [ ] `features/store/components/store-summary-bar.tsx` — bottom 4 KPI + map placeholder

### 3.4 Page

- [ ] `app/(dashboard)/stores/page.tsx`
- [ ] `app/(dashboard)/stores/[id]/page.tsx` — store detail (ถ้าต้องการ)
- [ ] `features/store/index.ts`

**Deliverable:** เปิด `/stores` → ตาราง + filter → click row → quick view panel ✅

---

## Sprint 4 — Assessment (C3)

**เป้าหมาย:** แบบประเมิน 8 มิติ, กรอกคะแนน, อัปโหลดหลักฐาน, คำนวณคะแนน

### 4.1 Business Logic Utils

- [ ] `utils/score.ts` — `calcDimensionScore()`, `calcTotalScore()`, `calcIncubationReadiness()`, `getZone()` (จาก spec E3)
- [ ] `utils/red-flag.ts` — `detectRedFlags()` (จาก spec E3)
- [ ] `constants/dimensions.ts` — DIMENSIONS array (8 มิติ, questionNos, weights)

### 4.2 Types + Service + Hooks

- [ ] `features/assessment/types/assessment.types.ts` — Assessment, Score, Evidence, RedFlag, Dimension, AssessmentStatus, ScoreStatus
- [ ] `features/assessment/services/assessment.service.ts` — getAssessment, saveDraft, submit, updateScore, getRedFlags, uploadEvidence
- [ ] `features/assessment/hooks/use-assessment.ts` — useAssessment, useSaveScore, useSubmitAssessment, useRedFlags

### 4.3 MSW Handlers

- [ ] `mocks/handlers/assessment.handlers.ts`
- [ ] `mocks/fixtures/assessment.fixtures.ts` — seed assessment บ้านริมน้ำ T0 + T1

### 4.4 Components

- [ ] `features/assessment/components/assessment-filter-bar.tsx` — store select, province, round radio (T0-T4), progress bar, save/next buttons
- [ ] `features/assessment/components/dimension-sidebar.tsx` — 8 มิติ list + score + progress bar + active highlight + weighted total footer
- [ ] `features/assessment/components/score-table.tsx` — assessment table: ข้อที่, คำถาม, score select (0-100), evidence upload, note, status badge
- [ ] `features/assessment/components/score-select.tsx` — dropdown 0/25/50/75/100 (แปลงจาก 0-4)
- [ ] `features/assessment/components/evidence-cell.tsx` — FileChip list + upload button
- [ ] `features/assessment/components/assessment-summary-sidebar.tsx` — store card, 4 score cards, red flags, improvement points, radar chart
- [ ] `features/assessment/components/history-timeline.tsx` — assessment history list + note editor

### 4.5 Page

- [ ] `app/(dashboard)/assessment/[storeId]/[round]/page.tsx` — 3-column layout (SplitLayout)
- [ ] `app/(dashboard)/assessment/page.tsx` — redirect ไป store เลือกล่าสุด หรือ store picker

**Deliverable:** เปิดแบบประเมิน → กรอกคะแนน → เห็น radar chart + red flags อัปเดต real-time ✅

---

## Sprint 5 — Analytics + Pitching (C4, C5)

**เป้าหมาย:** หน้าวิเคราะห์ศักยภาพ + คะแนนพิชชิ่ง

### 5.1 Analytics (C4)

- [ ] `features/analytics/types/analytics.types.ts` — AnalyticsData, RadarData, TrendData, ActionPlan, Strengths, RedFlagItem
- [ ] `features/analytics/services/analytics.service.ts`
- [ ] `features/analytics/hooks/use-analytics.ts`
- [ ] `mocks/handlers/analytics.handlers.ts`
- [ ] Components:
  - `analytics-filter-bar.tsx`
  - `analytics-kpi-row.tsx` — 6 cards incl. Zone badge + Incubation Readiness
  - `analytics-radar-section.tsx` — RadarChart 8 มิติ T0 vs T1
  - `analytics-bar-section.tsx` — GroupedBarChart 8 มิติ
  - `trend-line-chart.tsx` — Line chart T0-T4 (new shared component)
  - `ai-analysis-card.tsx` — AI analysis + mentor recommendations
  - `analytics-sidebar.tsx` — strengths, weaknesses, red flags, incubation status, target
  - `action-plans-row.tsx` — 3 cards: 7/30/90 วัน
- [ ] `app/(dashboard)/analytics/page.tsx`

### 5.2 Pitching (C5)

- [ ] `features/pitching/types/pitching.types.ts` — PitchingScore, PitchingCriteria, JudgeScore, LeaderboardEntry
- [ ] `features/pitching/services/pitching.service.ts`
- [ ] `features/pitching/hooks/use-pitching.ts`
- [ ] `mocks/handlers/pitching.handlers.ts`
- [ ] Components:
  - `pitching-filter-bar.tsx`
  - `pitching-form.tsx` — store info + 5 criteria sliders + total score
  - `score-slider-row.tsx` — shadcn Slider + score display per criterion
  - `pitching-summary.tsx` — avg score, rank, incubation chance, judge note, strengths/concerns
  - `pitching-leaderboard.tsx` — top 10 ranking table
  - `judge-table.tsx` — judge × score × date × status
  - `score-distribution-donut.tsx` — DonutChart คะแนนรวม 23 ร้าน
- [ ] `app/(dashboard)/pitching/page.tsx`

**Deliverable:** เปิด `/analytics` และ `/pitching` แสดงข้อมูลครบ ✅

---

## Sprint 6 — Reports + Users (C6, C7)

**เป้าหมาย:** รายงาน export + user management + permissions matrix

### 6.1 Reports (C6)

- [ ] `features/reports/types/report.types.ts` — Report, ReportTemplate, ReportStatus, ExportOptions
- [ ] `features/reports/services/report.service.ts`
- [ ] `features/reports/hooks/use-reports.ts`
- [ ] `mocks/handlers/report.handlers.ts`
- [ ] Components:
  - `reports-filter-bar.tsx`
  - `reports-kpi-row.tsx` — 4 summary cards
  - `report-template-grid.tsx` — 8 templates (2×4 grid)
  - `report-table.tsx` — generated reports table + status + download
  - `activity-log-table.tsx`
  - `export-drawer.tsx` — shadcn Sheet: file format, content options, scope, buttons (ขยาย ExportPanel เดิม)
- [ ] `app/(dashboard)/reports/page.tsx`

### 6.2 Users (C7)

- [ ] อัปเดต `features/user/types/user.types.ts` — เพิ่ม department, phone, status, avatar, provinces, lastLogin (ตาม spec E1)
- [ ] อัปเดต `features/user/services/user.service.ts` — เพิ่ม updateStatus, updatePermissions, getRoles, getPermissionsMatrix
- [ ] `mocks/fixtures/user.fixtures.ts` — seed 20+ users ครบ 6 roles
- [ ] Components:
  - `user-filter-bar.tsx` — ปรับของเดิมให้มี role/dept/status filters
  - `user-summary-cards.tsx` — 4 KPI cards
  - `user-table.tsx` — ปรับของเดิม: เพิ่ม avatar, department, phone, status dot, lastLogin, actions
  - `role-summary-cards.tsx` — 6 role cards + count + description
  - `permissions-matrix.tsx` — CRUD matrix table (5 modules × 6 roles)
  - `user-detail-panel.tsx` — Sheet/Panel: avatar, info, status, provinces, stores, permission toggles
  - `edit-user-form.tsx` — Dialog form
- [ ] `app/(dashboard)/users/page.tsx` — ปรับของเดิม

**Deliverable:** Reports + Users pages ครบทุก widget ✅

---

## Sprint 7 — API Integration

> Backend: NestJS, separate repo — FE only connects  
> Dev API: `http://localhost:3000/thai-rap`

### 7.1 Environment Setup

- [ ] `.env.local` — `NEXT_PUBLIC_API_URL=http://localhost:3000/thai-rap`
- [ ] `NEXT_PUBLIC_ENABLE_MOCKS=false` when NestJS is ready
- [ ] Verify response shapes match MSW handlers — fix service layer if mismatched

### 7.2 Auth Integration

- [ ] `features/auth/services/auth.service.ts` — `POST /thai-rap/auth/login` → receive JWT from NestJS
- [ ] Token handling: store JWT in `useAuthStore.login(user, token)`
- [ ] Axios interceptor — auto-refresh token before retrying 401
- [ ] Logout → `DELETE /thai-rap/auth/logout` + clear store + redirect `/login`

### 7.3 Service Layer Verification

Check each service response shape matches TypeScript types:

- [ ] `store.service.ts` — `GET /thai-rap/stores`
- [ ] `assessment.service.ts` — Score, Evidence shapes
- [ ] `analytics.service.ts` — radar, trend data shapes
- [ ] `pitching.service.ts` — PitchingScore, leaderboard
- [ ] `report.service.ts` — Report, template list
- [ ] `user.service.ts` — User shape (6 roles)
- [ ] `dashboard.service.ts` — KPI aggregation shapes

### 7.4 File Upload (Cloudinary)

- [ ] `services/upload.service.ts` — upload file → Cloudinary → return `secure_url`
- [ ] Wire into `evidence-cell.tsx` (assessment evidence) + store photos
- [ ] Error handling: upload fail → toast + retry button

### 7.5 Report Download

- [ ] `report.service.ts` — `GET /thai-rap/reports/:id/download` → blob → trigger browser download
- [ ] Status polling: if `status === 'GENERATING'` → poll every 5s until `DONE`

### 7.6 MSW Cleanup

- [ ] Per endpoint: when NestJS is ready → remove/bypass MSW handler
- [ ] Keep handlers for endpoints still in dev

**Deliverable:** FE calls NestJS API on all endpoints, MSW disabled ✅

---

## Sprint 8 — Polish + Responsive + A11y

**เป้าหมาย:** production-ready, responsive, accessible

### 8.1 Responsive Layout

- [ ] `app-shell.tsx` — sidebar collapsible (220px / 64px icon-only)
- [ ] 1024-1439px: icon sidebar + right panel collapse
- [ ] 768-1023px: drawer overlay sidebar
- [ ] `<768px`: single column + bottom tab bar
- [ ] ทุก table + chart รองรับ overflow + scroll

### 8.2 Accessibility

- [ ] ทุก button, link, input มี `aria-label`
- [ ] Chart fallback `<table>` hidden (screen reader)
- [ ] Alert/RedFlag ใช้ `role="alert"` + `aria-live="assertive"`
- [ ] Score inputs: `role="radiogroup"`
- [ ] Modal: focus trap + Escape close

### 8.3 Performance

- [ ] Image optimization (next/image ทุกที่)
- [ ] Code splitting per route
- [ ] TanStack Query staleTime/cacheTime tuning
- [ ] React Query prefetch บน Server Components

### 8.4 Error Handling

- [ ] `error.tsx` ทุก route segment
- [ ] `loading.tsx` ทุก route segment
- [ ] Global error boundary
- [ ] Toast (Sonner) สำหรับ mutation success/error

### 8.5 Testing

- [ ] Vitest setup (vitest.config.ts, setupTests.ts)
- [ ] unit tests: score.ts, red-flag.ts, permissions.ts
- [ ] hook tests: useAssessment, useStores, useDashboard
- [ ] component tests: AssessmentForm, StoreTable, LoginForm

**Deliverable:** Lighthouse ≥90, ไม่มี a11y violations, test coverage ≥70% ✅

---

## Summary Timeline

| Sprint | หัวข้อ | สิ่งที่ต้องใช้ | ประมาณการ |
|---|---|---|---|
| S0 | Foundation | — | ✅ Done |
| S1 | Auth + Layout + Route Fix | React Hook Form, NextAuth | 1 สัปดาห์ |
| S2 | Dashboard | Recharts, mock data | 1.5 สัปดาห์ |
| S3 | Restaurant Profiles | Sheet, DataTable, pagination | 1.5 สัปดาห์ |
| S4 | Assessment | File upload, score logic, radar | 2 สัปดาห์ |
| S5 | Analytics + Pitching | Line chart, Slider, leaderboard | 1.5 สัปดาห์ |
| S6 | Reports + Users | Export, permissions matrix, drawer | 1.5 สัปดาห์ |
| S7 | API Integration (NestJS → FE) | axios, token refresh, S3 upload | 1.5 สัปดาห์ |
| S8 | Polish + A11y + Tests | Vitest, RTL | 1 สัปดาห์ |

**รวม: ~12.5 สัปดาห์ (~3 เดือน)**  
*(ลดลงจาก 14 สัปดาห์ เพราะ backend อยู่ใน NestJS repo แยก)*

---

## FE Dependencies (this repo only)

```bash
# File upload — Cloudinary
npm install @cloudinary/url-gen cloudinary

# Testing
npm install -D vitest @testing-library/react @testing-library/user-event jsdom

# Already installed: recharts, shadcn, axios, zustand, tanstack-query
```

> Backend dependencies (Prisma, Redis, pdf-lib, etc.) live in the NestJS repo — not here.

---

## Architecture Decisions — All Resolved ✅

| # | Topic | Decision |
|---|---|---|
| 1 | Roles | Use spec: `ADMIN`, `ASSESSOR`, `MENTOR`, `ENTREPRENEUR`, `JUDGE`, `ME_TEAM` |
| 2 | Backend | NestJS — separate repo, not in this codebase |
| 3 | Auth | JWT from NestJS directly — no NextAuth |
| 4 | File Storage | Cloudinary |
| 5 | API Base URL (dev) | `http://localhost:3000/thai-rap` |
