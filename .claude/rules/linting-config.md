# Linting & Formatting Rules

This project enforces ESLint and Prettier. Every file Claude writes must pass
both without errors. Treat ESLint `warn` rules as errors — do not introduce warnings.

---

## ESLint Rules in Force

### `@typescript-eslint/consistent-type-imports`

Type-only imports **must** use `import type`. This is enforced as an error.

```ts
// ✗ Wrong
import { User } from '@/features/user/types/user.types'

// ✓ Correct
import type { User } from '@/features/user/types/user.types'
```

Mixed imports: separate value import from type import.

```ts
// ✓ Correct
import { userService } from '../services/user.service'
import type { User } from '../types/user.types'
```

### `@typescript-eslint/no-explicit-any`

Configured as `warn`. Treat it as an **error** — never write `any`.
Use `unknown` for truly unknown shapes, then narrow.

```ts
// ✗
function parse(data: any) { ... }

// ✓
function parse(data: unknown) {
  if (typeof data === 'string') { ... }
}
```

### `@typescript-eslint/no-unused-vars`

Unused variables are errors. Prefix intentionally unused params with `_`.

```ts
// ✓ Intentionally unused param
array.map((_item, index) => index)
```

---

## Prettier Config

| Setting | Value |
|---|---|
| `singleQuote` | `true` — use `'` not `"` in code |
| `semi` | `true` — always end statements with `;` |
| `tabWidth` | `2` |
| `trailingComma` | `"es5"` — trailing commas in objects/arrays, not function params |
| `printWidth` | `100` — lines over 100 chars must wrap |

### Tailwind class ordering

`prettier-plugin-tailwindcss` is active. Classes are auto-sorted on format.
Write classes in any order — they will be sorted. Do not manually fight the order.

---

## Import Order

Follow this order consistently:

```ts
// 1. React / Next.js
import { useState } from 'react'
import { useRouter } from 'next/navigation'

// 2. Third-party libraries
import { useQuery } from '@tanstack/react-query'
import { z } from 'zod'

// 3. Internal — absolute paths via @/
import type { User } from '@/features/user/types/user.types'
import { userService } from '@/features/user/services/user.service'
import { Button } from '@/components/ui/button'

// 4. Internal — relative paths
import { useLocalHook } from '../hooks/use-local-hook'
import type { LocalType } from '../types/local.types'
```

---

## Rules That Are NOT Configured but Still Apply

These are not in `.eslintrc.json` but must be followed:

- No `console.log` left in committed code
- No `// @ts-ignore` or `// @ts-nocheck`
- No `eslint-disable` comments without a specific rule name and justification
- No `debugger` statements
