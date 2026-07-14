# services/

โฟลเดอร์นี้เป็น API layer กลางของฝั่ง frontend ทุก request ที่ยิงไป backend ต้องผ่านที่นี่ (ไม่เรียก `fetch`/`axios` ตรงจาก component หรือ hook)

```
services/
├── api.ts            axios instance + interceptors (auth, refresh, error redirect)
├── error-mapper.ts    แปลง axios error → ApiError รูปแบบเดียวกันทั้งแอป
└── api-error.ts        class + type ของ ApiError
```

ความสัมพันธ์ระหว่างไฟล์: `api.ts` เรียก `error-mapper.ts` ตอน response error → `error-mapper.ts` สร้าง `ApiError` จาก `api-error.ts`

---

## api-error.ts

โครง error กลางที่ทุก request error ในแอปจะถูกแปลงมาเป็นรูปนี้เสมอ (แทนที่จะโยน `AxiosError` ดิบๆ ให้ UI จัดการเอง)

- **`ErrorCode`** — union type ของ error code ที่รองรับ: `NETWORK_ERROR`, `TIMEOUT_ERROR`, `CANCELLED`, `BAD_REQUEST`, `UNAUTHORIZED`, `FORBIDDEN`, `NOT_FOUND`, `RATE_LIMITED`, `SERVER_ERROR`, `SERVICE_UNAVAILABLE`, `UNKNOWN`
- **`ApiError` (class)** — extends `Error`, field เพิ่มจาก error ปกติ:
  - `statusCode` — HTTP status (0 ถ้าไม่มี response เช่น network error)
  - `code` — `ErrorCode` ด้านบน
  - `details` — array ของ field-level validation error (จาก 422)
  - `requestId` — เอาไว้ trace log กับ backend (จาก header `x-request-id`)
  - `isNetworkError` / `isCancelled` — flag แยก case พิเศษที่ UI ควร handle ต่างจาก error ปกติ
  - `retryAfter` — วินาทีที่ต้องรอ (จาก header `retry-after`, ใช้กับ 429)
  - เรียก `Object.setPrototypeOf` ใน constructor เพราะ TS transpile class ที่ extend built-in (`Error`) แล้ว `instanceof` อาจพังถ้าไม่ทำ

ทุก component/hook ที่ต้องการ error message ที่อ่านง่าย ให้ใช้ `extractErrorMessage()` (`utils/extract-error-message.ts`) รับ `ApiError` นี้ต่ออีกที ไม่ต้องแตะไฟล์นี้ตรงๆ

---

## error-mapper.ts

หน้าที่เดียว: รับ error อะไรก็ได้จาก axios → คืน `ApiError` เสมอ

- **`codeFromStatus(status)`** *(private)* — map HTTP status number → `ErrorCode` string โดยใช้ constant จาก `HTTP_STATUS` (`constants/http-status.ts`) ไม่ hardcode เลขตรงๆ, ถ้า status ≥ 500 ที่ไม่ตรง case ไหนเลยจะ fallback เป็น `SERVER_ERROR`, นอกนั้น `UNKNOWN`

- **`mapToApiError(error)`** *(export, ใช้ใน `api.ts`)* — เช็คตามลำดับ:
  1. `axios.isCancel(error)` → request ถูกยกเลิก (เช่น component unmount กลางทาง) → `ApiError` code `CANCELLED`
  2. `axios.isAxiosError(error)` แต่ `!error.response` → ยิงไม่ถึง server เลย (offline, DNS พัง) หรือ timeout (`error.code === 'ECONNABORTED'`) → `NETWORK_ERROR` / `TIMEOUT_ERROR`, ตั้ง `isNetworkError: true`
  3. `axios.isAxiosError(error)` มี `response` → server ตอบกลับมาเป็น error (4xx/5xx) → ดึง `message` จาก body backend ก่อน (`body.error.message`) ถ้าไม่มีค่อย fallback เป็น `error.message` ของ axios, แนบ `details`/`requestId`/`retryAfter` จาก response
  4. เหลือ error ทั่วไปที่ไม่ใช่ axios (`error instanceof Error`) หรือไม่รู้จักเลย → `UNKNOWN`

---

## api.ts

