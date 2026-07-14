# Pull Request Review Checklist

Review the entire Pull Request and verify every item below.

Do not skip any checklist item.

If an item is not applicable, explicitly mark it as N/A.

Each section maps to a rule file in `.claude/rules/` — cite it when flagging
a violation rather than asserting a generic best practice.

---

# UI Copy & Hardcoded Values ([text-constants.md](../rules/text-constants.md), [no-hardcode.md](../rules/no-hardcode.md))

* [ ] No raw Thai/English string literal inside JSX.
* [ ] Dynamic copy is a function in the constants file, not a template string in the component.
* [ ] Zod validation messages come from `<SCOPE>_VALIDATION_MESSAGES`, not inlined.
* [ ] Routes use `ROUTES.*`, not raw path strings.
* [ ] Query keys use the feature's `<name>Keys` object, not raw arrays.
* [ ] Colors in JS/dynamic styles use `colors` from `@/styles/tokens`, not hex literals.

---

# File Uploads ([file-upload-patterns.md](../rules/file-upload-patterns.md)) — N/A if PR has none

* [ ] Service method named for what it uploads, not a generic `upload()`.
* [ ] Picker vs Manager shape matches where the upload happens.
* [ ] Delete goes through `useConfirm`, not a bare click.
* [ ] `e.target.value = ''` reset after reading the file.
* [ ] File size validated client-side before upload.

---

# MSW Handlers ([msw-patterns.md](../rules/msw-patterns.md)) — N/A if PR has none

* [ ] One handler file per domain, using factories/fixtures.
* [ ] All 4 error scenarios (`X-Mock-Scenario`) supported.
* [ ] Registered in `mocks/handlers/index.ts`.

---

# Feature Completeness

* [ ] Feature solves the intended business requirement.
* [ ] User flow is complete.
* [ ] No obvious missing functionality.
* [ ] Empty state handled.
* [ ] Loading state handled.
* [ ] Error state handled.
* [ ] Success state handled.

---

# Correctness

* [ ] No obvious logical bugs.
* [ ] Edge cases considered.
* [ ] Async operations handled correctly.
* [ ] Null and undefined cases handled.
* [ ] No race condition risks identified.
* [ ] No inconsistent state transitions.

---

# Architecture

* [ ] Existing project architecture followed.
* [ ] Existing project patterns followed.
* [ ] No unnecessary new patterns introduced.
* [ ] Responsibilities properly separated.
* [ ] Business logic not mixed with UI.
* [ ] No architecture violations detected.

---

# Components

* [ ] Components have a single responsibility.
* [ ] Components remain reasonably sized.
* [ ] Reusable UI extracted when appropriate.
* [ ] No excessive prop drilling.
* [ ] Component names are clear and consistent.

---

# Hooks

* [ ] Custom hooks extracted when appropriate.
* [ ] Hooks follow existing conventions.
* [ ] Hook responsibilities are clear.
* [ ] No duplicated hook logic.

---

# State Management

* [ ] Server state handled by TanStack Query.
* [ ] Zustand only used for client-side state.
* [ ] No duplicated state.
* [ ] State ownership is clear.

---

# TanStack Query

* [ ] Query keys follow project convention.
* [ ] Query keys are centralized.
* [ ] useQuery used for reads.
* [ ] useMutation used for writes.
* [ ] Query invalidation implemented correctly.
* [ ] Loading state handled.
* [ ] Error state handled.

---

# API Layer

* [ ] API logic is centralized.
* [ ] No API calls inside presentation components.
* [ ] Services are reusable.
* [ ] Error handling is consistent.
* [ ] API contracts appear consistent.

---

# Forms

* [ ] React Hook Form used appropriately.
* [ ] Zod validation implemented.
* [ ] Validation messages provided.
* [ ] Submit states handled.

---

# TypeScript

* [ ] No unnecessary any usage.
* [ ] Types are reusable.
* [ ] Interfaces are consistent.
* [ ] No unsafe type assertions.
* [ ] Type safety maintained.

---

# Performance

* [ ] No duplicate API requests.
* [ ] No obvious unnecessary renders.
* [ ] No unnecessary state updates.
* [ ] No premature optimization.
* [ ] Memoization used only when justified.

---

# Security

* [ ] User input validated.
* [ ] Authorization rules respected.
* [ ] Authentication flow preserved.
* [ ] Sensitive data not exposed.
* [ ] No obvious XSS risks.
* [ ] Environment variables handled correctly.

---

# Accessibility

* [ ] Semantic HTML used.
* [ ] Form fields have labels.
* [ ] Keyboard navigation supported.
* [ ] Interactive elements accessible.
* [ ] No obvious accessibility violations.

---

# Consistency

* [ ] Naming conventions followed.
* [ ] Folder structure consistent.
* [ ] File organization consistent.
* [ ] Error handling consistent.
* [ ] API usage consistent.
* [ ] Query patterns consistent.

---

# Duplication

* [ ] No duplicated business logic.
* [ ] No duplicated API logic.
* [ ] No duplicated validation logic.
* [ ] No duplicated types.
* [ ] No duplicated query logic.

---

# Regression Risk

* [ ] Shared components reviewed.
* [ ] Shared hooks reviewed.
* [ ] Shared services reviewed.
* [ ] Existing functionality unlikely to break.
* [ ] Backward compatibility maintained.

---

# Technical Debt

* [ ] No significant technical debt introduced.
* [ ] New shortcuts are justified.
* [ ] Future maintenance cost acceptable.

---

# Final Assessment

Provide:

1. Feature Summary
2. Strengths
3. Issues Found
4. Regression Risks
5. Technical Debt Introduced
6. Recommendation

Recommendation must be one of:

* Approve
* Approve with Minor Changes
* Request Changes
* Major Rework Required
