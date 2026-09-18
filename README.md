# Nuzio AI

A short, personalised audio news brief every morning. The listener picks a
language, a set of niches, a narrator, a length and a delivery hour; Nuzio
assembles and narrates a brief matching those choices and has it waiting at
that time.

Product decisions, brand commitments and constraints live in [PRODUCT.md](PRODUCT.md).

## Layout

```
frontend/   React + Vite app — every screen, the player, the design system
backend/    Supabase schema: tables, row level security, triggers, seed data
```

The two halves are independent. The frontend runs with no backend at all: with
no Supabase credentials configured it falls back to a bundled catalog and
placeholder editorial, and preferences persist to `localStorage` instead of a
profile row. Add credentials and the same screens read and write Postgres.

## Run the frontend

```bash
cd frontend
npm install
npm run dev
```

Opens on <http://localhost:5173>. Arrow keys move between screens; the rail on
the right jumps to any of the thirteen.

## Backend

A Supabase project URL and anon key are baked into `frontend/src/lib/supabase.js`,
so a deployed build needs no environment configuration. To point the app at a
different project, copy `frontend/.env.example` to `frontend/.env.local` and fill
it in — an env var overrides the baked-in default.

To stand a project up from scratch:

1. Create a Supabase project.
2. Run `backend/supabase/migrations/0001_init.sql`, then `backend/supabase/seed.sql`
   in the SQL editor. Details in [backend/README.md](backend/README.md).
3. Enable the Google provider under Authentication → Providers, and add your
   deployed origin to the redirect allow-list.

With the seed applied, the catalog and feed come from Postgres; without it the
app falls back to the bundled catalog and placeholder editorial, so every screen
works either way. With Google enabled, sign-in is a real redirect and onboarding
writes to a profile row; without it, "Continue without signing in" walks through
the same flow against local state.

## Build

```bash
cd frontend && npm run build   # -> frontend/dist
```

## Status

The prototype is complete and clickable end to end. All editorial is
placeholder, flagged in the UI behind a SAMPLE marker — no real journalism and
no real outlet is attributed anywhere. Audio narration and brief assembly are
not built yet; the player runs on a timer against declared run lengths.
