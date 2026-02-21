# StudyFlash AI — Project Documentation

Documentation for **LearnAI** (product name: **StudyFlash AI**): turn any PDF into a study set with flashcards, MCQs, and a revision sheet using GPT-4o.

---

## Table of contents

1. [Overview](#overview)
2. [Features](#features)
3. [Tech stack](#tech-stack)
4. [Getting started](#getting-started)
5. [Environment variables](#environment-variables)
6. [Project structure](#project-structure)
7. [User flows](#user-flows)
8. [API reference](#api-reference)
9. [Architecture docs](#architecture-docs)
10. [Deployment](#deployment)

---

## Overview

StudyFlash AI is a web app where users:

- **Upload a PDF** (lecture notes, textbook, paper).
- **Get study materials** in seconds: 15 flashcards, 10 multiple-choice questions, and a markdown revision sheet.
- **Review** via tabs: flip cards, take the quiz, or read the revision sheet.
- **Optional sign-in** (Google): study sets are saved and listed on the Dashboard; guests can still generate without an account.

The AI uses **GPT-4o** with vision: PDF pages are converted to images (first 5 pages) and sent with a structured prompt so the model can handle text, diagrams, and charts.

---

## Features

| Feature | Description |
|--------|-------------|
| PDF upload | Single PDF, max 10MB; validated type and magic bytes. |
| AI generation | GPT-4o vision + text; JSON output (flashcards, MCQs, revision_sheet). |
| Flashcards | Flip-card UI with prev/next; 15 cards per set. |
| MCQs | 10 questions, 4 options each; show correct answer and explanation after choice. |
| Revision sheet | Markdown summary with headings and bullets; rendered with custom prose styles. |
| Guest mode | Generate without signing in; set is not saved to account. |
| Sign-in (Google) | Save sets to account; list and open from Dashboard; delete sets. |
| Pricing page | Pro plan ($7/mo, 14-day trial); Stripe integration is stubbed (TODO). |

---

## Tech stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Auth | Supabase Auth (Google OAuth) |
| Database | Supabase (PostgreSQL) |
| Storage | Supabase Storage (PDFs bucket) |
| AI | OpenAI GPT-4o (vision + text) |
| Payments | Stripe (checkout + webhook routes present, not wired) |
| UI | React, Tailwind CSS, Lucide icons, custom design tokens |
| PDF → images | `pdf-to-img` |
| Markdown | `react-markdown` |

---

## Getting started

### Prerequisites

- Node.js 18+
- npm, yarn, pnpm, or bun

### Install

```bash
git clone <repo-url>
cd learnai
npm install
```

### Environment

Create `.env.local` in the project root with the [required variables](#environment-variables). At minimum you need Supabase and OpenAI for the core flow.

### Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). You can:

- Open **Get started for free** → upload a PDF on `/generate` → generate study materials.
- Go to **Sign in** → use Google (requires Supabase auth and redirect URL configured).
- After sign-in, use **Dashboard** to see saved study sets.

### Build

```bash
npm run build
npm run start
```

### Lint

```bash
npm run lint
```

---

## Environment variables

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase anon/public key. |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Supabase service role key (server only; for storage uploads). |
| `OPENAI_API_KEY` | Yes | OpenAI API key (for GPT-4o). |
| `NEXT_PUBLIC_SITE_URL` | Recommended | Site URL (e.g. `http://localhost:3000` or `https://yourapp.com`). Must match the URL you actually use to open the app and the port your dev server runs on (e.g. use `http://localhost:3001` if the app runs on 3001). Used for OAuth redirect. |
| `STRIPE_SECRET_KEY` | No | For Stripe checkout (currently not implemented). |
| `STRIPE_WEBHOOK_SECRET` | No | For Stripe webhooks (currently not implemented). |

**Supabase setup**

1. Create a project at [supabase.com](https://supabase.com).
2. In Authentication → Providers, enable Google and set redirect URL(s) (e.g. `http://localhost:3000/auth/callback`).
3. Create a table `study_sets` with columns: `id` (uuid, default `gen_random_uuid()`), `user_id` (uuid, nullable), `title` (text), `pdf_url` (text, nullable), `flashcards` (jsonb), `mcqs` (jsonb), `revision_sheet` (text), `created_at` (timestamptz, default `now()`). Add RLS policies so users can read/insert/delete only their own rows (`user_id = auth.uid()`).
4. Create a Storage bucket `pdfs` (e.g. public or with policies that allow upload via service role).
5. Copy project URL, anon key, and service role key into `.env.local`.

---

## Project structure

```
learnai/
├── app/                    # Next.js App Router
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Landing
│   ├── globals.css         # Design tokens, utilities
│   ├── pricing/            # Pricing page
│   ├── auth/               # Sign-in, OAuth callback
│   ├── (app)/              # App shell (sidebar + navbar)
│   │   ├── layout.tsx      # Sidebar + Navbar
│   │   ├── dashboard/      # My study sets
│   │   └── generate/       # Upload PDF, view results
│   └── api/                # Route handlers
│       ├── generate/       # POST: PDF → AI → study set
│       ├── study-sets/     # GET list, GET/DELETE by id
│       └── stripe/         # Checkout, webhook (stub)
├── components/             # React components
│   ├── Navbar.tsx
│   ├── Sidebar.tsx
│   ├── PdfUpload.tsx
│   ├── StudyMaterials.tsx  # Tabs: Flashcards, MCQs, Revision
│   ├── Flashcards.tsx
│   ├── McqQuiz.tsx
│   ├── RevisionSheet.tsx
│   └── ui/                 # Button, Card, Tabs, Callout, Input
├── lib/
│   ├── types.ts            # Flashcard, MCQ, StudySet, GenerateResponse
│   ├── openai.ts           # OpenAI client
│   └── supabase/           # server, client, middleware, service
├── middleware.ts           # Session refresh, protect /dashboard
├── DOCS.md                 # This file
├── ARCHITECTURE.md         # Architecture overview
└── README.md               # Quick start
```

---

## User flows

### Generate (guest or signed-in)

1. User goes to `/generate`.
2. Selects or drops a PDF (max 10MB).
3. Clicks **Generate Study Materials**.
4. Client sends `POST /api/generate` with the file.
5. Server: validate PDF → convert first 5 pages to images → upload PDF to Supabase Storage → call GPT-4o with images + prompt → parse JSON → insert `study_sets` row (with `user_id` if logged in, else `null`) → return `{ flashcards, mcqs, revision_sheet, studySetId, title }`.
6. Client shows tabs: Flashcards, MCQs, Revision Sheet. If guest, a banner suggests signing in to save.

### Sign-in

1. User clicks **Sign in** (e.g. from navbar or landing).
2. Redirected to `/auth/sign-in` → clicks **Continue with Google**.
3. After Google consent, redirect to `/auth/callback?code=...`.
4. Server exchanges `code` for Supabase session, sets cookies, redirects to `/generate` (or `next` param).
5. Middleware refreshes session on each request; `/dashboard` redirects to sign-in if not authenticated.

### Dashboard

1. User goes to `/dashboard` (protected).
2. Page fetches study sets from Supabase (`study_sets` where `user_id = current user`).
3. Each row links to `/generate?id=<id>` (loads that set). Delete with confirm.

---

## API reference

| Method | Route | Auth | Description |
|--------|--------|------|-------------|
| POST | `/api/generate` | Optional | Body: `FormData` with `file` (PDF). Returns `{ flashcards, mcqs, revision_sheet, studySetId, title }` or error. |
| GET | `/api/study-sets` | Required | Returns `{ studySets: [{ id, title, created_at, user_id }] }`. |
| GET | `/api/study-sets/[id]` | Required | Returns `{ studySet }` (full row) or 404. |
| DELETE | `/api/study-sets/[id]` | Required | Deletes set; returns `{ success: true }` or 500. |
| POST | `/api/stripe/checkout` | — | Stub: 501, not implemented. |
| POST | `/api/stripe/webhook` | Stripe sig | Stub: returns 200, no handling. |

Generate uses `maxDuration = 60` (seconds). All JSON responses; errors use `{ error: "message" }` with appropriate status codes.

---

## Architecture docs

Detailed architecture is split by area (each has both `.md` and `.mdc`):

- **[ARCHITECTURE.md](ARCHITECTURE.md)** — Overview, stack, data flow, auth.
- **[app/ARCHITECTURE.md](app/ARCHITECTURE.md)** — Routes, layouts, pages.
- **[app/api/ARCHITECTURE.md](app/api/ARCHITECTURE.md)** — API route handlers.
- **[app/auth/ARCHITECTURE.md](app/auth/ARCHITECTURE.md)** — Sign-in and callback.
- **[lib/ARCHITECTURE.md](lib/ARCHITECTURE.md)** — Types, OpenAI, Supabase clients.
- **[components/ARCHITECTURE.md](components/ARCHITECTURE.md)** — UI components.

Use the `.mdc` versions in the same folders if you use content collections or MDX.

---

## Deployment

- **Vercel**: Connect the repo; set env vars in the dashboard; ensure `NEXT_PUBLIC_SITE_URL` is your production URL and add it to Supabase redirect URLs.
- **Node**: `npm run build` then `npm run start`; set env and optionally use a process manager (e.g. PM2).

For production:

- Use a real `NEXT_PUBLIC_SITE_URL` and add it (and `/auth/callback`) to Supabase Auth redirect URLs.
- Keep `SUPABASE_SERVICE_ROLE_KEY` and `OPENAI_API_KEY` server-only and never commit them.

---

## Data model (summary)

- **study_sets**: `id`, `user_id` (nullable), `title`, `pdf_url`, `flashcards` (JSON array of `{ question, answer }`), `mcqs` (JSON array of `{ question, options, correct, explanation }`), `revision_sheet` (markdown string), `created_at`.

See [lib/types.ts](lib/types.ts) for TypeScript interfaces.
