# Backend

Supabase — Postgres, auth and realtime. There is no server to deploy here: the
whole backend is schema, policies and triggers, applied to a Supabase project.

```
supabase/migrations/0001_init.sql   tables, RLS policies, triggers, realtime
supabase/seed.sql                   catalog rows and placeholder editorial
```

## Apply it

**Dashboard.** Open the project → SQL Editor → paste `0001_init.sql`, run it,
then paste `seed.sql` and run that. Both are idempotent (`if not exists`,
`where not exists`), so re-running is safe.

**CLI.**

```bash
supabase link --project-ref <your-project-ref>
supabase db push
psql "$DATABASE_URL" -f supabase/seed.sql
```

Then enable Google under Authentication → Providers, and add your deployed
origin to the redirect allow-list.

## Shape

| Table | Holds |
| --- | --- |
| `professions`, `niches`, `voices` | The onboarding catalog. Public read. |
| `profiles` | One row per signed-in person: language, profession, voice, brief length, delivery hour, notification and location flags. Created by trigger on signup. |
| `profile_niches` | The follow list. A trigger caps it at seven per profile. |
| `stories` | Editorial. `is_sample` flags placeholder copy so the UI can never present invented text as real reporting. |
| `briefs`, `brief_stories` | One assembled morning for one person. |
| `saved_stories` | Bookmarks, synced across devices. |
| `playback_state` | Position, so a second device resumes mid-sentence. |

## Security

Row level security is on for every table. Catalog and stories are public read;
everything keyed to a profile is readable and writable only by that profile's
owner (`auth.uid() = profile_id`). The niche cap is enforced by trigger rather
than by trusting the client. This is what makes the anon key safe to ship in a
browser bundle.

Realtime is published on `stories`, `saved_stories`, `playback_state` and
`briefs` — a story inserted in Postgres reaches an open app with no refresh.
