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

## Connect the backend

1. Create a Supabase project.
2. Run `backend/supabase/migrations/0001_init.sql`, then `backend/supabase/seed.sql`
   in the SQL editor. Details in [backend/README.md](backend/README.md).
3. Copy `frontend/.env.example` to `frontend/.env.local` and fill in the project
   URL and anon key.
4. Enable the Google provider under Authentication → Providers.

Restart `npm run dev`. Sign-in becomes a real Google redirect, onboarding writes
to a profile row, and saved stories sync across devices.

## Build

```bash
cd frontend && npm run build   # -> frontend/dist
```

## Status

The prototype is complete and clickable end to end. All editorial is
placeholder, flagged in the UI behind a SAMPLE marker — no real journalism and
no real outlet is attributed anywhere. Audio narration and brief assembly are
not built yet; the player runs on a timer against declared run lengths.
