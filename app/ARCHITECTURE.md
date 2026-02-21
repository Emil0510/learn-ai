# App — Routes & Pages

Architecture of the Next.js App Router: layouts, pages, and route groups.

## Route Structure

```
app/
├── layout.tsx                 # Root layout (Inter font, globals.css, metadata)
├── page.tsx                   # Landing (/) — public
├── globals.css                # Design tokens, flip-card, prose
├── pricing/
│   └── page.tsx               # Pricing — public
├── auth/
│   ├── sign-in/page.tsx       # Google sign-in — public
│   └── callback/route.ts      # OAuth code → session, redirect
├── (app)/                     # Route group: app shell (sidebar + navbar)
│   ├── layout.tsx             # Sidebar + Navbar + main
│   ├── dashboard/page.tsx     # My study sets — protected
│   └── generate/page.tsx      # Upload PDF, view results — public
└── api/                       # See app/api/ARCHITECTURE.md
```

## Layouts

### Root (`app/layout.tsx`)

- Wraps all routes.
- Applies Inter font and `globals.css`.
- Metadata: title and description for StudyFlash AI.

### App shell (`app/(app)/layout.tsx`)

- Wraps `/dashboard` and `/generate` only (not `/`, `/pricing`, `/auth`).
- Client component: `Sidebar` (fixed left) + `Navbar` (top) + `main` (children).
- Mobile: sidebar toggled via `Navbar` menu; overlay + close in `Sidebar`.

## Pages

| Route | File | Purpose |
|-------|------|--------|
| `/` | `app/page.tsx` | Landing: hero, features, CTA to `/generate`. |
| `/pricing` | `app/pricing/page.tsx` | Pro plan ($7/mo, 14-day trial); CTA not wired to Stripe yet. |
| `/auth/sign-in` | `app/auth/sign-in/page.tsx` | Google OAuth; redirectTo `/auth/callback`. |
| `/dashboard` | `app/(app)/dashboard/page.tsx` | List user’s study sets; links to `/generate?id=<id>`; delete with confirm. Protected by middleware. |
| `/generate` | `app/(app)/generate/page.tsx` | PDF upload → generate → tabs (Flashcards, MCQs, Revision). Optional `?id=` loads existing set. |

## Auth Callback

- **File:** `app/auth/callback/route.ts`
- **Query:** `code` (from OAuth), optional `next` (default `/generate`).
- **Behavior:** Exchange code for Supabase session → redirect to `origin + next` or `/auth/sign-in?error=auth_callback_error`.

## Protection

- **Middleware** (`middleware.ts`): calls `updateSession` from `lib/supabase/middleware.ts`. Redirects unauthenticated users from `/dashboard` to `/auth/sign-in`. No protection on `/generate` (guest allowed).

## Conventions

- Public marketing pages (landing, pricing, sign-in) use minimal header/footer and no sidebar.
- App pages (dashboard, generate) use the `(app)` layout with sidebar and navbar.
- `export const dynamic = "force-dynamic"` is used where fresh data is required (e.g. dashboard, generate).
