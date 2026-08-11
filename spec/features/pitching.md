# Pitching — `/pitching`

The judges' scoring forms and the report built from them. Two rounds,
transcribed from the programme's paper forms; the API is the authority for both
(`thai-rap-api/spec/09-pitching.md`).

**The landing page is the report, not a form.** `/pitching` is a read-only
dashboard of one store's result inside its cohort; the scoring form lives at
`/pitching/form` behind the toolbar's "เพิ่มผลการประเมิน" button and the store
card's "กรอกคะแนน" tile (which carries `?storeId=&round=` so the form opens on
the store being shown), and "ดูอันดับทั้งหมด"
opens the round's whole ranking in a paged dialog over the dashboard. There is
no standalone ranking route: the province filter and the Excel/PDF downloads
live on `/reports`' พิชชิ่ง scope, which mounts the same `PitchingReportPanel`.
This follows `design/S__37330959.jpg`, and it is what stops a judge who only
wanted to look at a result from landing in an editable form.

| `PitchingRound` | Label in the UI | Shape |
|---|---|---|
| `PITCH_DECK` | รอบคัดเลือกเข้า Incubation | 10 criteria, no sections |
| `ACCELERATION` | รอบ Incubation สู่ Acceleration | 16 criteria in หมวด A / หมวด B, plus two minimum conditions |

**Submitting a form never changes `Store.status`.** The submit confirmation says
so, because a judge would otherwise reasonably assume it does. Selection is a
committee decision taken later on the averaged scores.

## Layout

```
/pitching
└── PitchingDashboard                  owns round / store / judge
    ├── PitchingDashboardToolbar       รอบ · ร้าน · กรรมการ · + เพิ่มผลการประเมิน
    │   (every card below is a PitchingPanel — icon header + h-full body)
    ├── PitchingStoreCard              photo, province, owner, phone, level, กรอกคะแนน tile
    ├── PitchingScoreBreakdown         per-criterion bars + total, read-only
    ├── PitchingSummaryTiles           เฉลี่ย · อันดับ · เห็นควรคัดเลือก % · ข้อเสนอแนะสถานะ
    ├── PitchingJudgeOpinion           ป้ายความเห็นสรุป + เงื่อนไขขั้นต่ำ (PitchingMinimumConditionsStrip,
    │                                  ACCELERATION only) + เหตุผล quote + ทุกช่องความเห็นของรอบ
    ├── PitchingTopRanking             Top 10 (PitchingRankingList) → ดูอันดับทั้งหมด
    │   └── PitchingRankingDialog      the whole cohort, paged client-side
    ├── PitchingJudgeTable             Judge-by-Judge, paged client-side
    ├── PitchingCriteriaChart          คะแนนเฉลี่ยรายเกณฑ์ (BarChart)
    └── PitchingScoreDistribution      การกระจายคะแนนรวม (DonutChart)

/pitching/form
└── PitchingFormWorkspace              round tabs (2)
    └── PitchingFormPanel              store picker (seeded from ?storeId) → the caller's own form
        └── PitchingForm
            ├── PitchingMinimumConditionsPanel ACCELERATION only
            ├── PitchingScoreSummary           running total + the band it falls in
            ├── PitchingCriteriaTable          grouped by section
            ├── PitchingLevelBands             ช่วงคะแนน → ระดับ → ข้อเสนอแนะ, read-only
            ├── PitchingComments               per-round free-text prompts
            └── PitchingVerdict                ความเห็นสรุป + เหตุผล + ไม่มีส่วนได้เสีย

/reports (พิชชิ่ง scope)
└── PitchingReportPanel                mounted by features/report/components/report-workspace.tsx
    ├── PitchingRankingTable           province filter, downloads, click a row to drill in
    └── PitchingStoreReportPanel       averages, per-criterion bars, every judge, downloads
```

In `PitchingStoreReportPanel` the per-criterion bars are banded by colour on
PITCH_DECK but flat red on ACCELERATION; the score text beside them carries the
band in both rounds.

### Shared pieces

The three surfaces above overlap, so the repeated pieces are their own
components rather than a copy per surface:

| Piece | Used by |
|---|---|
| `PitchingLevelBadge` | store report (x2), store card, ranking table, score summary, level bands |
| `PitchingRecommendationBadge` | judge opinion, judge table, store report (verdict + the panel tally, via `suffix`) |
| `PitchingJudgeIdentity` | judge opinion, store report's per-judge card |
| `PitchingReasonQuote` | judge opinion (`purple`), store report's per-judge card (`charcoal`) |
| `PitchingMinimumConditionsStrip` | judge opinion, store report's per-judge card — the read-only twin of `PitchingMinimumConditionsPanel` on the form |
| `PitchingStoreThumbnail` | ranking list (`sm`), store card (`lg`) |
| `usePagedRows` | judge table, ranking dialog — client-side paging over rows one query already returned |

