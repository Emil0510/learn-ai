# API — Route Handlers

Architecture of Next.js API routes (App Router Route Handlers).

## Overview

| Method | Route | Auth | Purpose |
|--------|--------|------|--------|
| POST | `/api/generate` | Optional | PDF → AI → study set; save to DB; return flashcards, MCQs, revision_sheet. |
| GET | `/api/study-sets` | Required | List current user’s study sets. |
| GET | `/api/study-sets/[id]` | Required | Get one study set (must belong to user). |
| DELETE | `/api/study-sets/[id]` | Required | Delete study set (must belong to user). |
| POST | `/api/stripe/checkout` | — | Create Stripe Checkout session (TODO). |
| POST | `/api/stripe/webhook` | Stripe sig | Handle Stripe events (TODO). |

## `/api/generate` (POST)

**File:** `app/api/generate/route.ts`

**Flow:**

1. **Input:** `FormData` with `file` (PDF). Validate: type `application/pdf`, size ≤ 10MB, magic bytes `%PDF`.
2. **PDF → images:** `pdf-to-img`; first 5 pages as base64 data URLs; used for GPT-4o vision.
3. **Storage:** Upload original PDF to Supabase bucket `pdfs` via service client; store public URL in `study_sets.pdf_url`.
4. **OpenAI:** Single chat completion (GPT-4o) with system + user message; user content = text prompt + image parts. Response must be JSON: `flashcards`, `mcqs`, `revision_sheet`.
5. **Parse:** Strip markdown code fences if present; validate arrays and `revision_sheet`.
6. **DB:** Insert into `study_sets` (user_id from `createClient().auth.getUser()`; may be null).
7. **Response:** `{ flashcards, mcqs, revision_sheet, studySetId, title }`.

**Config:** `maxDuration = 60` for long AI calls.

## `/api/study-sets` (GET)

**File:** `app/api/study-sets/route.ts`

- Uses server Supabase client; requires authenticated user (401 if not).
- Selects `id, title, created_at, user_id` for current user, ordered by `created_at` desc.
- Returns `{ studySets: data }`.

## `/api/study-sets/[id]` (GET, DELETE)

**File:** `app/api/study-sets/[id]/route.ts`

- **GET:** Returns full study set row; 404 if not found or not owned by user.
- **DELETE:** Deletes row where `id` and `user_id` match; returns `{ success: true }` or 500 on error.

Both require auth (401 if not logged in).

## Stripe routes (stub)

- **`/api/stripe/checkout` (POST):** Placeholder; returns 501 and message to configure `STRIPE_SECRET_KEY`. Intended: create Checkout session (subscription, trial), return session URL.
- **`/api/stripe/webhook` (POST):** Returns 200; no signature verification or event handling yet. Intended: verify signature, handle `customer.subscription.*`, `invoice.payment_failed`, update user subscription state.

## Conventions

- Use `createClient()` from `@/lib/supabase/server` for user-scoped DB access.
- Use `createServiceClient()` from `@/lib/supabase/service` only for operations that bypass RLS (e.g. storage upload).
- Return JSON with `NextResponse.json()`; use 400/401/404/500 (and 501 for Stripe) as appropriate.
- Do not expose service role key or internal errors to the client.
