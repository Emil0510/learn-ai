# Auth — Sign-in & Callback

Architecture of authentication: Google OAuth, callback, and session handling.

## Routes

| Path | Type | Purpose |
|------|------|--------|
| `/auth/sign-in` | Page | Sign-in UI; “Continue with Google” starts OAuth. |
| `/auth/callback` | Route Handler | Receives OAuth `code`, exchanges for Supabase session, redirects. |

## Sign-in page (`app/auth/sign-in/page.tsx`)

- **Client component.** Renders StudyFlash logo, “Welcome back”, and a single button: “Continue with Google”.
- **Flow:** On click, creates Supabase client (`lib/supabase/client`), calls `signInWithOAuth({ provider: "google", options: { redirectTo: `${NEXT_PUBLIC_SITE_URL}/auth/callback` } })`. User is sent to Google; after consent, Google redirects to `/auth/callback?code=...`.
- **Footer:** Link to “Generate without signing in” (`/generate`).

## Callback route (`app/auth/callback/route.ts`)

- **GET handler.** Reads `code` and optional `next` from query (default `next` is `/generate`).
- **Flow:** Creates server Supabase client (`lib/supabase/server`), calls `exchangeCodeForSession(code)`. On success, redirects to `${origin}${next}`. On error, redirects to `/auth/sign-in?error=auth_callback_error`.
- **Note:** `origin` is from `request.url` so redirect stays on the same host.

## Session & protection

- Session is stored in cookies; Supabase SSR handles cookie read/write.
- **Middleware** (`lib/supabase/middleware.ts`) runs on every request: refreshes session and, if path is `/dashboard` and there is no user, redirects to `/auth/sign-in`.
- Server code uses `createClient()` from `lib/supabase/server` and `getUser()` for current user. Client code uses `createClient()` from `lib/supabase/client` for `getUser()`, `onAuthStateChange`, and `signOut`.

## Env

- **NEXT_PUBLIC_SITE_URL** — Used as OAuth `redirectTo` base (e.g. `https://yourapp.com`). Must match Supabase “Site URL” / redirect allowlist.
- Supabase: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` (and service role only on server).

## Conventions

- Use server client in Route Handlers and Server Components; use browser client in client components for sign-in, sign-out, and auth state.
- Do not put secrets in client; only anon key and URL are public.