The judge's comment boxes come from `readJudgeOpinion` on both surfaces, so
neither re-derives the round's field list or its tone map.

`PitchingReportPanel` has exactly one mount now — `/reports`. It is the only
surface carrying the province filter and the ranking/report downloads, so a
change to it changes the only place they exist.

### What the dashboard reads

| Card | Source |
|---|---|
| store picker, Top 10, distribution | `usePitchingCohort(round)` — the round's whole ranking in one page |
| store card | `useStore(storeId)` — the selected store's own record |
| breakdown, tiles, opinion, judge table, criteria chart | `usePitchingStoreReport(storeId, round)` |

`usePitchingCohort` exists so the Top 10 and the donut cannot disagree about the
cohort: they are two readings of one `GET /pitching/summary` call capped at
`PITCHING_COHORT_LIMIT` (`API_MAX_PAGE_LIMIT` rows, one per store). The
"ดูอันดับทั้งหมด" dialog is a third reading of that same list — it pages the rows
already in memory (`PITCHING_RANKING_DIALOG_PAGE_LIMIT` a page) instead of
calling the endpoint again, and picking a row there selects the store and closes
the dialog — the same store change as the picker's, judge reset included.

**The ranking is also the store picker.** A `PitchingRankingRow` carries
`storeId` and `storeName`, which is the picker's whole contract, so the page
reads one store record — the selected one, for the card's photo, owner and
phone — rather than a page of full store rows to render one of them. The
consequence is that a store with no submitted form for the round is not in the
picker: it has no ranking row, and its report would be empty anyway — the empty
state says so (`noRankedStore`). Scoring one goes through `/pitching/form`,
whose own picker lists the caller's stores from `GET /stores`.

Once the cohort lands, `usePrefetchTopStoreReports` warms the reports of its
first `PITCHING_REPORT_PREFETCH_SIZE` stores into the same query key
`usePitchingStoreReport` reads, so clicking a podium row in the Top 10 renders
from cache instead of opening on a skeleton. The first of those is the store the
dashboard already selected, and `prefetchQuery` no-ops on a fresh entry, so the
warm-up costs the two speculative requests only.

The **กรรมการ picker** selects whose numbers the breakdown and the opinion show —
"ทุกกรรมการ" renders `report.criteria`'s cross-judge averages, a named judge
renders that judge's own `criteria[].score` and total.

Comments are free text and cannot be averaged, so under "ทุกกรรมการ" the opinion
panel falls back to a single judge — the first who actually wrote something
(`pickOpinionJudge`, `utils/pitching-opinion.ts`), or the first judge on the
panel when nobody did. The panel names that judge in both cases and adds a hint
that the filter is showing one judge at a time.

It prints **every comment box of the round**, not a chosen pair —
`readJudgeOpinion` reads `PITCHING_COMMENT_FIELDS[round]` and the boxes render
through `PitchingCommentBox`, the same component and tone colours the store
report uses, blank boxes included as a dashed "กรรมการไม่ได้ระบุ". The two views
therefore show a judge's write-up identically.

The three pickers narrow each other, so changing one resets the ones below it:
a new **รอบ** clears both the store (the effect then lands on the new round's
top-ranked one) and the judge, a new **ร้าน** clears the judge. On top of that
the judge is still validated against the current report — the new store's report
arrives after the store changes, and until it does the previous panel's judge
would otherwise stay selected.

### Deviations from `design/S__37330959.jpg`

- **Incubation Chance** is replaced by **กรรมการที่เห็นควรคัดเลือก**
  (`recommendationCounts.SELECTED / judgeCount`). The design's figure is the IRS,
  which lives on `GET /analytics/:storeId` — a JUDGE has no `analytics:read`, so
  the tile would be empty for this page's main audience and the call would 403.
- **No trend arrows in the Top 10.** `PitchingRankingRow` carries no previous
  rank, and the API has nothing to compare a round against. The store thumbnail
  is there: `GET /pitching/summary` returns each row's `coverUrl`, so the list
  costs no extra request per row, and a store with no photo falls back to the
  store glyph.
- **The dashboard is four bands of two cards.** store card + tiles, breakdown +
  Top 10, judge table + opinion, criteria chart + distribution. The pairs are
  chosen by how tall their content runs, and every card is a `PitchingPanel`
  (`h-full`), so the two in a band end level instead of one leaving a column of
  white space. The judge table keeps the wider half of its band — it needs
  ~580px for its six columns, and a third of the shell is ~450px.
- **The date column drops the clock time** to `formatThaiDate`, with the full
  `formatThaiDateTime` on the cell's `title`.