axios instance หลักของทั้งแอป (`export default api` + `export const api`) ทุก service (`features/*/services/*.service.ts`) import จากที่นี่

### instance setup
```ts
axios.create({ baseURL: API_URL, timeout: API_TIMEOUT_MS, withCredentials: true })
```
`withCredentials: true` จำเป็นเพราะ refreshToken ไม่ได้เก็บใน localStorage แล้ว แต่อยู่ใน httpOnly cookie ที่ backend set ให้ — ต้องส่ง cookie แนบไปทุก request ถึงจะ refresh ได้

### request interceptor
แนบ `Authorization: Bearer <accessToken>` ให้ทุก request โดยดึง token จาก `useAuthStore` (memory, ไม่ใช่ localStorage) ก่อนแนบ header จะเช็คก่อนว่า token ใกล้หมดอายุหรือยัง (`expiresAt - now < REFRESH_BUFFER_MS` คือ 10 วิ) ถ้าใกล้หมดจะ refresh ล่วงหน้าให้เลย (proactive refresh) กันไม่ให้ request แรกที่ยิงออกไปโดน 401 เก้อ

### response interceptor #1 — unwrap envelope
backend ห่อ response สำเร็จเป็น `{ success: true, data }` เสมอ interceptor นี้แกะ `data` ออกมาแทนที่ `response.data` ให้เลย เพื่อไม่ต้อง `.then(res => res.data.data)` ซ้ำสองชั้นทุกที่ (mock ที่คืน flat payload ตรงๆ ไม่มี key `success` จะไม่โดนแตะ ผ่านเฉยๆ)

### refresh token flow
- **`matchesAuthEndpoint(url, endpoints)`** *(private)* — เช็คว่า url อยู่ใน list ที่ให้มามั้ย ใช้ 2 list แยกกัน:
  - `AUTH_ENDPOINTS_WITHOUT_RETRY` (`/auth/login`, `/auth/register`, `/auth/refresh`) — ไม่ retry ตอนโดน 401 (กัน infinite loop เช่น login ผิดรหัสแล้วดันไป trigger refresh)
  - `AUTH_ENDPOINTS_WITHOUT_REDIRECT` (`/auth/login`, `/auth/register`) — ไม่ trigger global logout + redirect ตอนโดน 401 เพราะ error ควรโชว์ inline ในฟอร์มเอง (login/register ผิดรหัสไม่ควรเด้งทับหน้าฟอร์ม), ตัด `/auth/refresh` ออกจาก list นี้เพราะถ้า refresh เองพัง แปลว่า session หมดจริง ต้อง logout+redirect ตามปกติ
- **`doRefreshAccessToken()`** *(private)* — ยิง `POST /auth/refresh` ด้วย `axios.post` ตรงๆ (ไม่ผ่าน `api` instance หลัก) เพื่อไม่ให้เข้า interceptor ตัวเองซ้ำ (loop) ไม่ส่ง refreshToken ใน body เลย เพราะมันอยู่ใน cookie ให้ browser แนบให้อัตโนมัติ ถ้าสำเร็จ เอา token ใหม่ไปเซฟใน store (`setTokens`) แล้วคืน accessToken ใหม่ ถ้า fail (cookie หมดอายุ/ไม่มี) คืน `null`
- **`refreshAccessToken()`** *(export)* — wrapper กัน concurrent refresh: ถ้ามี request refresh ที่กำลังทำอยู่แล้ว (`refreshPromise`) จะ return promise เดิมแทนที่จะยิงซ้ำ กันเคส 401 หลาย request พร้อมกันแล้วแต่ละอันไปเรียก `/auth/refresh` ของตัวเอง ไฟล์นี้ export ตัวนี้ให้ `app/auth-bootstrap.tsx` เรียกใช้ตอน reload หน้าเว็บด้วย (silent refresh ตอนเปิดแอปใหม่)

### response interceptor #2 — error handling
ทุก error ที่หลุดมาจะถูกแปลงเป็น `ApiError` ผ่าน `mapToApiError()` ก่อน แล้วจัดการตามลำดับ:

