# Zustand Store Patterns

File-level rules for stores under `stores/`. For the higher-level "when to
use Zustand vs TanStack Query" decision, see
[frontend-rules.md](frontend-rules.md)'s State Management section — this
file covers how a store is actually structured once you've decided to write
one, using `stores/auth-store.ts` as the reference implementation.

---

## File and Naming

Follows [naming-conventions.md](naming-conventions.md): file is kebab-case
ending in `-store.ts` (`auth-store.ts`), exported hook is `use` + PascalCase
+ `Store` (`useAuthStore`). The `use` prefix belongs on the exported symbol,
never on the filename.

```ts
// ✓ stores/auth-store.ts
export const useAuthStore = create<AuthState>()(...)

// ✗ stores/useAuthStore.ts — "use" prefix and casing belong to the hook, not the file
```

---

## Structure

```ts
interface AuthState {
  // data fields first
  user: AuthUser | null
  accessToken: string | null
  isAuthenticated: boolean
  // actions after
  login: (user: AuthUser, tokens: AuthTokens) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      login: (user, tokens) => set({ user, accessToken: tokens.accessToken, isAuthenticated: true }),
      logout: () => set({ user: null, accessToken: null, isAuthenticated: false }),
    }),
    { name: 'auth-storage', partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }) }
  )
)
```

- State interface (`AuthState`) is declared above the store, action methods
  live on the same object as the data they mutate — don't split state and
  actions into separate stores/files for one domain.
- Only wrap in `persist` when the store genuinely needs to survive a reload.
  A UI-only store (modal open/closed, wizard step) usually doesn't.

---

## `persist` + `partialize` — Never Persist Secrets Wholesale

If a store holds anything sensitive (tokens, credentials), `partialize` is
mandatory — it is the allowlist of fields that reach `localStorage`. Fields
left out of `partialize` still work at runtime (in-memory) but never survive
a reload.

```ts
// ✓ accessToken excluded on purpose — see services/README.md's Auth token model
partialize: (state) => ({
  user: state.user,
  isAuthenticated: state.isAuthenticated,
}),
```

```ts
// ✗ Persisting everything, including a short-lived access token, to localStorage
// — defeats the point of keeping it memory-only (XSS can read localStorage)
persist((set) => ({ ... }), { name: 'auth-storage' })  // no partialize at all
```

Document *why* a field is excluded with a comment above the store — the
reasoning (what it protects against) is exactly the kind of non-obvious
constraint that belongs in a comment per this project's comment policy.

---

## Hydration Gate: `useHasHydrated`

Any persisted store that gates rendering or routing decisions (auth,
permissions) must export a hydration-check hook alongside the store:

```ts
export function useHasHydrated() {
  const [hasHydrated, setHasHydrated] = useState(false)
  useEffect(() => {
    const unsub = useAuthStore.persist.onFinishHydration(() => setHasHydrated(true))
    setHasHydrated(useAuthStore.persist.hasHydrated())
    return unsub
  }, [])
  return hasHydrated
}
```

Consumers must wait on this before trusting persisted state — see
[auth-permissions.md](auth-permissions.md)'s `hasHydrated` gate section for
why (`persist` rehydrates from `localStorage` asynchronously; reading state
before hydration finishes reads a stale default).

---

## What NOT to Do

```ts
// ✗ Server/API data inside Zustand — belongs in TanStack Query
useStoreListStore.setState({ stores: await storeService.getAll() })

// ✗ Calling a service directly inside a store action
login: async (credentials) => {
  const res = await authService.login(credentials)  // API calls don't belong in stores
  set({ user: res.user })
}

// ✗ persist without partialize on a store holding sensitive data
persist((set) => ({ accessToken: null, ... }), { name: 'auth-storage' })
```

---

## Checklist Before Adding a Store

- [ ] File is `kebab-case` + `-store.ts`; exported hook is `use<Name>Store`
- [ ] Only UI/client state — no API responses, no service calls inside actions
- [ ] `persist` added only if the store must survive a reload
- [ ] `partialize` allowlists fields explicitly if the store holds anything sensitive, with a comment explaining what's excluded and why
- [ ] `useHasHydrated`-style hook exported if consumers make render/routing decisions off persisted state
