# Feature: Assessment

`features/assessment/` — the 50-question scoring instrument, run once per store
per round. The most stateful feature in the app.

## Domain model

| Concept | Detail |
|---|---|
| Round | `T0` ก่อนเข้าค่าย, `T1` หลังค่าย, `T2` Field Audit, `T3` ติดตาม 1 เดือน |
| Dimension | 8 weighted dimensions, seeded server-side, fetched from `GET /dimensions` and cached with `staleTime: Infinity` |
| Question | `questionNo`, `questionText`, `maxScore` (per-question, not a global 0–4) |
| Status | `DRAFT → IN_PROGRESS → SUBMITTED → APPROVED` |
| Red flag | 8 types (`FOOD_SAFETY` … `GROWTH`) × `WARNING \| CRITICAL`, raised by the API from trigger questions |
| Zone | Band over the weighted 0–100 total (`utils/zone.ts`) |

`Assessment` carries two score fields that must not be confused:

- `totalScore` — the **frozen** result; `null` until the round is submitted.
- `currentScore` — the weighted score of whatever is scored right now; equals
  `totalScore` once submitted.

## Routes

| Route | Component | Behaviour |
|---|---|---|
| `/assessment` | `AssessmentEntry` | Redirector — never renders content |
| `/assessment/[storeId]` | `RoundPicker` | Choose a round for a known store |
| `/assessment/[storeId]/[round]` | `AssessmentForm` | The scoring form |

Access: `assessment:read` **and** `allowedRoles: [SUPER_ADMIN, ADMIN, ASSESSOR,
MENTOR]`. ME_TEAM reads results through reports/analytics instead.

`AssessmentEntry` fetches the first accessible store, finds the first round that
is not yet completed (falling back to `T3`), and `router.replace`s to
`ASSESSMENT_DETAIL(storeId, round)`. It renders `<Loading />`, an error message,
or `EMPTY_STORE_MESSAGE` — never a page of its own.

The `[round]` page is the only one in the app with logic: it validates the
segment with `isValidRound()` and calls `notFound()`, which
`app/(dashboard)/not-found.tsx` catches inside the shell.

## Endpoints

| Method | Path | Service method |
|---|---|---|
| GET | `/dimensions` | `dimensionService.getAll` |
| GET | `/assessments?storeId&round&limit` | `findByStoreAndRound`, `findAllByStore` |
| GET | `/assessments/:id` | `getById` |
| GET | `/assessment/:storeId/history` | `getHistory` — note the **singular** path segment |
| GET | `/assessments/rank?storeId&round` | `getRank` |
| POST | `/assessments` | `create({ storeId, round })` |
| PUT | `/assessments/:id/scores/:questionId` | `updateScore` |
| PATCH | `/assessments/:id/draft` | `saveDraft` |
| POST | `/assessments/:id/submit` | `submit` |
| PATCH | `/assessments/:id/notes` | `updateNotes` |
| POST | `/assessments/:id/scores/:questionId/evidence` | `uploadEvidence` |
| DELETE | `/assessments/:id/evidence/:evidenceId` | `deleteEvidence` |

There is no "get by store and round" endpoint — the list endpoint is queried
with `limit: 1` and the first item taken.

## The open-a-round flow

Opening a round that has no assessment **creates** one. That is a write, and it
is deliberately not in the `queryFn`:

```
useAssessment(storeId, round, { canCreate })
  ├── useQuery   → findByStoreAndRound → getById  ⟶  Assessment | null
  └── useMutation(create)   fired from an effect when the query resolves to null
```

Why it is split:

- A `queryFn` retries (and React Strict Mode double-invokes), so a POST inside
  it would create duplicate assessments.
- `canCreate` must be false for a read-only role. A MENTOR reaches this page on
  `assessment:read` alone; an ungated auto-create would 403, and the
  interceptor's hard redirect to `/errors/403` would lock the role out of the
  page entirely.
- The "already tried" flag is a `useRef` keyed on `storeId:round`, not the
  mutation's own `isIdle` — switching rounds via `RoundPills` reuses the same
  hook instance, so mutation state would never reset for the next round.

The hook returns `{ data, isLoading, isError, error, isMissing, retry }`.
`isMissing` means "this round has no assessment and you may not start one".
`retry()` clears the ref so a failed create can be retried without a reload.

## Round locking

