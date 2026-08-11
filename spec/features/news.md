# Feature: News

`features/news/` — ข่าวประชาสัมพันธ์. Announcements every role but JUDGE can
read, and only the admin pair can publish.

## Routes

| Route | Page composition | Permission |
|---|---|---|
| `/news` | `NewsPageHeader mode="list"` + `NewsList` | `news:read` — **every role but JUDGE** |
| `/news/new` | `NewsPageHeader mode="create"` + `CreateNewsForm` | `news:write` — SUPER_ADMIN, ADMIN |
| `/news/[id]/edit` | `NewsPageHeader mode="edit"` + `EditNewsForm` | `news:write` |

`/news` carries no `allowedRoles` gate — `news:read` alone decides, and every
role but JUDGE holds it, VIEWER included. The two write pages sit **below** it
in the path, so `canAccessRoute`'s longest-match rule checks them against
`news:write` rather than inheriting `/news`'s `news:read`. `/news/[id]/edit`
matches through
`ROUTES.NEWS_EDIT_PATTERN` (`/news/:id/edit`), because a route function cannot
be matched against a visited path.

## Endpoints

| Method | Path | Service method |
|---|---|---|
| GET | `/news?type&limit` | `getAll(query)` → `NewsItem[]` (plain array, not paginated) |
| GET | `/news/:id` | `getById(id)` |
| POST | `/news` | `create(dto)` |
| PATCH | `/news/:id` | `update(id, dto)` |
| DELETE | `/news/:id` | `remove(id)` |

## Hooks

| Hook | Key | Notes |
|---|---|---|
| `useNews(query)` | `newsKeys.list(query)` | Key normalises the query: `type ?? 'all'`, `limit ?? null` |
| `useNewsItem(id)` | `newsKeys.detail(id)` | `enabled: Boolean(id)` |
| `useCreateNews` / `useUpdateNews(id)` / `useDeleteNews` | — | Each invalidates `newsKeys.all` **and** `dashboardKeys.activities()` |

That second invalidation is the point of this feature's only cross-feature
dependency: the dashboard's activity feed renders the same items, and without it
a freshly published announcement is missing from the home page until the cache
expires.

## Types

```ts
type NewsType = 'GENERAL' | 'EVENT' | 'ALERT';

interface NewsItem {
  id; type; title; description;
  urgent: boolean;
  publishedAt; authorId; authorName;
}
```

`urgent` is independent of `type` — an `EVENT` can be urgent, and an `ALERT`
need not be. The list styles them separately.

`CreateNewsDto.publishedAt` is optional; the API defaults it to now.

## Components

| Component | Notes |
|---|---|
| `NewsList` | Card list, type filter (`ALL_TYPES` sentinel = `'all'`), Thai dates via `formatThaiDate`. Edit/delete buttons gated on `can(news:write)` / `can(news:delete)`; delete goes through `useConfirm` with copy from `NEWS_DIALOG_TEXT` |
| `NewsForm` | The shared field block |
| `CreateNewsForm` / `EditNewsForm` | Thin wrappers — create posts, edit loads via `useNewsItem` then patches |
| `NewsPageHeader` | `mode: 'list' \| 'create' \| 'edit'`; the "create" button on the list mode is permission-gated |

Display config (`NEWS_TYPE_DISPLAY`, `NEWS_TYPE_OPTIONS`) and all copy live in
`constants/news.constants.ts`.

## Barrel

```ts
export { CreateNewsForm, EditNewsForm, NewsList, NewsPageHeader };
export { useNews };
export type { NewsItem, NewsType };
```

`useNewsItem` and the mutation hooks are internal — only the two forms use them.

## Tests

`news-list`, `news.service`.

## Gaps

- No detail route. A `NewsItem` is only ever read in the list.
- `GET /news` is unpaginated; `limit` is the only bound.
- `authorName` is displayed but there is no author filter.
