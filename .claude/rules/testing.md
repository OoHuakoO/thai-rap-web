# Testing Rules

Tests verify behavior, not implementation.
Write tests that reflect how the code is actually used.

---

## Test Stack

| Tool | Purpose |
|------|---------|
| Vitest | Test runner |
| React Testing Library | Component and hook testing |
| MSW (Mock Service Worker) | API mocking at network level |
| @testing-library/user-event | Simulating real user interactions |

---

## What to Test

### Always Test

- Custom hooks (query hooks, form hooks)
- Service functions (API call shapes, params, error handling)
- Utility functions (pure functions in `utils/`)
- Zod schemas (valid input, invalid input, edge cases)
- Components with conditional rendering (loading, error, empty, data states)
- Form components (validation, submit, error messages)

### Test When Complex

- Components with significant interaction logic
- Hooks that have multiple state transitions
- Mutations with optimistic updates

### Do Not Test

- Shadcn UI primitives (Button, Input, Card) — library code
- Simple presentational components with no logic
- Zustand store definitions themselves
- Next.js routing behavior

---

## Test File Location

Place test files next to the file they test using `.test.ts` or `.test.tsx` suffix.

```
features/user/
├── hooks/
│   ├── use-users.ts
│   └── use-users.test.ts
├── services/
│   ├── user.service.ts
│   └── user.service.test.ts
├── components/
│   ├── user-list.tsx
│   └── user-list.test.tsx
utils/
├── cn.ts
└── cn.test.ts
```

---

## Naming Tests

Describe blocks use the module name.
Test names describe observable behavior — not implementation.

```ts
describe('useUsers', () => {
  it('returns users when the API succeeds', async () => { ... })
  it('returns an error when the API fails', async () => { ... })
  it('shows loading state while fetching', async () => { ... })
})
```

Never name tests after internal function names or implementation details:

```ts
it('calls axios.get')            ✗
it('sets isLoading to true')     ✗
it('invokes setUsers')           ✗
```

---

## Service Tests

Test that services call the correct endpoint with correct params.
Use `vi.mock` or MSW to intercept the Axios instance.

```ts
// user.service.test.ts
import { describe, it, expect, vi } from 'vitest'
import api from '@/services/api'
import { userService } from './user.service'

vi.mock('@/services/api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}))

describe('userService', () => {
  it('calls GET /users', async () => {
    vi.mocked(api.get).mockResolvedValue({ data: [] })
    await userService.getAll()
    expect(api.get).toHaveBeenCalledWith('/users')
  })

  it('calls POST /users with payload', async () => {
    const payload = { name: 'Alice', email: 'alice@example.com', role: 'user' as const }
    vi.mocked(api.post).mockResolvedValue({ data: { id: '1', ...payload } })
    await userService.create(payload)
    expect(api.post).toHaveBeenCalledWith('/users', payload)
  })
})
```

---

## Hook Tests

Use `renderHook` from React Testing Library.
Wrap with `QueryClientProvider` for TanStack Query hooks.

```ts
// use-users.test.ts
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { describe, it, expect, vi } from 'vitest'
import { useUsers } from './use-users'
import { userService } from '../services/user.service'

vi.mock('../services/user.service')

function wrapper({ children }: { children: React.ReactNode }) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}

describe('useUsers', () => {
  it('returns users when the API succeeds', async () => {
    const mockUsers = [{ id: '1', name: 'Alice', email: 'alice@example.com', role: 'user' }]
    vi.mocked(userService.getAll).mockResolvedValue(mockUsers)

    const { result } = renderHook(() => useUsers(), { wrapper })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual(mockUsers)
  })

  it('returns an error when the API fails', async () => {
    vi.mocked(userService.getAll).mockRejectedValue(new Error('Network error'))

    const { result } = renderHook(() => useUsers(), { wrapper })

    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(result.current.error).toBeInstanceOf(Error)
  })
})
```

Rules:
- Always set `retry: false` in test QueryClient
- Use `waitFor` for async state assertions
- Reset mocks between tests with `beforeEach(() => vi.clearAllMocks())`

---

## Component Tests

Test component behavior from the user's perspective.
Use `screen` queries — never query by test ID unless unavoidable.

