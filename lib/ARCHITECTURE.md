# Lib — Shared Libraries

Architecture of the `lib/` folder: Supabase, OpenAI, types, and auth helpers.

## Layout

```
lib/
├── ARCHITECTURE.md     ← This file
├── types.ts            # Shared TS types (Flashcard, MCQ, StudySet, GenerateResponse, Json)
├── openai.ts           # OpenAI client singleton
├── auth.ts             # (if present) Auth helpers
└── supabase/
    ├── server.ts       # createClient() for server (cookies)
    ├── client.ts       # createClient() for browser
    ├── middleware.ts   # updateSession() for middleware
    └── service.ts      # createServiceClient() for server-only, bypasses RLS
```

## Types (`lib/types.ts`)

- **Json** — Recursive JSON type for Supabase/API.
- **Flashcard** — `{ question: string; answer: string }`.
- **MCQ** — `{ question, options[], correct (index 0–3), explanation, image_url? }`.
- **StudySet** — DB row: `id`, `user_id`, `title`, `pdf_url`, `flashcards`, `mcqs`, `revision_sheet`, `created_at`.
- **GenerateResponse** — API shape: `flashcards`, `mcqs`, `revision_sheet`, `studySetId`, `title`.

Used by: API routes, generate page, StudyMaterials and child components.

## OpenAI (`lib/openai.ts`)

- Default export: `new OpenAI({ apiKey: process.env.OPENAI_API_KEY })`.
- Used only on the server (e.g. `app/api/generate/route.ts`).
- Ensure `OPENAI_API_KEY` is set in env.

## Supabase

### Server client (`lib/supabase/server.ts`)

- **createClient()** — Async; uses `cookies()` from `next/headers`. For Server Components, Route Handlers, Server Actions. Respects RLS; user from session.

### Browser client (`lib/supabase/client.ts`)

- **createClient()** — For client components. Cookie-based session; used for `getUser()`, `signInWithOAuth`, `signOut`, and client-side fetches (e.g. dashboard list, generate load by id).

### Middleware (`lib/supabase/middleware.ts`)

- **updateSession(request)** — Creates Supabase client with request/response cookies, calls `getUser()` to refresh session, protects `/dashboard` (redirect to `/auth/sign-in` if no user). Skips if Supabase env vars are missing.

### Service client (`lib/supabase/service.ts`)

- **createServiceClient()** — Uses `SUPABASE_SERVICE_ROLE_KEY`; no user context; bypasses RLS. Use only on server for storage uploads or admin-style operations. Never expose to the client.

## Auth

- Auth state: Supabase session in cookies; middleware refreshes it.
- No dedicated `lib/auth.ts` logic required for current flows; sign-in and callback live in `app/auth/` and use Supabase client/server as above.

## Conventions

- Prefer `createClient()` (server or client) for user-scoped DB and auth.
- Use service client only when RLS must be bypassed (e.g. uploading to a bucket that has no public insert policy for anon).
- Keep types in `types.ts` so API and UI stay in sync.
