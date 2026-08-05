# THAI-RAP Web — Frontend Specification

This folder describes **what the frontend is** — its pages, its domains, its
data flow, and the contracts it holds with `thai-rap-api`. It is written from
the code as it stands, not from a plan, so every table here should be
verifiable against a file in this repo.

It is deliberately separate from `.claude/rules/`, which describes **how to
write code here** (naming, linting, patterns, checklists). When a rule already
covers something, this spec links to it instead of restating it.

The split is load-bearing, not cosmetic: a rule is normative and holds whether
or not the code obeys it, while everything here is a snapshot that the next
commit can invalidate. So **inventories, counts, and known deviations live here,
never in a rule** — `.claude/rules/README.md` states the same contract from the
other side. Every feature spec ends in a **Gaps** section for exactly this.

| If you want to know… | Read |
|---|---|
| What the product is, who uses it, what it runs on | [00-overview.md](00-overview.md) |
| How the code is layered and what may import what | [01-architecture.md](01-architecture.md) |
| Every route, what renders it, and what guards it | [02-routing.md](02-routing.md) |
| Roles, permissions, data scopes, route/UI gating | [03-access-control.md](03-access-control.md) |
| Axios client, services, query keys, cache invalidation, errors | [04-data-layer.md](04-data-layer.md) |
| Design tokens, layout shell, shared/ui components | [05-ui-system.md](05-ui-system.md) |
| Vitest setup and the MSW mock layer | [06-testing-and-mocks.md](06-testing-and-mocks.md) |
| One specific domain | [features/](features/) |

## Feature specs

| Domain | Spec | Main route |
|---|---|---|
| Auth | [features/auth.md](features/auth.md) | `/login`, `/register`, `/forgot-password` |
| Dashboard | [features/dashboard.md](features/dashboard.md) | `/` |
| Store | [features/store.md](features/store.md) | `/stores` |
| Assessment | [features/assessment.md](features/assessment.md) | `/assessment` |
| Analytics | [features/analytics.md](features/analytics.md) | `/analytics` |
| Report | [features/report.md](features/report.md) | `/reports` |
| News | [features/news.md](features/news.md) | `/news` |
| User | [features/user.md](features/user.md) | `/users` |
| Reference data | [features/reference-data.md](features/reference-data.md) | — (province, store type) |

## Keeping this accurate

A spec that drifts is worse than no spec. When a change makes a statement here
wrong, fix the statement in the same PR — the same way `openapi.yaml` is
regenerated rather than left stale. In particular:

- Adding a route → [02-routing.md](02-routing.md) **and** [03-access-control.md](03-access-control.md)
- Adding a permission or changing the matrix → [03-access-control.md](03-access-control.md)
- Adding a service method or query key → [04-data-layer.md](04-data-layer.md) + the feature spec
- Adding a feature folder → a new file under `features/`, listed in the table above

## Conventions used in this folder

- Paths are repo-relative from `thai-rap-web/`.
- Thai strings are quoted exactly as they appear in the UI — they are the
  product's real copy, not a translation.
- "The API" means `thai-rap-api`, reached over `NEXT_PUBLIC_API_URL`. It is a
  separate origin and a separate deployment.
- **Gap** marks something the UI expects but the API does not serve yet, or the
  reverse. These are known, not accidents.