1. `isCancelled` → reject เฉยๆ ไม่ทำอะไรเพิ่ม (component ที่ cancel เองรู้อยู่แล้ว)
2. `isNetworkError` → toast แจ้งเตือน แล้ว reject
3. **401 + ยังไม่เคย retry + ไม่ใช่ auth endpoint** → ลอง `refreshAccessToken()` ถ้าได้ token ใหม่ → แนบ header ใหม่แล้วยิง request เดิมซ้ำอีกรอบ (`return api(originalRequest)`) โดย mark `_retry = true` กันวนซ้ำไม่รู้จบ
4. ถ้า refresh ไม่สำเร็จ หรือ status อื่นๆ → เข้า `switch (apiError.statusCode)` (ใช้ constant `HTTP_STATUS` ทั้งหมด ไม่ hardcode เลข):
   - `UNAUTHORIZED` → logout จาก store + redirect ไปหน้า login พร้อม `returnUrl` (ยกเว้น auth endpoint ใน `AUTH_ENDPOINTS_WITHOUT_REDIRECT` — ปล่อย error ให้ฟอร์ม login/register จัดการเอง)
   - `FORBIDDEN` → redirect หน้า 403
   - `RATE_LIMITED` → toast แจ้งจำนวนวินาทีที่ต้องรอ (จาก `retryAfter` ถ้ามี)
   - `SERVER_ERROR` / `BAD_GATEWAY` / `GATEWAY_TIMEOUT` → redirect หน้า 500
   - `SERVICE_UNAVAILABLE` → redirect หน้า 503
5. สุดท้าย reject ด้วย `apiError` เสมอ ให้ TanStack Query hook ที่เรียกอยู่รับไปแสดงต่อ (inline error ในฟอร์ม/หน้า)

---

## Auth token model

สองตัวที่ต้องแยกให้ชัด: **accessToken** (สั้น อายุ 15 นาที ใช้แนบทุก request) กับ **refreshToken** (ยาว ใช้ขอ accessToken ใหม่เท่านั้น) — เก็บคนละที่ ด้วยเหตุผลด้าน security คนละแบบ

| | accessToken | refreshToken |
|---|---|---|
| เก็บที่ไหน | memory — `useAuthStore` state (zustand) | httpOnly cookie ฝั่ง backend set ให้ |
| JS อ่าน/เขียนได้ไหม | ได้ (`useAuthStore.getState().accessToken`) | **ไม่ได้เลย** — httpOnly กันสคริปต์ทุกชนิดแตะ |
| persist ข้าม reload ไหม | ไม่ — `partialize` ใน `auth-store.ts` ตัด field นี้ออกจาก localStorage เจตนา | ได้ — คุณสมบัติของ cookie เอง (อยู่ยัน expire หรือ browser ปิด ถ้าไม่ใช่ session cookie) |
| ส่งไปกับ request ยังไง | header `Authorization: Bearer <token>` (request interceptor แนบให้) | อัตโนมัติผ่าน `withCredentials: true` ตอน axios ยิงไป backend origin เดียวกัน |
| ทำไมเก็บแบบนี้ | อยู่ใน memory ล้วน → ต่อให้มี XSS อ่าน JS ได้ ก็ได้แค่ token อายุสั้น กับหายทันทีที่ reload/ปิด tab | httpOnly → XSS อ่านไม่ได้เลยแม้จะรันโค้ดในหน้าได้ นี่คือตัวที่ "มีค่า" จริง (ใช้ขอ accessToken ใหม่ได้เรื่อยๆ) เลยต้องป้องกันแน่นสุด |

เดิมโปรเจกต์นี้เก็บทั้งคู่ใน `localStorage` (`auth-storage` key) — เปลี่ยนมาเป็นโมเดลนี้เพราะ `localStorage` ให้ JS ทุกบรรทัดที่รันบนหน้า (รวมโค้ดที่มากับ XSS) อ่าน token ออกไปได้ตรงๆ

### 1) Login/Register — ต้นทางของ token