- **Criterion titles on the bar chart's x-axis truncate at 10 characters.**
  Recharts drops a tick that would overlap its neighbour, so a longer label
  silently removes criteria from the axis. The truncation is `BarChart`'s
  `xTickFormatter`, not the data — the tooltip carries the whole title, wrapped
  inside a 16rem cap.

## Access

`pitching:read` and `pitching:write` both belong to **SUPER_ADMIN, ADMIN and
JUDGE** and to nobody else, and `/pitching` carries `allowedRoles` on top of the
permission. ASSESSOR and MENTOR read the 50-question assessment but not
this — what a judge writes is committee material about a store that has not been
told the outcome.

JUDGE is **assignment-scoped** (`isAssignmentScopedRole`), so the store picker,
the ranking and the store directory all narrow to the stores a SUPER_ADMIN
assigned it on `/users`. A judge with no assignments sees an empty picker, which
is the intended state.

`/pitching/form` carries `pitching:write` rather than the dashboard's
`pitching:read`, and `canAccessRoute`'s longest-match rule is what makes that
entry the one it is checked against. A role that could read but not write would
get the dashboard without its "เพิ่มผลการประเมิน" link or the store card's
"กรอกคะแนน" tile — both are gated on `canRoute(ROUTES.PITCHING_FORM)` — and be
bounced off the form route. No role is in that position today.

A `?storeId=` the caller may not score is dropped: `PitchingFormPanel` derives
the selected store from the (already scope-narrowed) picker list, so an
out-of-scope id falls back to the first store instead of being requested.

The API enforces every one of these independently, and additionally restricts a
JUDGE to its own form.

## Editing model

**Nothing is written until ส่งแบบประเมิน.** `PitchingForm` holds the whole form in
one `PitchingDraft` state seeded from the server copy; every field commits into
that state on blur (or on change for the numeric readings, the checkboxes and the
verdict radio — the numbers commit as they are typed so the running total moves
with them), and
`useSubmitPitching` is the only mutation on the page — it posts the entire form
to `POST /pitching/:id/submit`, which writes it in one transaction. There is no
autosave and no draft endpoint, so **a refresh or a closed tab loses whatever
has not been submitted**; that is the accepted trade for one write.

The form is mounted with `key={pitching.id}` in `PitchingFormPanel`, which is
what seeds the draft exactly once — a background refetch answering with the
stored copy can never overwrite what is being typed, and switching store or round
mounts a fresh form instead of merging into the old draft.

The ผ่าน/ไม่ผ่าน badges on the minimum conditions come from
`evaluateMinimumConditions` in `features/pitching/utils/` rather than from
`Pitching.minimumConditions` — the server's copy is a submit behind the readings
on screen. It mirrors the API's own function; the two thresholds must change
together.

A successful submit toasts and then pushes to `ROUTES.PITCHING` — the judge lands
back on the dashboard rather than on the form they just sent.

**A submitted form reopens as a correction, not as a draft.** Submitting freezes
nothing, so `status === 'SUBMITTED'` renders exactly the same fields — but the
form says so: an info `AlertCard` above it, and the button, its confirm dialog
and its success toast switch from ส่งแบบประเมิน to บันทึกการแก้ไข
(`RESUBMIT_TEXT` in `pitching-form.tsx`). The correction wording is what the API
actually does — `totalScore` is re-frozen into the ranking while `submittedAt`,
`status` and `Store.status` are left alone.

Submitting requires (all enforced by the API, surfaced as a toast):

1. every criterion scored — `PITCH_005`
2. a verdict chosen — `PITCH_009`
3. `ACCELERATION` only: both minimum-condition readings present — `PITCH_008`

**Every numeric box refuses an out-of-range entry rather than dropping it on
blur.** A criterion score must be an integer in `0..criterion.maxScore`, the
Score Card reading an integer in `0..40`, the participation reading a number in
`0..100` — all three mirror the API's bounds (`PitchingService.updateScore` and
`UpdatePitchingDto`). A keystroke outside the bound is refused, the last accepted
value stays in the box and the field shows the range under it, so the draft can
never carry a number the API would 400 on and the box never shows one the draft
is not holding.

