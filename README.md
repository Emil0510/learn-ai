# StudyFlash AI (LearnAI)

Turn any PDF into a study set: **flashcards**, **MCQs**, and a **revision sheet** — powered by GPT-4o.

## Quick start

```bash
npm install
# Create .env.local with Supabase + OpenAI keys (see DOCS.md)
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and go to **Get started for free** to upload a PDF and generate materials.

## What you need

- **Supabase**: project URL, anon key, service role key; table `study_sets` and storage bucket `pdfs`.
- **OpenAI**: API key (GPT-4o).
- **Optional**: `NEXT_PUBLIC_SITE_URL` for OAuth redirects.

See **[DOCS.md](DOCS.md)** for full setup, env vars, Supabase schema, and architecture.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server (localhost:3000) |
| `npm run build` | Production build |
| `npm run start` | Run production server |
| `npm run lint` | Run ESLint |

## Docs

- **[DOCS.md](DOCS.md)** — Project documentation (features, env, API, deployment).
- **[ARCHITECTURE.md](ARCHITECTURE.md)** — Architecture overview; see also `app/`, `app/api/`, `app/auth/`, `lib/`, `components/` for per-area architecture (`.md` and `.mdc`).

## Tech

Next.js 14 (App Router), TypeScript, Supabase (Auth + DB + Storage), OpenAI GPT-4o, Tailwind CSS.