1. `LoginForm`/`RegisterForm` submit → เรียก `useLogin()`/`useRegister()` (`features/auth/hooks/`) → `authService.login()`/`.register()` (`features/auth/services/auth.service.ts`) ยิง `POST /auth/login` หรือ `/auth/register` ผ่าน `api` instance
2. Backend ตอบกลับ `{ user, tokens: { accessToken, expiresIn } }` (type `AuthResponse` — `features/auth/types/auth-response.types.ts`) **พร้อม** set httpOnly cookie `refreshToken` มาด้วยใน response header (`Set-Cookie`) — คนละช่องทางกับ JSON body เลย ฝั่ง frontend ไม่เห็น ไม่ต้องจัดการอะไร
3. mutation `onSuccess` (`use-login.ts:15-17`, `use-register.ts:15-17`) เรียก `useAuthStore.getState().login(user, tokens)` → เซฟ `user`, `accessToken`, และคำนวณ `expiresAt = Date.now() + expiresIn * 1000` ไว้ใน memory (`auth-store.ts:33-39`)
4. redirect เข้าแอป (`router.replace(...)`)

ตั้งแต่ตรงนี้ accessToken อยู่ใน memory แล้ว, refreshToken อยู่ในคุกกี้ของ browser แล้ว — frontend "ไม่รู้" ค่า refreshToken เลยตลอดชีวิต session

### 2) Proactive refresh — ระหว่างใช้งานปกติ

ทุก request ที่ยิงออก request interceptor (`api.ts:19-31`) เช็คก่อนแนบ header:

```
expiresAt - Date.now() < REFRESH_BUFFER_MS   (10 วินาที)
```

ถ้าใกล้หมดอายุ → `await refreshAccessToken()` ก่อน แล้วค่อยแนบ `Authorization` ด้วย token ใหม่ แปลว่า **ไม่มี request ไหนที่ยิงออกไปด้วย token ที่กำลังจะหมดอายุ** ในสถานการณ์ปกติ (ไม่นับ clock skew หรือ backend revoke ก่อนเวลา) — ผู้ใช้ไม่เห็น 401 เลยระหว่าง session ปกติ

### 3) Reactive refresh — โดน 401 กลางทาง

เผื่อ proactive พลาด (เช่น token ถูก revoke ฝั่ง backend ก่อนเวลา) response interceptor #2 (`api.ts:71-83`) จัดการ:

1. เช็คว่า status เป็น `401`, request นี้ยังไม่เคย retry (`_retry` flag), และไม่ใช่ endpoint ที่ยกเว้น (`AUTH_ENDPOINTS_WITHOUT_RETRY`)
2. เรียก `refreshAccessToken()` → ยิง `POST /auth/refresh` ด้วย `axios.post` เปล่าๆ (ไม่ผ่าน `api` instance หลัก กัน interceptor ตัวเองวนเรียกซ้ำ) ไม่ส่ง refreshToken ใน body เลย เพราะ browser แนบ cookie ให้เองอัตโนมัติจาก `withCredentials: true`
3. Backend เช็ค cookie → ถ้า valid ตอบ accessToken ใหม่ (+ ปกติจะหมุน refreshToken cookie ใหม่มาด้วย เพื่อกัน replay)
4. ได้ token ใหม่ → เซฟลง store (`setTokens`) → แนบ header ใหม่ → ยิง request เดิมซ้ำ (`return api(originalRequest)`) — ผู้ใช้ไม่รู้ตัวเลยว่ามี 401 เกิดขึ้น
5. หลาย request โดน 401 พร้อมกัน (เช่นเปิดหลาย tab component ที่ query พร้อมกัน) → ใช้ `refreshPromise` เดียว (`refreshAccessToken()` เช็คก่อนว่ามี promise ค้างอยู่ไหม) → ยิง `/auth/refresh` แค่ครั้งเดียว ไม่ยิงซ้ำตามจำนวน request ที่ fail

### 4) refreshToken หมดอายุจริง (cookie expired/ไม่มี/ถูก revoke)

`doRefreshAccessToken()` (`api.ts:55-68`) catch error จาก `/auth/refresh` แล้วคืน `null` แทนที่จะ throw ต่อ กลับมาที่ response interceptor #2, `newAccessToken` เป็น `null` → ไม่ retry request เดิม → ตกไปที่ `switch (apiError.statusCode)` case `UNAUTHORIZED` (`api.ts:118-121`):

```ts
useAuthStore.getState().logout()   // เคลียร์ user/accessToken/expiresAt ทั้งหมดในหน่วยความจำ
window.location.href = `${ROUTES.LOGIN}?returnUrl=...`   // hard redirect จำหน้าที่อยู่ก่อนหน้า
```

