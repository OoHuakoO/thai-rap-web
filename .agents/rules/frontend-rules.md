# Frontend Engineering Rules

## General Principles

* Follow existing project patterns before introducing new ones.
* Prioritize readability and maintainability over clever solutions.
* Prefer consistency over personal preference.
* Reuse existing components and utilities whenever possible.
* Do not introduce new libraries unless explicitly requested.

---

## TypeScript Rules

* Enable strict TypeScript mode.
* Avoid `any` unless absolutely necessary.
* Prefer explicit types for public APIs.
* Use interfaces for component props.
* Use type inference when obvious.
* Avoid type assertions (`as`) unless required.
* Create shared types in dedicated type files.

Bad:

```ts
const user: any = response.data;
```

Good:

```ts
interface User {
  id: string;
  name: string;
}

const user: User = response.data;
```

---

## Next.js Rules

* Use App Router only.
* Prefer Server Components by default.
* Add "use client" only when required.
* Keep pages focused on composition.
* Move business logic outside page files.
* Use route groups for large modules.
* Use loading.tsx and error.tsx when appropriate.
* Use metadata API for SEO.

Avoid:

* Fetching data in Client Components when Server Components can handle it.
* Large page.tsx files containing business logic.

---

## React Component Rules

* Use functional components only.
* Keep components focused on a single responsibility.
* Extract reusable logic into hooks.
* Avoid components larger than 300 lines.
* Avoid deeply nested JSX.
* Prefer composition over inheritance.

When a component becomes difficult to understand:

* Extract sub-components.
* Extract hooks.
* Extract utility functions.

---

## State Management Rules

### TanStack Query

Use TanStack Query for:

* API data
* Server state
* Cached responses

Never store server state inside Zustand.

Bad:

```ts
useUserStore.setState({ users });
```

Good:

```ts
const { data: users } = useQuery(...)
```

---

### Zustand

Use Zustand only for:

* UI state
* Modal state
* Theme state
* Wizard state
* Local client state

Do not:

* Store API responses
* Call APIs inside stores
* Duplicate TanStack Query cache

---

## API Rules

* All API calls must go through a centralized API layer.
* Do not call fetch directly in components.
* Use Axios instance.
* Use interceptors for authentication.
* Handle errors consistently.

Structure:

services/
├── api-client.ts
├── user.service.ts
└── auth.service.ts

---

## TanStack Query Rules

* Use query keys from a shared location.
* Use useQuery for reads.
* Use useMutation for writes.
* Invalidate affected queries after successful mutations.
* Handle loading states.
* Handle error states.

Bad:

```ts
queryKey: ["users"]
queryKey: ["Users"]
queryKey: ["USERS"]
```

Good:

```ts
queryKey: queryKeys.users.list()
```

---

## Form Rules

* Use React Hook Form.
* Use Zod validation.
* Keep schemas close to features.
* Validate before submission.
* Display user-friendly errors.

Structure:

features/
└── users/
├── schema.ts
├── hooks.ts
├── form.tsx

---

## Styling Rules

* Use Tailwind CSS.
* Avoid inline styles.
* Reuse utility classes.
* Extract repeated styles into reusable components.
* Prefer design system components.

Avoid:

```tsx
<div style={{ marginTop: 10 }}>
```

Prefer:

```tsx
<div className="mt-2">
```

---

## Performance Rules

* Avoid unnecessary useEffect.
* Avoid unnecessary useMemo.
* Avoid unnecessary useCallback.
* Memoize only after identifying a real problem.
* Prevent duplicate API requests.
* Avoid unnecessary re-renders.

---

## Error Handling Rules

Every async operation should handle:

* Loading state
* Error state
* Empty state

Never assume API success.

---

## Accessibility Rules

* Use semantic HTML.
* Add labels to form controls.
* Ensure keyboard navigation works.
* Use aria attributes when necessary.
* Ensure buttons have meaningful text.

---

## Review Checklist

Before approving code:

1. Is TypeScript type-safe?
2. Is business logic separated from UI?
3. Is server state handled by TanStack Query?
4. Is local state handled appropriately?
5. Is the API layer centralized?
6. Are loading and error states implemented?
7. Is the component reusable?
8. Is the code consistent with existing patterns?
9. Are there unnecessary re-renders?
10. Is the solution easy to maintain?


# Frontend Do & Don't Examples

## Component Responsibility

### DO

Keep components focused on presentation.

```tsx
export function UserCard({ user }: UserCardProps) {
  return (
    <Card>
      <h3>{user.name}</h3>
    </Card>
  );
}
```

### DON'T

Mix API logic with UI.

```tsx
export function UserCard() {
  const [user, setUser] = useState();

  useEffect(() => {
    axios.get("/users/1").then(setUser);
  }, []);

  return <div>{user?.name}</div>;
}
```

---

## Server State

### DO

Use TanStack Query.

```tsx
const { data: users } = useQuery({
  queryKey: queryKeys.users.list(),
  queryFn: getUsers,
});
```

### DON'T

Store API data in Zustand.

```tsx
const users = useUserStore((s) => s.users);

useEffect(() => {
  fetchUsers().then((data) =>
    useUserStore.setState({ users: data })
  );
}, []);
```

---

## API Calls

### DO

Use service layer.

```tsx
const users = await userService.getUsers();
```

### DON'T

Call axios directly in components.

```tsx
await axios.get("/api/users");
```

---

## Forms

### DO

React Hook Form + Zod

```tsx
const form = useForm({
  resolver: zodResolver(loginSchema),
});
```

### DON'T

Manual validation.

```tsx
if (!email) {
  setError("Email required");
}
```

---

## Types

### DO

Create proper interfaces.

```ts
interface User {
  id: string;
  name: string;
}
```

### DON'T

Use any.

```ts
const user: any = response.data;
```

---

## State Management

### DO

Use local state for UI concerns.

```tsx
const [isOpen, setIsOpen] = useState(false);
```

### DON'T

Create Zustand store for everything.

```tsx
const useModalStore = create(...)
const useButtonStore = create(...)
const useTooltipStore = create(...)
```

---

## Effects

### DO

Use effects only for side effects.

```tsx
useEffect(() => {
  document.title = title;
}, [title]);
```

### DON'T

Use effects for derived state.

```tsx
useEffect(() => {
  setFullName(firstName + lastName);
}, [firstName, lastName]);
```

Use:

```tsx
const fullName = `${firstName} ${lastName}`;
```

---

## Query Keys

### DO

Centralize query keys.

```ts
export const queryKeys = {
  users: {
    list: () => ["users"],
    detail: (id: string) => ["users", id],
  },
};
```

### DON'T

Hardcode query keys.

```ts
["users"]
["Users"]
["user-list"]
["user"]
```

---

## Conditional Rendering

### DO

Handle all states.

```tsx
if (isLoading) return <Loading />;
if (error) return <Error />;
if (!data?.length) return <Empty />;

return <Table data={data} />;
```

### DON'T

Assume data exists.

```tsx
return <Table data={data} />;
```

---

## Component Size

### DO

Extract subcomponents.

```tsx
<UserHeader />
<UserProfile />
<UserActions />
```

### DON'T

Create 800-line components.

```tsx
UserPage.tsx
// 850 lines
```

---

## Styling

### DO

Use Tailwind classes.

```tsx
<div className="flex items-center gap-2">
```

### DON'T

Use inline styles.

```tsx
<div style={{ display: "flex" }}>
```

---

## Performance

### DO

Measure before optimizing.

```tsx
const users = data ?? [];
```

### DON'T

Wrap everything in useMemo.

```tsx
const users = useMemo(() => data ?? [], [data]);
```

---

## Reusability

### DO

Extract shared logic.

```tsx
const { users, isLoading } = useUsers();
```

### DON'T

Duplicate query logic.

```tsx
PageA -> fetch users
PageB -> fetch users
PageC -> fetch users
```
