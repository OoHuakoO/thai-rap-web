# Git Workflow Rules

Consistent commits and branch names make the project history readable
and enable tools like changelogs and semantic versioning.

---

## Commit Message Format

Follow Conventional Commits: `<type>(<scope>): <subject>`

```
feat(user): add create user form
fix(api): handle 401 response in interceptor
refactor(product): extract product card component
test(user): add tests for useUsers hook
chore(deps): upgrade tanstack query to v5.59
docs(readme): update setup instructions
```

### Types

| Type | When to use |
|------|-------------|
| `feat` | New feature visible to users |
| `fix` | Bug fix |
| `refactor` | Code change with no behavior change |
| `test` | Adding or updating tests |
| `chore` | Tooling, dependencies, build config |
| `docs` | Documentation only |
| `style` | Formatting, whitespace (no logic change) |
| `perf` | Performance improvement |
| `ci` | CI/CD pipeline changes |

### Scope

Use the feature folder or module name.

```
feat(user): ...
fix(auth): ...
refactor(product-catalog): ...
test(order): ...
chore(deps): ...
```

Omit scope only when a change is truly cross-cutting.

### Subject Rules

- Lowercase, no period at the end
- Imperative mood: "add", "fix", "remove" — not "added", "fixes", "removing"
- Max 72 characters
- Describe what the commit does, not what you did

```
feat(user): add pagination to user list     ✓
feat(user): Added pagination to user list   ✗
feat(user): pagination                      ✗
feat(user): WIP user list stuff             ✗
```

### Body (optional)

Use the body when the subject alone does not explain the why.

```
fix(api): retry request on network timeout

The server occasionally drops connections under load.
Retrying once covers transient failures without hiding real errors.
```

---

## Branch Naming

Format: `<type>/<short-description>`

```
feat/user-pagination
fix/auth-token-expiry
refactor/product-service
test/user-hooks
chore/upgrade-dependencies
```

Rules:
- All lowercase
- Hyphens between words, no underscores
- Short but descriptive (3–5 words max)
- Match the commit type that will be merged

Never:
```
my-branch           ✗  (no type prefix)
feature_user        ✗  (underscore)
FEAT/USER           ✗  (uppercase)
fix-the-bug-on-the-user-page-that-crashes-when-no-data  ✗  (too long)
```

---

## Commit Hygiene

### One logical change per commit

Each commit should be independently understandable.

```
feat(user): add user list component
feat(user): add create user form
feat(user): add user query hooks
```

Not:

```
feat(user): add user list, form, hooks, and fix typo in button
```

### Do not commit work-in-progress

Use `git stash` or a draft branch.
Never commit:
- Console logs left in code
- `// TODO: remove this` hacks
- Hardcoded test values
- `any` types added "for now"

### Do not amend pushed commits

If a fix is needed after pushing, create a new commit:

```
fix(user): correct email validation in create form
```

---

## Pull Request Rules

### Size

Small PRs are reviewed faster and have fewer defects.

| Size | Lines changed | Status |
|------|--------------|--------|
| Small | < 200 | Ideal |
| Medium | 200–500 | Acceptable |
| Large | 500–800 | Justify in description |
| Too large | 800+ | Split it |

If a feature is large, split into:
1. Types + service
2. Hooks
3. UI components
4. Page integration

### PR Title

Same format as commit messages: `<type>(<scope>): <subject>`

```
feat(user): implement user management feature
fix(api): handle token expiry in request interceptor
```

### PR Description Must Include

- What this PR does (1–3 sentences)
- How to test it manually
- Any migration steps if applicable
- Screenshots for UI changes

### Draft PRs

Open as draft while work is in progress.
Only mark ready for review when:

- [ ] Feature is complete
- [ ] Self-review done
- [ ] Tests written
- [ ] No console logs
- [ ] No TypeScript errors

---

## What to Never Do

```
git commit -m "fix"                          ✗  (no info)
git commit -m "WIP"                          ✗  (not complete)
git commit -m "asdfasd"                      ✗  (meaningless)
git push origin main                         ✗  (push directly to main)
git commit --amend (after push)              ✗  (rewrites history)
git push --force origin main                 ✗  (destroys history)
```

---

## Branch Protection

`main` branch must always:
- Pass all CI checks
- Be deployable at any commit
- Never receive direct pushes — only via PR

---

## Quick Reference

```
# New feature
git checkout -b feat/user-pagination

# Commit
git commit -m "feat(user): add pagination controls to user list"

# Fix
git commit -m "fix(user): show correct empty state when page has no results"

# Refactor (no behavior change)
git commit -m "refactor(user): extract UserPagination into separate component"

# Test
git commit -m "test(user): add tests for useUsers pagination params"

# Dependency upgrade
git commit -m "chore(deps): upgrade axios to 1.7.7"
```
