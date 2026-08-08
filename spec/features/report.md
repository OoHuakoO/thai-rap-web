# Feature: Report

`features/report/` — รายงานผลการประเมิน. Read-only renderings of submitted
assessments, plus Excel/PDF export. Where analytics interprets, reports state.

## Routes

| Where | Component |
|---|---|
| `/reports` | `ReportPageHeader` + `ReportWorkspace` |
| `/stores/[id]` | `StoreReportSection` — the same per-store report embedded in the detail page |

Access: `reports:read` — every role except JUDGE and VIEWER, **including
ENTREPRENEUR**, whose `reports` scope is `OWN`.

## The three scopes

`ReportWorkspace` builds its scope list from three independent role checks, then
renders whatever survives. They read three different APIs, so a role holding
`reports:read` does not necessarily reach all of them:

| Scope | Gate | Roles |
|---|---|---|
| รายงานรายร้าน | `REPORT_ASSESSMENT_ROLES` | SUPER_ADMIN, ADMIN, ASSESSOR, MENTOR, ENTREPRENEUR |
| รายงานทุกร้าน (รายมิติ) | `REPORT_DETAIL_ROLES` | SUPER_ADMIN, ADMIN |
| รายงานพิชชิ่ง | `REPORT_PITCHING_ROLES` | SUPER_ADMIN, ADMIN, JUDGE |

A JUDGE is the mirror image of an ASSESSOR here: it holds `reports:read` for the
พิชชิ่ง scope alone and would get nothing but 403s from the other two.

A single remaining scope renders **bare** — a one-tab strip over the page is
chrome that decides nothing. No available scope renders an info card rather than
an empty page.

### Pitching scope

Mounts `PitchingReportPanel` from `@/features/pitching` under a round tab strip,
the same component `/pitching` renders — see
[features/pitching.md](pitching.md). Nothing report-specific lives here.

### Store scope

Store picker (`useStores({ limit: 100 })`, already server-scoped — for an
entrepreneur it is a "my store" selector) plus a round tab strip:

| Tab | Component | Hook | Endpoint |
|---|---|---|---|
| ภาพรวมทุกรอบ | `OverviewReportPanel` | `useOverviewReport(storeId)` | `GET /reports/stores/:id/overview` |
| T0 / T1 / T2 / T3 | `RoundReportPanel` (+ `RoundQuestionDetail`) | `useRoundReport(storeId, round)` | `GET /reports/stores/:id/rounds/:round` |

### Matrix scope (admin only)

`RoundMatrixPanel` — every accessible store's dimension scores for one round,
side by side. `useRoundMatrix(round, { page, limit })` →
`GET /reports/rounds/:round/stores`.

- Pages like the store directory (`DEFAULT_MATRIX_PAGE_LIMIT = 25`) because it
  is one row per store across the whole programme.
- `placeholderData: keepPreviousData` — the table runs to ~40 columns, and
  blanking it to a skeleton on every page change loses the reader's place.
- `averageByDimension` and `averageWeightedScore` are computed over **every**
  store in the round, not the page, so paging never moves them.
- The **export is never paged**: `matrixDownloadHint` says so next to the
  buttons, because a download that stopped at the visible rows would have to be
  stitched together by hand.

## Export endpoints

| Method | Path | Service method |
|---|---|---|
| GET | `/reports/stores/:id/rounds/:round/export?format` | `exportRoundReport` |
| GET | `/reports/stores/:id/overview/export?format` | `exportOverviewReport` |
| GET | `/reports/rounds/:round/stores/export?format` | `exportRoundMatrix` |

`ReportFileFormat` is `'xlsx' | 'pdf'`. All three use `responseType: 'blob'` and
parse the filename out of `content-disposition`. Each panel owns one hook from
`hooks/use-export-report.ts` — `useExportRoundReport`,
`useExportOverviewReport`, `useExportRoundMatrix` — and renders the shared
`ReportDownloadButtons`, which offers both formats, shows `downloading`
("กำลังสร้างไฟล์...") while in flight and `downloadSuccess` after.

Export requires `reports:export`, which every role holding `reports:read` also
holds.

## Report shapes

| Type | Contains |
|---|---|
| `RoundReport` | Store, round, `totalScore` (weighted), `zone`, assessor, `submittedAt`, `notes`, `rawScore`/`maxScore`/`rawScorePct`, `completionPct`, `dimensions: ReportDimensionDetail[]`, `redFlags` |
| `ReportDimensionDetail` | A dimension **plus the arithmetic**: `rawScore`, `maxScore`, `weightedScore`, and the `questions[]` behind it |
| `OverviewReport` | Store, `rounds: OverviewRoundSummary[]` (score + `delta` per round), `dimensionTrends` (score per dimension per round), `unresolvedRedFlagCount` |
| `RoundMatrixReport` | `dimensions`, `rows: RoundMatrixRow[]`, `averageByDimension`, `averageWeightedScore`, `meta` |
| `RoundMatrixRow` | Store identity, `completionPct`, raw + weighted scores, `overallLevel`, red-flag counts, `criticalDimension*`, `scoresByDimension` |

The per-question breakdown (`ReportDimensionDetail.questions` in
`RoundQuestionDetail`) is admin-only too — `RoundReportPanel` re-checks
`REPORT_DETAIL_ROLES`, matching the API, which 403s the matrix for everyone
else. Other roles keep the report exactly as it was: their own store, scores per
dimension.

## Two different score scales

Easy to conflate; they are not the same thing.

| Scale | Values | Source | Styling |
|---|---|---|---|
| **Zone** | Red / Survival / Improve / Growth / Model Zone | `getZone()` in `assessment` (and the API) | `ZONE_BADGE_CLASS` |
| **ระดับรวม** (`overallLevel`) | เร่งแก้ไข / ต้องพัฒนา / ดี / ดีมาก | `getOverallLevel()` in the API only | `OVERALL_LEVEL_BADGE_CLASS` |

Both badge maps live in `constants/report.constants.ts`, keyed by the exact
label string the API returns. The web adds only the colours.

## Text constants

`REPORT_TEXT` is the largest constants object in the app — every column header,
tab label, empty state, and the weighted-score formula string
(`weightedFormula(scorePct, weight, weighted)` → `"82.00% × 15% = 12.30"`).

Dimension columns in the matrix use `dimensionShortLabel(id, weight)` →
`"มิติ 3 (15%)"`, with the full name in a tooltip: eight full names would push
the table several screens wide.

## Dependencies

Imports `AssessmentRound` and `DownloadedFile` from `@/features/dashboard`,
`useStores` from `@/features/store`, and `PitchingReportPanel` +
`PITCHING_ROUNDS` + `PITCHING_ROUND_LABELS` from `@/features/pitching` — all
through the barrel.

## Tests

`overview-report-panel`, `round-report-panel`, `round-matrix-panel`,
`report-workspace`, `report.service`, and
`mocks/handlers/report.handlers.test.ts`.

## Gaps

- Only submitted rounds appear. There is no draft preview.
- The store picker fetches a flat 100 stores (`STORE_PAGE_SIZE`) with no
  pagination — fine at programme scale (50 stores), not beyond it.