**ข้อยกเว้น**: ถ้า 401 นี้มาจาก `/auth/login` หรือ `/auth/register` เอง (เช่นกรอกรหัสผ่านผิด) จะไม่ logout/redirect — endpoint พวกนี้อยู่ใน `AUTH_ENDPOINTS_WITHOUT_REDIRECT` (`api.ts:47-52`) เพราะตอนนี้ยังไม่มี session ให้ logout อยู่แล้ว และ error ต้องโชว์ inline ในฟอร์ม (`LoginForm` อ่านจาก `isError`/`error` ของ mutation — `login-form.tsx:36-40`) ไม่ใช่เด้งทับหน้า

### 5) Reload หน้าเว็บ — accessToken หายแต่ session ยังอยู่

accessToken อยู่ใน memory ล้วน reload ทีเดียวหายหมด แต่ `isAuthenticated`/`user` ยัง persist ใน localStorage อยู่ (`partialize` เก็บแค่สองอันนี้ — `auth-store.ts:65-68`) และ refreshToken cookie ก็ยังอยู่ฝั่ง browser เหมือนเดิม `AuthBootstrap` (`app/auth-bootstrap.tsx`, mount ใน `app/providers.tsx:28` ก่อน children ทั้งหมด) จัดการช่วงรอยต่อนี้:

```ts
useEffect(() => {
  if (!hasHydrated || !isAuthenticated || accessToken) return   // มี token อยู่แล้ว หรือยังไม่ login ก็ไม่ต้องทำอะไร
  refreshAccessToken().then((token) => {
    if (!token) logout()   // cookie หมดอายุไปแล้วจริงๆ ระหว่างที่ปิดแท็บไป
  })
}, [...])
```

- `hasHydrated` รอ zustand persist middleware อ่าน localStorage เสร็จก่อน (sync, เร็ว ไม่ใช่ network)
- component คืน `null` เสมอ **ไม่บล็อกการ render** — เรียกใน `useEffect` หลัง paint แรกไปแล้ว หน้าเว็บไม่รอ token ก่อนขึ้นจอ
- ถ้า query/component อื่น mount เร็วกว่า refresh เสร็จ แล้วยิง request ไปก่อนโดยไม่มี token → ได้ 401 ครั้งนึง → เข้า flow ข้อ 3 (reactive refresh) ต่อเอง ใช้ `refreshPromise` ร่วมกับที่ `AuthBootstrap` เรียกอยู่แล้ว ไม่ยิงซ้ำ — user เห็นแค่ loading นานขึ้นนิดเดียว ไม่เห็น error

### 6) Logout

`useLogout()` (`features/auth/hooks/use-logout.ts`) เรียก `POST /auth/logout` (backend เคลียร์/revoke cookie ฝั่งตัวเอง) จากนั้น `onSettled` (รันไม่ว่า request จะสำเร็จหรือ fail) เคลียร์ store ฝั่ง client เสมอ + `router.replace(ROUTES.LOGIN)` — ใช้ `onSettled` ไม่ใช่ `onSuccess` เพราะต่อให้ยิง logout ไป backend ไม่สำเร็จ (เช่น network error) ฝั่ง client ก็ควรเคลียร์ session ตัวเองอยู่ดี

### Mock caveat

`mocks/fixtures/auth.fixtures.ts` — `authSession` เป็นแค่ module-level variable ในหน่วยความจำของ mock server จำลองแทนที่ httpOnly cookie (ไม่มี cookie จริงเกิดขึ้นเลยตอนใช้ mock) ใช้งานได้ปกติระหว่าง session เดียวกัน (login → เรียก API → refresh ได้) **แต่จะหายทันทีที่ reload หน้าเว็บจริง** เพราะเป็น JS memory ไม่ใช่ cookie ต่างจาก production ที่ reload แล้ว refresh ยังสำเร็จได้เพราะ cookie ยัง persist — จะทดสอบ flow ข้อ 5 (reload แล้วไม่หลุด) ต้องทดสอบกับ backend จริง เปิด mock ไว้จะเห็น logout ทุกครั้งที่ reload เสมอ