`REQUIRED_PRIOR_ROUND` (mirrors the API's `AssessmentService`):

| Round | Requires |
|---|---|
| T1 | T0 completed |
| T2 | T1 completed |
| T3 | T1 completed |

"Completed" means `SUBMITTED` **or** `APPROVED` (`isCompletedStatus`).
`getMissingPriorRound(summaries, round)` returns the blocker, and
`AssessmentForm` renders `AssessmentNotice` instead of the questions. While
summaries are still loading it returns `null`, so the locked notice never
flashes for a round that turns out to be open.

`getLatestCompletedRound()` is what store-level figures (rank, dimension scores,
weak points) read from — never the round currently open in the form, or a T1
draft with two questions scored would overwrite the T0 result on display.

## `AssessmentForm`

Layout component; behaviour lives in `useAssessmentFormActions`.

```
AssessmentStorePicker      switch store without leaving the page
AssessmentFormHeader       store name, round, status
RoundPills                 T0–T3, locked rounds disabled
ProgressBar                scored / total
AssessmentNotice           locked-round or read-only banner
DimensionList              8 dimensions, click to filter
AssessTable                QuestionRow[] → ScoreButtonGroup, note, suggestion, evidence
ScoreSummary               weighted total, Zone, rank, improvement points
TimelineArea               per-round history card
AssessmentOverallSummary   cross-round roll-up (admin only)
```

Permission behaviour inside the form:

| Check | Effect |
|---|---|
| `can(assessment:write)` false | Everything renders read-only; `canCreate` false |
| `hasRole([SUPER_ADMIN, ADMIN])` | May correct an already-submitted round (the API's `assertEditable` allows exactly these two) and sees `AssessmentOverallSummary` |

`ScoreButtonGroup` renders `maxScore + 1` buttons (`0..maxScore`) from the
question's own `maxScore`, with `aria-pressed` and a colour per value.
`SCORE_LABELS` supplies the Thai wording under the selection.

## Score saving

`useUpdateScore` **patches** the cache rather than refetching:

1. Replace the returned question inside the cached `Assessment`.
2. Recompute `currentScore` with `calcWeightedTotal(questions, dimensions)` —
   the PUT response carries no roll-up.
3. Invalidate `assessmentKeys.history` (saving also reassigns the assessor).
4. **If the round was already submitted**, additionally invalidate
   `byStoreRound`, `byStore`, `rank`, and `storeKeys.detail` — the API
   re-freezes `totalScore` and rebuilds the red flags, none of which the
   single-question response carries.

Refetching 50 questions per save would be the wrong trade; step 4 is what keeps
the correction path honest.

## Submit

`useSubmitAssessment` invalidates five keys: `byStoreRound`, `byStore`, `rank`,
`history`, and `storeKeys.detail(storeId)` — submission can advance
`Store.status` and moves this store's rank among the others.

## Evidence uploads

Manager shape against an existing assessment. `EVIDENCE_ACCEPT` is
`image/jpeg,image/png,image/webp,application/pdf,.xlsx` — deliberately narrower
than the generic document set, mirroring the API's extension whitelist. Offering
`.docx`/`.csv` would only let a user pick a file the upload then rejects.

## Utils

| File | Purpose |
|---|---|
| `zone.ts` | `getZone(total)` + `ZONE_COLORS` / `ZONE_BADGE_CLASSES` / `ZONE_DESCRIPTIONS`; `IMPROVEMENT_POINTS_COUNT = 3` |
| `round.ts` | `isValidRound`, `REQUIRED_PRIOR_ROUND`, `isRoundCompleted`, `getLatestCompletedRound`, `getMissingPriorRound` |
| `status.ts` | `isCompletedStatus` |
| `dimension-score.ts` | `calcWeightedTotal` and per-dimension percentages |
| `overall-summary.ts` | Cross-round roll-up for the admin summary |

`getZone()` duplicates the API's `assessment-scoring.util.ts` because the card
also labels the running score of a round the API has not frozen a zone for yet.
**Thresholds must change in both places.**

## Tests

Five util suites, `use-assessment`, `assessment.service`, `assessment-form`,
`score-summary`, `timeline-area`, and
`mocks/handlers/assessment.handlers.test.ts`.

## Gaps

- MENTOR has no place to write. Its real outputs (IDP, mentoring log, report
  notes) belong to pages that do not exist yet — granting `assessment:write`
  is **not** the way to give it a text box.
- `assessment:delete` exists in the matrix with no UI behind it.
- Nothing in the UI moves a round from `SUBMITTED` to `APPROVED`.