Priority of queries (highest to lowest):

1. `getByRole` — most accessible, preferred
2. `getByLabelText` — for form fields
3. `getByText` — for visible text
4. `getByPlaceholderText` — fallback for inputs
5. `getByTestId` — last resort only

```tsx
// user-list.test.tsx
import { render, screen, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { describe, it, expect, vi } from 'vitest'
import { UserList } from './user-list'
import { userService } from '../services/user.service'

vi.mock('../services/user.service')

function renderWithClient(ui: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>)
}

describe('UserList', () => {
  it('shows loading state initially', () => {
    vi.mocked(userService.getAll).mockReturnValue(new Promise(() => {}))
    renderWithClient(<UserList />)
    expect(screen.getByRole('status')).toBeInTheDocument()
  })

  it('renders users when data loads', async () => {
    vi.mocked(userService.getAll).mockResolvedValue([
      { id: '1', name: 'Alice', email: 'alice@example.com', role: 'user', createdAt: '', updatedAt: '' },
    ])
    renderWithClient(<UserList />)
    await waitFor(() => expect(screen.getByText('Alice')).toBeInTheDocument())
    expect(screen.getByText('alice@example.com')).toBeInTheDocument()
  })

  it('shows empty state when no users', async () => {
    vi.mocked(userService.getAll).mockResolvedValue([])
    renderWithClient(<UserList />)
    await waitFor(() => expect(screen.getByText(/no users found/i)).toBeInTheDocument())
  })

  it('shows error message when API fails', async () => {
    vi.mocked(userService.getAll).mockRejectedValue(new Error('Server error'))
    renderWithClient(<UserList />)
    await waitFor(() => expect(screen.getByText(/server error/i)).toBeInTheDocument())
  })
})
```

---

## Form Tests

Test validation messages, submit behavior, and reset.

```tsx
// create-user-form.test.tsx
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { CreateUserForm } from './create-user-form'

vi.mock('../hooks/use-users', () => ({
  useCreateUser: () => ({
    mutate: vi.fn((data, { onSuccess }) => onSuccess()),
    isPending: false,
  }),
}))

describe('CreateUserForm', () => {
  it('shows validation error when name is too short', async () => {
    render(<CreateUserForm />)
    await userEvent.type(screen.getByPlaceholderText('John Doe'), 'A')
    await userEvent.click(screen.getByRole('button', { name: /create user/i }))
    await waitFor(() =>
      expect(screen.getByText(/at least 2 characters/i)).toBeInTheDocument()
    )
  })

  it('submits with valid data', async () => {
    const { mutate } = vi.mocked(require('../hooks/use-users').useCreateUser())
    render(<CreateUserForm />)
    await userEvent.type(screen.getByPlaceholderText('John Doe'), 'Alice')
    await userEvent.type(screen.getByPlaceholderText('john@example.com'), 'alice@example.com')
    await userEvent.click(screen.getByRole('button', { name: /create user/i }))
    await waitFor(() => expect(mutate).toHaveBeenCalled())
  })
})
```

---

## Utility Tests

Pure function tests are straightforward.

```ts
// cn.test.ts
import { describe, it, expect } from 'vitest'
import { cn } from './cn'

describe('cn', () => {
  it('merges class names', () => {
    expect(cn('px-4', 'py-2')).toBe('px-4 py-2')
  })

  it('resolves tailwind conflicts (last wins)', () => {
    expect(cn('px-4', 'px-8')).toBe('px-8')
  })

  it('ignores falsy values', () => {
    expect(cn('px-4', false, undefined, null)).toBe('px-4')
  })
})
```

---

## What Not To Do

```ts
// ✗ Testing implementation details
expect(mockSetState).toHaveBeenCalled()
expect(component.instance().internalMethod).toBeDefined()

// ✗ Testing library code
it('Button renders correctly', () => ...)

// ✗ Asserting on snapshots for dynamic content
expect(container).toMatchSnapshot()

// ✗ Missing async handling
it('shows users', () => {
  render(<UserList />)
  expect(screen.getByText('Alice')).toBeInTheDocument() // may not be there yet
})

// ✗ Using getByTestId when a semantic query exists
screen.getByTestId('user-name')  // use getByText or getByRole instead
```
