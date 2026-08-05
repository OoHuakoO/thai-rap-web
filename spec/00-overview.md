# Overview

## What this app is

THAI-RAP Web is the operator console for a restaurant incubation programme. It
registers participating restaurants ("stores"), scores them against a fixed
50-question / 8-dimension instrument across four rounds (T0–T3), turns those
scores into analytics and downloadable reports, and manages the accounts of
everyone involved.

The root layout describes it as: *"ระบบประเมินและติดตามศักยภาพร้านอาหารในโครงการ
Thai Rap"* (`app/layout.tsx`).

The app is **client-rendered against an external API**. There is no server-side
data fetching, no `middleware.ts`, and no Next route handlers — `app/api/` does
not exist. Every page under `app/(dashboard)/` composes Client Components that
fetch through TanStack Query.

## The programme model

Four concepts drive nearly every screen:

| Concept | Meaning | Type |
|---|---|---|
| **Store** | A participating restaurant. Carries a `RAP69-XXX` code that maps it back to the offline intake workbook. | `Store` (`features/store/types/store.types.ts`) |
| **Round** | One of `T0` (ก่อนเข้าค่าย), `T1` (หลังค่าย), `T2` (Field Audit), `T3` (ติดตาม 1 เดือน). | `Round` (`features/assessment/types/assessment.types.ts`) |
| **Dimension** | One of 8 weighted scoring dimensions, seeded server-side. Never hardcoded on the client — fetched from `GET /dimensions`. | `Dimension` |
| **Zone** | A band over the weighted 0–100 total: Red < 40 ≤ Survival < 60 ≤ Improve < 75 ≤ Growth < 85 ≤ Model. | `Zone` (`features/assessment/utils/zone.ts`) |

A store's lifecycle is tracked by `StoreStatus`, which the API advances as
rounds are submitted: `REGISTERED → T0_COMPLETED → CAMP_COMPLETED →
T1_COMPLETED → PITCHING_COMPLETED → SELECTED / CONDITIONAL_SELECTED /
WAITING_LIST / NOT_SELECTED → FIELD_AUDITED → IDP_CREATED → COMPLETED`.

Programme-wide quotas live in `constants/index.ts`:
`ASSESSMENT_ROUND_STORE_COUNT = 50`, `INCUBATION_TARGET_COUNT = 20`.

## Who uses it

Eight roles, mirroring the Prisma `Role` enum in the API. Full rights in
[03-access-control.md](03-access-control.md).

| Role | Thai label | In one line |
|---|---|---|
| `SUPER_ADMIN` | ผู้ดูแลระบบสูงสุด | Everything, plus account management |
| `ADMIN` | ผู้ดูแลระบบ / PMO | Runs the programme; no account management |
| `ASSESSOR` | ผู้ประเมิน | The only staff role that scores an assessment |
| `MENTOR` | ที่ปรึกษา / Coach | Reads finished assessments; never scores |
| `ENTREPRENEUR` | ผู้ประกอบการ / ร้านค้า | Own store + own report only |
| `JUDGE` | กรรมการ Pitching | Pitching scoring only |
| `ME_TEAM` | ทีม M&E | Monitors and reads everything; writes nothing |
| `VIEWER` | ผู้ใช้ทั่วไป | Only the store fields the project discloses |

## Stack

| Concern | Choice | Notes |
|---|---|---|
| Framework | Next.js 15, App Router | React 19, `app/` only — no `pages/` |
| Language | TypeScript 5.6, `strict` | `any` and non-null assertions are ESLint errors |
| Server state | TanStack Query 5 | The only cache for API data |
| Client state | Zustand 5 (`persist`) | Auth session only — one store |
| HTTP | Axios 1.7 | One instance, `services/api.ts` |
| Forms | React Hook Form 7 + Zod 3 | `@hookform/resolvers` |
| Styling | Tailwind 3.4 + shadcn/ui (Radix) | `components.json`, `style: default`, `baseColor: slate` |
| Charts | Recharts 2.15 | Pinned exactly — not a caret range |
| Toasts | Sonner | Mounted once in `app/providers.tsx`, `position="top-right"` |
| Icons | `lucide-react`, plus PNG brand icons in `public/icons/` | |
| Tests | Vitest 4 + Testing Library + jsdom | 56 test files |
| Mocks | MSW 2 | Off by default, hard-guarded in production |

## Environment

`.env.example`:

```
NEXT_PUBLIC_API_URL=http://localhost:4000/api/v1
NEXT_PUBLIC_APP_NAME=Thai Rap
NEXT_PUBLIC_ENABLE_MOCKS=false
```

- `NEXT_PUBLIC_API_URL` — base URL of `thai-rap-api`. Every service path in
  this spec is relative to it.
- `NEXT_PUBLIC_APP_NAME` — feeds `APP_NAME`, which feeds the metadata title
  template.
- `NEXT_PUBLIC_ENABLE_MOCKS` — see [06-testing-and-mocks.md](06-testing-and-mocks.md).
  Never `true` in `.env.example`, never `true` in production (`mocks/index.ts`
  hard-returns on `NODE_ENV === 'production'`).

Timings, also fixed in `constants/index.ts`: `API_TIMEOUT_MS = 10_000`,
`QUERY_STALE_TIME_MS = 60_000`, `MAX_FILE_SIZE_BYTES = 10 MB` (mirrors the
API's own limit).

## Scripts

```bash
npm run dev          # next dev, port 3000
npm run build        # next build
npm run lint         # next lint
npm run type-check   # tsc --noEmit
npm run test         # vitest run
npm run test:watch   # vitest
npm run format       # prettier --write .
```

`.claude/launch.json` defines three preview targets: `web` (3000), `web-mocks`
(3100, `NEXT_PUBLIC_ENABLE_MOCKS=true`), and `design` (8090, serves the static
design reference in `docs/design`).

## Localisation

The UI is Thai-only. `<html lang="th">`, body font is Sarabun (Thai + Latin)
with Inter as the Latin-first fallback (`styles/fonts.ts`). There is no i18n
library and no language switch — user-facing strings live in Thai in
`*.constants.ts` files per feature. English appears only as a secondary label
in the sidebar (`NavItem.label` alongside `labelTh`).
