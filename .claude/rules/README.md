# Rules

These files define **how code is written in this project** — naming, layering,
patterns, and the checklists that go with them. They are normative: a rule holds
whether or not the code currently obeys it.

## Rules vs. spec

| | `.claude/rules/` | `spec/` |
|---|---|---|
| Answers | How should I write this? | What does the app currently do? |
| Nature | Normative — a standard | Descriptive — a snapshot |
| Goes stale when | The standard changes | The code changes |
| Example | "Query keys come from a `*Keys` object" | "`storeKeys` has `all`, `list`, `detail`, `stats`" |

A rule that describes the code goes stale silently, because nothing breaks when
it stops being true. That has already happened here more than once: a "Gap
today: no component calls `can()`" note survived long after eleven components
called it, and a component inventory listed six shadcn primitives that were
never installed. Both read as instructions and both were wrong.

## Do not put these in a rule

- **Inventories.** File lists, installed-component lists, endpoint lists,
  permission tables. Point at the directory or at `spec/`.
- **Defect claims.** "`x.tsx` does this today", "this is duplicated in two
  places", "**Gap today:** …". A known deviation belongs in the relevant
  `spec/features/*.md` under **Gaps**, where it sits next to the rest of that
  feature's current state and gets read when someone works on it.
- **Counts and statuses.** "There are 8 dimensions", "no page uses this yet".

## Do put these in a rule

- The standard itself, stated timelessly.
- The reasoning behind it — especially a non-obvious constraint, since that is
  what stops someone "simplifying" it back.
- A DO / DON'T pair. Write the DON'T generically; naming a real offending file
  turns the example into a defect claim that expires.
- A reference implementation to copy from (`store.handlers.ts` for role-aware
  mocks). A pointer stays useful even as that file evolves; a description of it
  does not.
- A checklist for the change the rule governs.

## When you touch code a rule describes

Re-read the rule. If the change makes a sentence in it false, fix the sentence
in the same PR — and if the false sentence was a defect claim, that is a signal
it should not have been in a rule at all. Move it to `spec/` instead of
updating it in place.

## Files

| File | Covers |
|---|---|
| `frontend-rules.md` | General principles, TypeScript, React, state, forms, styling, performance, a11y |
| `naming-conventions.md` | Files, folders, components, hooks, services, types, schemas, keys, stores, handlers, booleans |
| `feature-structure.md` | `features/<domain>/` layout, the barrel, cross-feature imports, layer dependencies |
| `nextjs-app-router.md` | Server vs Client components, page files, `loading`/`error`, metadata |
| `auth-permissions.md` | Roles, permissions, data scopes, route guards, component gating |
| `state-management.md` | Zustand store structure, `persist`/`partialize`, hydration gate |
| `error-handling-patterns.md` | The four error layers, toast vs inline, form errors |
| `error-pages.md` | `app/errors/<code>/` status pages vs `error.tsx` boundaries |
| `file-upload-patterns.md` | Picker vs manager shapes, `accept` sets, size limits, previews |
| `text-constants.md` | Thai UI copy in `*.constants.ts`, dynamic copy, Zod messages |
| `no-hardcode.md` | Routes, query keys, colours, magic numbers, endpoints, env vars |
| `shadcn-component-rules.md` | Building on `components/ui/` primitives, charts, loading states |
| `typescript-advanced.md` | Discriminated unions, type guards, `as const`, `satisfies`, utility types |
| `linting-config.md` | ESLint rules in force, Prettier config, import order |
| `testing.md` | What to test, where, and how to name it |
| `msw-patterns.md` | `mocks/` structure, adding a domain, scenarios, role-aware handlers |
| `git-workflow.md` | Conventional commits, branch names, PR size and content |
