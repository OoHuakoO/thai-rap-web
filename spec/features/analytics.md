# Feature: Analytics

`features/analytics/` — วิเคราะห์ศักยภาพ. Per-store potential analysis:
round-over-round comparison, a dimension radar, a trend line, red flags, AI
narrative, mentor recommendations, and the IDP action plan.

## Routes

| Where | Component |
|---|---|
| `/analytics` | `AnalyticsDashboard` |
| `/stores/[id]` | `StoreAnalyticsSection` — the same data embedded in the store detail page |

Access: `analytics:read` — SUPER_ADMIN, ADMIN, ASSESSOR, MENTOR, ME_TEAM.
**ENTREPRENEUR does not have it** and its `analytics` data scope is `NONE`;
this is staff tooling. `StoreAnalyticsSection` re-checks with
`hasRole(STORE_ANALYTICS_SECTION_ROLES)` because it renders inside a page an
entrepreneur can open.

## Endpoints

| Method | Path | Service method |
|---|---|---|
| GET | `/analytics/:storeId?compare&province` | `getStoreAnalytics` |
| GET | `/analytics/:storeId/radar` | `getRadar` |
| GET | `/analytics/:storeId/trend` | `getTrend` |
| GET | `/analytics/:storeId/action-plans` | `getActionPlans` |
| GET | `/analytics/:storeId/export?compare&province` | `exportAnalytics` → `{ blob, filename }` |

`getStoreAnalytics` already returns radar and trend, so the two dedicated
endpoints are only for a partial refresh. Nothing calls them today.

## Store selection

The route is not store-scoped, so the page picks one:

1. `useStores({ limit: 100, search?, province? })` — already scoped
   server-side to what the role may see.
2. An effect selects `stores[0]` when nothing is selected, or when a province
   change removes the current selection from the list.
3. `useStoreAnalytics(storeId, params)` runs with `enabled: Boolean(storeId)`.

Search is debounced 300 ms. `ALL_PROVINCES_VALUE` is the sentinel for "no
province filter" — never `''`.

## Compare pair

`ComparePair` is a template type: `` `${Round}vs${Round}` `` — `T0vsT1`,
`T1vsT2`, and so on. Sent as `?compare=`. The picker's options and
`DEFAULT_COMPARE_PAIR` live in `constants/analytics-display.constants.ts`;
`findComparePair(value)` resolves the selected string back to its config.

Query key: `analyticsKeys.store(storeId, params)` includes both `compare` and
`province ?? 'all'`, so switching either refetches rather than serving a stale
pair.

## Cards

| Component | Reads | Shows |
|---|---|---|
| `AnalyticsToolbar` | — | Store picker, compare-pair select, province filter, export button |
| `AnalyticsKpiRow` / `AnalyticsKpiCard` | `kpis` | Baseline score, comparison score, improvement %, rank, zone, incubation readiness |
| `RadarComparisonCard` + `radar-axis-tick.tsx` | `radar` | 8-axis dimension radar, one series per round |
| `TrendCard` | `trend` | Score over rounds; solid up to `actualCount`, dashed after (projection) |
| `DimensionComparisonCard` | `radar` | Per-dimension before/after |
| `HighlightListCard` | `strengths`, `weaknesses` | Top/bottom dimensions |
| `RedFlagsCard` | `redFlags` | `RedFlag[]` with severity styling |
| `AiAnalysisCard` | `aiAnalysis`, `aiInsight` | Narrative bullets + an emphasised closing line |
| `MentorRecommendationsCard` | `mentorRecommendations` | String list |
| `IncubationStatusCard` | `incubationStatus` | Status, step, `chance` 0–100 |
| `TargetCard` | `target` | Final-round goal — **skipped entirely when the API omits it** |
| `ActionPlansSection` + `ActionPlanCard` | `useActionPlans` | IDP phases `D7` / `D30` / `D90` with progress and items |

## Types

`StoreAnalytics` is one payload with everything. Fields marked optional in
`types/analytics.types.ts` are **not in the OpenAPI contract yet** and the UI
degrades without them:

| Field | Status |
|---|---|
| `aiInsight?` | Not in the contract — closing line omitted if absent |
| `target?` | Not in the contract — `TargetCard` not rendered if absent |
| `TrendSeries.actualCount?` | Not in the contract — every point treated as measured if absent |

`RadarChartData.axes` are **dimension labels straight from the API**. Never
hardcode the eight names on the client.

`AnalyticsKPIs.t0Score` / `t1Score` are named for the default pair but hold
whichever two rounds the selected `compare` names — read them as
baseline/comparison, not literally T0/T1.

## Utils

| File | Purpose |
|---|---|
| `dimension-label.ts` | Shortens an axis label to fit the radar |
| `kpi-format.ts` | Number/percentage formatting for the KPI row |
| `round-code.ts`, `series-key.ts`, `series-round-label.ts` | Map a compare pair / series to its round code and label |
| `trend-split.ts` | Splits a series into measured vs projected at `actualCount` |
| `to-bullet-lines.ts` | Splits the AI narrative into bullets, one per line |

Five of the six have unit tests — this is where the presentation logic lives, so
that is deliberate.

## Dependencies

Imports `RedFlag`, `Round` and `Zone` from `@/features/assessment` and
`useStores` from `@/features/store`. `DownloadedFile` is redeclared locally
rather than imported from `dashboard` — a known duplication.

## Verification note

Recharts renders nothing measurable in jsdom, so radar/trend layout is checked
in the browser preview: add a temporary top-level route, navigate to it last,
and measure text overlap rather than eyeballing a screenshot.

## Gaps

- No cross-store analytics view — the page is one store at a time.
- `/analytics/:storeId/radar` and `/trend` have services and no callers.