`PitchingScoreSummary` sits above the criteria and reads the same draft: Σ of the
scores entered so far out of Σ `maxScore`, the band that total currently falls in
(`getPitchingLevel` in `features/pitching/utils/pitching-level.ts`, mirroring the
API's cut points), that band's guidance, and how many rows are filled. An unscored
row counts as 0, so the band only ever understates the final one while the form
is incomplete — which is what the "ยังกรอกไม่ครบทุกข้อ" line under it says.

The form follows the paper form's own order, with the running total added on top:
criteria → the selection bands → committee comments → verdict.
`PitchingLevelBands` is the ส่วนที่ 2 table
(`PITCHING_LEVEL_BANDS`), read-only reference copy taken verbatim from each PDF;
the two rounds share the 80/70/60 cut points but not the guidance wording, and
the tie-break line is acceleration-only.

**Only the acceleration form has a per-criterion หลักฐาน / ข้อสังเกต field.** The
pitch deck PDF scores the row and nothing else, so `PitchingCriteriaTable` renders
the note textarea on `criterion.round === 'ACCELERATION'` alone and the API 400s
`PITCH_003` for a note sent with a pitch deck score.

The form renders **only what a judge fills in** — no evaluation header. Judge,
วันที่ประเมิน and ผลิตภัณฑ์ต้นแบบ live on the record and are read back on the
dashboard's judge table, but the form neither shows nor writes them, and
`UpdatePitchingDto` does not carry them (the API rejects them 422).

Submitting does not lock the form. Every field stays editable afterwards and
the submit button stays visible, so a judge corrects its own scoring and sends
it again; the API re-freezes `totalScore` on each score write, so the ranking
follows the correction without a resubmit.

## Starting a form

`useMyPitching` resolves to `null` when the caller has no form for that
(store, round) and the panel shows a "เริ่มกรอกแบบประเมิน" button rather than
auto-creating one — a judge browsing the store picker would otherwise leave an
empty draft on every store they looked at.

## Criteria come from the server

`Pitching.criteria` is the round's whole master list merged with whatever is
scored, so a brand-new form still renders all of its rows. The web never keeps
its own copy of the criteria text; `mocks/fixtures/pitching.fixtures.ts` mirrors
the seeded rows for mock mode only.

The per-round key lists that the web *does* hold — `PITCHING_COMMENT_FIELDS`,
`PITCHING_EVIDENCE_OPTIONS`, `PITCHING_RECOMMENDATION_OPTIONS` — must match
`pitching.const.ts` on the API, which rejects an unknown key with `PITCH_003`
or `PITCH_009`.

## Downloads

Both the ranking and a store's report download as Excel or PDF through
`DownloadButtons` (`components/shared/download-buttons.tsx`) and
`useExportPitchingRanking` / `useExportPitchingStoreReport`. Every download goes
through the axios client with `responseType: 'blob'` — an `<a href>` arrives
without the in-memory bearer token and 401s.

**The ranking file is always the whole round**, never the page on screen (the
province filter still applies). The hint under the buttons says so, matching how
the cross-store assessment export behaves.

## Province filter

The ranking takes a province, and `rank` stays each store's position in the
**whole round** — filtering does not renumber. `ALL_PROVINCES` is a sentinel
because Radix `Select` has no empty-string value; the table turns it back into an
absent query param.

The ผ่านขั้นต่ำ column is built **only for `ACCELERATION`**. `PITCH_DECK` has no
เงื่อนไขขั้นต่ำ, so the API answers `minimumPassedCount: null` there and a
"0 / 3" column would read as every judge failing a gate that form cannot record.
Both API export writers drop the same column on that round.

## Gaps

- Both rounds average, rank and export the same way. `PITCH_DECK` additionally
  feeds `analytics.kpis.incubationReadiness` (the IRS); `ACCELERATION` has no
  equivalent single KPI, because the paper form defines none — see
  `thai-rap-api/spec/09-pitching.md` §Gaps.
- No ranking-finalise flow: nothing turns a cohort ranking into a decision or a
  `Store.status`.
- The ranking filters by province only — not by level, verdict, or whether the
  minimum conditions were met. The dashboard has no search box either: the store
  picker lists one page of the cohort and is narrowed by nothing.
- `usePitchingCohort` reads one page of `PITCHING_COHORT_LIMIT` rows. A cohort
  larger than that would silently cut the Top 10's tail and the donut's counts —
  there is no guard, because a programme year is ~25 stores. The constant is
  `API_MAX_PAGE_LIMIT` — the largest one page the API will serve — so a bigger
  cohort needs the API's `PaginationDto` raised, not this number bumped.
  `pitching-dashboard.test.tsx` asserts the `limit` both of the dashboard's
  calls actually send stays within that ceiling.
- The dashboard's ranking, and therefore its store picker, is scoped to the
  stores the caller may read — for a JUDGE (`ASSIGNED`) that is its assignment
  list, so the Top 10, the donut and the picker cover those stores only. The
  `rank` and `rankedStoreCount` printed beside them are the **whole round's**,
  because the API ranks before it narrows; a judge with three stores can
  therefore read a rank of 12 out of 45 and see three rows.
- `mocks/handlers/pitching.handlers.ts` is **not role-scoped** — mock mode shows
  every fixture row to every role, the same as the assessment and report
  handlers (see [06-testing-and-mocks.md](../06-testing-and-mocks.md)). Its two
  `/export` routes return a stub blob; the real writers live on the API.
