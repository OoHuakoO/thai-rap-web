---
name: add-zustand-store
description: Add a new Zustand store for client-side UI state — modal, wizard, theme, or auth-like session state. Follows state-management.md using stores/auth-store.ts as the reference implementation.
---

# Add Zustand Store

Add a store following [state-management.md](../rules/state-management.md).
Read that file first for the full rationale — this skill is the
step-by-step.

## Before Starting

Confirm this is genuinely Zustand territory, not TanStack Query territory
(see [frontend-rules.md](../rules/frontend-rules.md)'s State Management
section):

- API data / server state / cached responses → **TanStack Query**, not Zustand
- UI state, modal state, wizard state, theme, or session state that must
  survive a reload → **Zustand**

If you're about to `setState` with data that came back from `api.get(...)`,
stop — that belongs in a query hook instead.

---

## Step 1: Create the File

`stores/<name>-store.ts` — kebab-case, `-store.ts` suffix. The exported hook
carries the `use` prefix and casing, not the filename.

```ts
// stores/wizard-store.ts
import { create } from 'zustand'

interface WizardState {
  step: number
  next: () => void
  back: () => void
  reset: () => void
}

export const useWizardStore = create<WizardState>((set) => ({
  step: 0,
  next: () => set((state) => ({ step: state.step + 1 })),
  back: () => set((state) => ({ step: Math.max(0, state.step - 1) })),
  reset: () => set({ step: 0 }),
}))
```

State fields first, action methods after, all on one object — don't split
state and actions into separate stores for one domain.

---

## Step 2: Add `persist` Only If It Must Survive a Reload

Most UI state (modal open/closed, current wizard step) resets fine on
reload — skip `persist` entirely for those. Add it only when losing the
value on refresh would be a real problem (auth session, a long
multi-page wizard).

```ts
import { persist } from 'zustand/middleware'

export const useWizardStore = create<WizardState>()(
  persist(
    (set) => ({ ... }),
    { name: 'wizard-storage' }
  )
)
```

---

## Step 3: `partialize` if Anything Sensitive Is in the Store

If the store holds a token, credential, or anything else that shouldn't sit
in `localStorage` in plaintext, `partialize` is mandatory — it's the
allowlist of fields that actually get persisted. Everything else stays
in-memory only.

```ts
// stores/auth-store.ts (reference)
{
  name: 'auth-storage',
  partialize: (state) => ({
    user: state.user,
    isAuthenticated: state.isAuthenticated,
    // accessToken deliberately excluded — see state-management.md
  }),
}
```

Add a one-line comment above the store explaining *what's* excluded and
*why* — that reasoning is exactly the kind of non-obvious constraint worth
documenting.

---

## Step 4: Hydration Gate (persisted stores only)

If anything downstream makes a render or routing decision off this store's
persisted state, export a hydration hook alongside it — `persist` rehydrates
from `localStorage` asynchronously, so reading state before hydration
finishes gets a stale default.

```ts
export function useHasHydrated() {
  const [hasHydrated, setHasHydrated] = useState(false)
  useEffect(() => {
    const unsub = useWizardStore.persist.onFinishHydration(() => setHasHydrated(true))
    setHasHydrated(useWizardStore.persist.hasHydrated())
    return unsub
  }, [])
  return hasHydrated
}
```

Consumers gate on it before trusting persisted state:

```tsx
const hasHydrated = useHasHydrated()
if (!hasHydrated) return <Loading className="min-h-screen" />
```

---

## Step 5: Use From Components

```tsx
'use client'
import { useWizardStore } from '@/stores/wizard-store'

const step = useWizardStore((s) => s.step)
const next = useWizardStore((s) => s.next)
```

Select only the slice you need (`(s) => s.step`), not the whole store —
avoids re-rendering on unrelated state changes.

---

## What NOT to Do

```ts
// ✗ API data inside the store
useEntityStore.setState({ entities: await entityService.getAll() })

// ✗ Calling a service inside a store action
login: async (credentials) => {
  const res = await authService.login(credentials)
  set({ user: res.user })
}

// ✗ persist without partialize on a store holding a token
persist((set) => ({ accessToken: null, ... }), { name: 'x-storage' })

// ✗ Filename with "use" prefix or PascalCase
// stores/useWizardStore.ts  ✗ — should be stores/wizard-store.ts
```

---

## Checklist

- [ ] File is `kebab-case` + `-store.ts`; exported hook is `use<Name>Store`
- [ ] Confirmed this is UI state, not server/API state
- [ ] `persist` added only if the store must survive a reload
- [ ] `partialize` allowlists fields explicitly if anything sensitive is stored, with a comment explaining the exclusion
- [ ] `useHasHydrated`-style hook exported if consumers make render/routing decisions off persisted state
- [ ] No API calls or service imports inside store actions
- [ ] Components select only the state slice they need
