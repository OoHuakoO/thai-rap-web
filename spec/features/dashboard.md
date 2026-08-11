# Feature: Dashboard

`features/dashboard/` — the programme overview at `/`. Seven independent cards,
each owning its own query, so one failing endpoint degrades one card instead of
the page.

## Route

`app/(dashboard)/page.tsx`, permission `dashboard:read` — every role but JUDGE
has it; a judge is on the panel, not in the programme, and lands on `/pitching`.
The page is pure composition:

```
<KpiRow />                                          full width
<ProvinceDonutCard /> <Top20Card /> <IncubationProgressCard />     lg:grid-cols-3
<ProvinceComparisonCard /> <ActivityFeedCard /> <ReportsStatusCard />
```

Scoping is server-side: an ENTREPRENEUR's `/dashboard/*` responses cover only
the stores it owns, so the same page carries no other store's numbers.

## Cards

| Component | Hook | Endpoint | Shows |
|---|---|---|---|
| `KpiRow` | `useDashboardKpis` | `GET /dashboard/kpis` | Six KPI tiles from `KPI_CARD_CONFIGS` |
| `ProvinceDonutCard` | `useProvinceDistribution` | `GET /dashboard/province-distribution` | Store count per province |
| `Top20Card` | `useTop20(round)` | `GET /dashboard/top20?round=` | Ranking table; opens `Top20Dialog` |
| `IncubationProgressCard` | `useIncubationProgress` | `GET /dashboard/incubation-progress` | Funnel toward `INCUBATION_TARGET_COUNT` (20) |
| `ProvinceComparisonCard` | `useProvinceComparison(pair)` | `GET /dashboard/province-comparison?from&to` | Round-over-round change per province |
| `ActivityFeedCard` | `useActivities` | `GET /dashboard/activities` | Same items as `/news`, newest first |
| `ReportsStatusCard` | `useReportsStatus`, `useDownloadReport` | `GET /dashboard/reports-status` | Generated-report queue + download |

Two more hooks feed the Top20 dialog rather than a card of their own:
`useStoreRoundScores` (`GET /dashboard/store-scores`) and
`useExportStoreRoundScores` (`GET /dashboard/store-scores/export`), rendered by
`StoreScoresDialog`.

## KPI configuration

`KpiRow` renders nothing itself — it maps `KPI_CARD_CONFIGS`
(`constants/dashboard-display.constants.ts`), where each entry supplies
`id`, `title`, `icon`, `accent`, and `getValue` / `getPercentage` /
`getSubtitle` accessors over `DashboardKPIs`. Adding a KPI is a config entry,
not a new component.

`DashboardKPIs` fields: `totalStores`, `targetStores`, `t0Completed`…
`t3Completed` (each with an optional `*Percentage`), `selectedStores`,
`improvedStores`, `improvementRate`, `avgScore`, `lastUpdated`.

The `*Percentage` fields are optional because the config computes a fallback:
`toPercentage(value, part, total)` returns the server's number when present,
otherwise `part / total` (and `0` when `total` is 0). So the API can either
supply the ratio or leave the client to derive it.

## Role-aware rendering

| Component | Rule |
|---|---|
| `Top20Card`, `ProvinceComparisonCard` | Hidden entirely for `ENTREPRENEUR` — cross-store comparisons are not its business |
| `ActivityFeedCard`, `ReportsStatusCard`, `Top20Card` | Footer link renders only if `canRoute(ROUTES.NEWS / REPORTS / STORES)` |
| `ReportsStatusCard` | Download button gated on `can(reports:export)` |

## Downloads

`ReportStatusItem.downloadUrl` is fetched through `api` with
`responseType: 'blob'`, never placed in an `<a href>` — the access token lives
in memory, so a plain link would hit the endpoint unauthenticated. The filename
comes from `content-disposition`, and `downloadBlob()` performs the save.

## Types

`types/dashboard.types.ts` also owns two unions other features import:

- `AssessmentRound` (`T0`–`T3`) — the same four values `assessment` calls
  `Round`. `report` imports this one.
- `DownloadedFile` = `{ blob, filename? }` — `analytics` imports the identical
  local copy rather than this one.

Both duplications are known. If they are ever consolidated, this file and
[../01-architecture.md](../01-architecture.md) need updating.

## Utils

- `format-data-date.ts` — renders `lastUpdated` as a Thai date.
- `incubation-status.ts` — maps a step to `IncubationStepStatus`
  (`completed | active | pending`) for `TimelineSteps`.

## Tests

`kpi-row`, `top20-card`, `province-comparison-card`, `reports-status-card`,
`store-scores-dialog`, `use-top20`, `dashboard.service`, both utils, and
`mocks/handlers/dashboard.handlers.test.ts`.

## Gaps

- `ReportStatusItem.status` includes `GENERATING` and `FAILED`, but nothing
  polls — the card shows whatever the last fetch returned.
- The activity feed is read-only here; creating an item happens on `/news`.
