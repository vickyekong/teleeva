# AGENTS.md

## Cursor Cloud specific instructions

### Overview
MedConnect is a Next.js 16 (App Router) healthcare platform using React 19, Tailwind CSS v4, and Supabase (PostgreSQL + Auth). Single-package repo; not a monorepo.

### Running the app
- `npm run dev` starts the Turbopack dev server on port 3000.
- `npm run dev:webpack` uses webpack instead (slower but more compatible).

### Lint / Build / Test
- `npm run lint` — runs ESLint. Pre-existing warnings and errors exist in the codebase; the repo has `typescript: { ignoreBuildErrors: true }` in `next.config.ts`.
- `npm run build` — production build (requires `.env.local` with Supabase env vars, even if placeholders).
- `sh scripts/test-all.sh` — runs lint + build + basic API smoke tests.
- `npm run test:dispatch` — tests the dispatch API endpoint against a running dev server.

### Environment variables
A `.env.local` file is required. See `env.local.example` for the template. At minimum, `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` must be set (placeholder values are sufficient for the dev server to start, but real credentials are needed for auth/data features). `OPENAI_API_KEY` is optional and only needed for the Eva AI diagnosis feature.

### Gotchas
- The contact form (`/contact`) and AI diagnosis (`/ai-diagnosis`) API routes require a running Supabase instance and/or OpenAI API key for full functionality. Without real credentials, these endpoints return errors, but the UI renders correctly.
- Individual provider profile pages (e.g. `/marketplace/provider/...`) are not yet implemented and return 404.
- SQL migrations are in `supabase/migrations/` and must be applied to a Supabase instance for data features to work.
