# Feature: Auth

`features/auth/` — sign-in, self-registration, and password reset. Session
state itself lives in `stores/auth-store.ts` and the token pipeline in
`services/api.ts` ([04-data-layer.md](../04-data-layer.md)); this feature is the
three forms in front of them.

## Routes

| Route | Page | Component |
|---|---|---|
| `/login` | `app/(auth)/login/page.tsx` | `LoginForm` inside `<Suspense>` |
| `/register` | `app/(auth)/register/page.tsx` | `RegisterForm` |
| `/forgot-password` | `app/(auth)/forgot-password/page.tsx` | `ForgotPasswordForm` |

All three sit in the `(auth)` group, which redirects an already-authenticated
user away to `resolvePostLoginRoute(role, next)`.

`/login` needs the `<Suspense>` wrapper because `useLogin()` reads `?next=` via
`useSearchParams()`, which Next requires to sit under a Suspense boundary for
the page to prerender.

## Endpoints

| Method | Path | Service |
|---|---|---|
| POST | `/auth/login` | `authService.login` |
| POST | `/auth/register` | `authService.register` |
| POST | `/auth/logout` | `authService.logout` |
| POST | `/auth/forgot-password` | `authService.forgotPassword` |
| POST | `/auth/verify-otp` | `authService.verifyOtp` |
| POST | `/auth/reset-password` | `authService.resetPassword` |
| POST | `/auth/refresh` | called directly in `services/api.ts`, not via the service |

## Hooks

One hook per action (`hooks/use-*.ts`), all `useMutation`:

| Hook | Does |
|---|---|
| `useLogin` | `authService.login` → `authStore.login(user, tokens)` → `router.replace(resolvePostLoginRoute(role, next))` |
| `useRegister` | Creates a PENDING account; returns no session |
| `useLogout` | `authService.logout` → clears the store → back to `/login` |
| `useForgotPassword` | Sends the OTP email |
| `useVerifyOtp` | Trades the OTP for a `resetToken` |
| `useResetPassword` | Sets the new password using that token |

## Login flow

```
LoginForm (RHF + loginSchema)
  → useLogin()
  → POST /auth/login  →  { user, tokens: { accessToken, expiresIn } }
  → authStore.login()  (accessToken in memory; user + isAuthenticated persisted)
  → router.replace(resolvePostLoginRoute(user.role, next))
```

The refresh token never reaches this code — the API sets it as an httpOnly
cookie, and `withCredentials: true` carries it on every later request.

`?next=` is untrusted: `resolvePostLoginRoute()` accepts it only when it is a
same-origin path (`/…`, not `//…`) **and** `canAccessRoute(role, next)` passes.
Otherwise the role's default route wins. `(auth)/layout.tsx` resolves the same
destination the same way — it fires the moment login writes the user into the
store and would otherwise overwrite the redirect that just happened.

### Failure handling

`/auth/login` and `/auth/register` are excluded from the interceptor's global
401 logout and 403 redirect (`AUTH_ENDPOINTS_WITHOUT_REDIRECT`), because both
of those errors are things the form must show inline:

| Response | Meaning | UI |
|---|---|---|
| 401 | Wrong email or password | Inline error above the submit button |
| 403 `AUTH_006` | Account exists but is still `PENDING` | Inline — "รออนุมัติ", not `/errors/403` |

## Registration flow

`RegisterDto.role` is `Exclude<Role, 'ADMIN' | 'SUPER_ADMIN'>` — the two admin
roles are provisioned, never self-selected. The registerable list is
`REGISTERABLE_ROLES` in `schemas/register.schema.ts`; the two must stay in sync.

`RegisterResponse` carries a user and **no tokens**. The API creates the account
as `PENDING`, and login rejects that status, so there is nothing to sign in with
until a SUPER_ADMIN approves it on `/users`
([features/user.md](user.md)). The form's success state must say that, not
imply the user can log in.

## Password reset flow

Three steps inside one `ForgotPasswordForm`, one component per step:

```
forgot-password-email-step   → POST /auth/forgot-password { email }        → OTP emailed
forgot-password-otp-step     → POST /auth/verify-otp { email, otp }        → { resetToken, expiresIn }
forgot-password-reset-step   → POST /auth/reset-password { resetToken, password }
```

The OTP itself is never sent twice — it is traded for a `resetToken`, and
`reset-password` accepts nothing else.

## Schemas

| File | Schema | Notes |
|---|---|---|
| `schemas/login.schema.ts` | `loginSchema` | email + password |
| `schemas/register.schema.ts` | `registerSchema` | name, email, password, role ∈ `REGISTERABLE_ROLES` |
| `schemas/forgot-password.schema.ts` | one schema per step | email / otp / new password |

## Types

`types/auth-response.types.ts` — `LoginDto`, `RegisterDto`, `AuthTokens`,
`AuthResponse`, `RegisterResponse`, `ForgotPasswordDto`, `VerifyOtpDto`,
`VerifyOtpResponse`, `ResetPasswordDto`.

`AuthUser` and every role/permission type live in `types/auth.types.ts` at the
root, not here — they are consumed app-wide.

## Barrel

```ts
export { LoginForm, RegisterForm, ForgotPasswordForm };
export { useLogin, useRegister, useLogout, useForgotPassword, useVerifyOtp, useResetPassword };
```

No service, no schema, no types — nothing outside this feature needs them.

## Tests

`login-form`, `register-form`, `forgot-password-form`, `use-login`,
`use-logout`, `use-register`, `login.schema`, `register.schema`,
`auth.service` — plus `mocks/handlers/auth.handlers.test.ts`.

## Notes

- `AuthBootstrap` (`app/auth-bootstrap.tsx`) belongs to this flow but lives in
  `app/`: on reload it silently exchanges the refresh cookie for a new access
  token, and logs out if that fails. It renders `null`.
- There is no "remember me" and no session-length control — token lifetime is
  the API's.
- There is no profile/change-password page. Password reset is the only way a
  user changes their own credentials.
