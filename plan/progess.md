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

## Sprint 1 (จริง) — Auth เต็ม + Register ✅ DONE (2026-07-06)

ทำแทรกก่อน Sprint 3/4 ตามคำขอ user ("ทำระบบ login regis กับ แบบประเมินหน้าร้านก่อน") ข้าม Sprint 2 (Dashboard เคยทำไว้แล้วจาก Sprint 2 เดิมด้านบน แต่ยังไม่ต่อ backend จริง)

- Role type เปลี่ยนเป็น uppercase ตรง Prisma enum (`ADMIN|ASSESSOR|MENTOR|ENTREPRENEUR|JUDGE|ME_TEAM`) — ของเดิมเป็น lowercase
- แก้ auth type/token mismatch จริงจัง: backend คืน `{user, tokens:{accessToken,refreshToken,expiresIn}}` ไม่ใช่ `{user, token}` ตามที่โค้ดเดิมเขียนไว้ — แก้ `useAuthStore`, `auth-response.types.ts`, `use-login.ts`
- `services/api.ts`: unwrap `{success,data}` envelope, error envelope `{success:false,error:{code,message,details}}`, silent refresh-on-401 (single-flight guard)
- Register ใหม่ทั้งหมด: `register-form.tsx`, `use-register.ts`, `register.schema.ts` (role dropdown ไม่รวม ADMIN ตาม `RegisterDto` จริง), `/register` page
- ต่อ backend จริง (NestJS) ไม่ใช่ MSW-only — ยืนยันด้วย curl ตรง: login/register/refresh ผ่านหมด, register role=ADMIN โดน 422 ตามคาด

---

## Sprint 3 (จริง) — Restaurant Profiles ✅ DONE (2026-07-06, ต่าง จากแผนเดิม)

ต่อ backend จริง (NestJS `store` module) ตั้งแต่แรก ไม่ใช่ MSW-first ตามแผนเดิม

- `features/store/` เต็ม: types ตรง Prisma model จริง (`socialLinks`, `avgRevenue`, `photos`, `status` 12 ค่า)
- UI ปรับตาม `design/thai_rap.html` แทนภาพ mockup เดิม — `store-explorer.tsx` (filter bar + table + **inline detail panel** แทน Sheet slide-in ตามแผนเดิม) + create ผ่าน shadcn `Dialog` แทน `store-form.tsx` แยก
- ไม่ทำ: photo upload (ไม่มี file storage), `store-summary-bar.tsx` (bottom KPI+map, ไม่มี aggregate endpoint)
- ยืนยันด้วย curl จริงกับ backend: create/list/get store ผ่านหมด, shape `{items,meta}` ตรงกับ type

---

## Sprint 4 (จริง) — Assessment ✅ DONE (2026-07-06, scope ลด — ไม่มี evidence/radar)

- Backend คำนวณ dimension score/weighted total/zone/red-flag ทั้งหมด (ไม่ทำ `utils/score.ts`+`utils/red-flag.ts` ฝั่ง FE ตามแผนเดิม) — FE แค่อ่านผลจาก API
- Dimensions/50 questions เป็น seed data จริงใน DB ไม่ใช่ constant array — โหลดผ่าน `useDimensions()`
- Layout ตาม `design/thai_rap.html`: toolbar (round pills + progress) → 3 คอลัมน์ (`dimension-list.tsx` ซ้าย, `assess-table.tsx`+`question-row.tsx`+`score-button-group.tsx` กลาง, `score-summary.tsx` ขวา)
- Round selector เปลี่ยนจาก SVG ring (ที่เคยทำรอบแรกตาม design อื่น) เป็น pill tabs ตาม `design/thai_rap.html`
- ไม่ทำ: evidence upload, `evidence-cell.tsx`, `history-timeline.tsx`, radar chart (ใช้ dimension progress bar แทน), คะแนน 0-100 ต่อข้อ (เก็บ raw 0-4 ตลอด คำนวณ % แค่ระดับมิติ/รวม)
- ยืนยันด้วย e2e เต็ม (`test/assessment.e2e-spec.ts` 22/22) + curl ตรงกับ backend จริง: create→bulk score 50 ข้อ→submit→ได้ `totalScore/zone/redFlags` ถูกต้อง

---

## Config fix — เชื่อมต่อ FE↔BE จริง ✅ DONE (2026-07-06)

พบว่า `.env.local` ตั้ง `NEXT_PUBLIC_ENABLE_MOCKS=true` มาตลอด → ทุก dev/smoke test ก่อนหน้าใช้ MSW mock ไม่เคยชนกับ backend จริงเลย พอลองปิด mock เจอ 2 จุดพัง:

- Port ไม่ตรง: backend `PORT=4000`, frontend เคยตั้ง `NEXT_PUBLIC_API_URL=http://localhost:3001`
- ไม่มี `/api/v1` prefix ใน baseURL ของ frontend เลย ทั้งที่ backend ตั้ง global prefix `api/v1`

แก้ `.env.local`/`.env.example`/`constants/index.ts` ให้ตรง (`http://localhost:4000/api/v1`, mocks=false) แล้ว curl ยืนยัน full flow จริงผ่านหมด (login→register→store→assessment→submit)

---

## Next: Sprint 2 (ต่อ backend จริง) + Sprint 5

- Dashboard (`features/dashboard/`) มีอยู่แล้วจาก Sprint 2 เดิม แต่ยังใช้ MSW mock อยู่ — ต้องเช็ค/ต่อ backend จริง (ยังไม่มี Dashboard module ฝั่ง `thai-rap-api`)
- Analytics + Pitching (Sprint 5) ยังไม่เริ่ม
