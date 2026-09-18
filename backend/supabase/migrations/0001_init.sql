-- Nuzio AI — initial schema
-- Reference tables are world-readable; everything user-owned is locked to the
-- owner by RLS. Realtime is enabled on the tables the app subscribes to.

create extension if not exists "pgcrypto";

-- ============================================================
-- Reference data (public read, service-role write)
-- ============================================================

create table if not exists professions (
  id    text primary key,
  label text not null,
  icon  text not null,
  sort  int  not null default 0
);

create table if not exists niches (
  id    text primary key,
  label text not null,
  icon  text not null,
  sort  int  not null default 0
);

create table if not exists voices (
  id         text primary key,
  name       text not null,
  initial    text not null,
  lang       text not null check (lang in ('en', 'hi')),
  lang_label text not null,
  line       text not null,
  is_premium boolean not null default false,
  sort       int not null default 0
);

-- ============================================================
-- Profiles
-- ============================================================

create table if not exists profiles (
  id                    uuid primary key references auth.users on delete cascade,
  display_name          text,
  avatar_url            text,
  city                  text,
  language              text not null default 'en' check (language in ('en', 'hi')),
  profession_id         text references professions (id),
  voice_id              text references voices (id),
  brief_minutes         int  not null default 5 check (brief_minutes between 1 and 60),
  delivery_time         time not null default '07:00',
  notifications_enabled boolean not null default true,
  location_enabled      boolean not null default false,
  auto_advance          boolean not null default true,
  offline_mode          boolean not null default false,
  onboarded_at          timestamptz,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

create table if not exists profile_niches (
  profile_id uuid not null references profiles (id) on delete cascade,
  niche_id   text not null references niches (id) on delete cascade,
  primary key (profile_id, niche_id)
);

-- At most seven niches per profile, enforced in the database rather than
-- trusting the client.
create or replace function enforce_niche_limit() returns trigger as $$
begin
  if (select count(*) from profile_niches where profile_id = new.profile_id) > 7 then
    raise exception 'A profile may follow at most 7 niches';
  end if;
  return new;
end;
$$ language plpgsql;

drop trigger if exists profile_niches_limit on profile_niches;
create constraint trigger profile_niches_limit
  after insert on profile_niches
  deferrable initially deferred
  for each row execute function enforce_niche_limit();

-- ============================================================
-- Editorial
-- ============================================================

create table if not exists stories (
  id           uuid primary key default gen_random_uuid(),
  niche_id     text not null references niches (id),
  headline     text not null,
  summary      text not null,
  body         text,
  outlet       text,
  source_url   text,
  filed_at     timestamptz not null default now(),
  run_seconds  int not null default 90 check (run_seconds > 0),
  audio_url    text,
  language     text not null default 'en' check (language in ('en', 'hi')),
  -- Placeholder editorial is flagged so the UI can never present invented
  -- copy as real reporting.
  is_sample    boolean not null default true,
  created_at   timestamptz not null default now()
);

create index if not exists stories_niche_filed_idx on stories (niche_id, filed_at desc);
create index if not exists stories_filed_idx on stories (filed_at desc);

-- A brief is one assembled morning for one person.
create table if not exists briefs (
  id            uuid primary key default gen_random_uuid(),
  profile_id    uuid not null references profiles (id) on delete cascade,
  brief_date    date not null default current_date,
  status        text not null default 'ready'
                check (status in ('assembling', 'ready', 'played')),
  total_seconds int not null default 0,
  created_at    timestamptz not null default now(),
  unique (profile_id, brief_date)
);

create table if not exists brief_stories (
  brief_id uuid not null references briefs (id) on delete cascade,
  story_id uuid not null references stories (id) on delete cascade,
  position int  not null,
  primary key (brief_id, story_id),
  unique (brief_id, position)
);

create table if not exists saved_stories (
  profile_id uuid not null references profiles (id) on delete cascade,
  story_id   uuid not null references stories (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (profile_id, story_id)
);

-- Where the listener is, right now. Written as playback moves, so a second
-- device can pick the brief up mid-sentence.
create table if not exists playback_state (
  profile_id      uuid primary key references profiles (id) on delete cascade,
  story_id        uuid references stories (id) on delete set null,
  elapsed_seconds numeric not null default 0,
  is_playing      boolean not null default false,
  rate            numeric not null default 1,
  updated_at      timestamptz not null default now()
);

-- ============================================================
-- Profile bootstrap on signup
-- ============================================================

create or replace function handle_new_user() returns trigger
  security definer set search_path = public as $$
begin
  insert into public.profiles (id, display_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name'),
    new.raw_user_meta_data ->> 'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

create or replace function touch_updated_at() returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists profiles_touch on profiles;
create trigger profiles_touch before update on profiles
  for each row execute function touch_updated_at();

-- ============================================================
-- Row level security
-- ============================================================

alter table professions    enable row level security;
alter table niches         enable row level security;
alter table voices         enable row level security;
alter table stories        enable row level security;
alter table profiles       enable row level security;
alter table profile_niches enable row level security;
alter table briefs         enable row level security;
alter table brief_stories  enable row level security;
alter table saved_stories  enable row level security;
alter table playback_state enable row level security;

-- Reference and editorial data: readable by anyone, writable only by the
-- service role (which bypasses RLS).
drop policy if exists "read professions" on professions;
create policy "read professions" on professions for select using (true);

drop policy if exists "read niches" on niches;
create policy "read niches" on niches for select using (true);

drop policy if exists "read voices" on voices;
create policy "read voices" on voices for select using (true);

drop policy if exists "read stories" on stories;
create policy "read stories" on stories for select using (true);

-- Everything below is owner-only.
drop policy if exists "own profile" on profiles;
create policy "own profile" on profiles
  for all using (auth.uid() = id) with check (auth.uid() = id);

drop policy if exists "own niches" on profile_niches;
create policy "own niches" on profile_niches
  for all using (auth.uid() = profile_id) with check (auth.uid() = profile_id);

drop policy if exists "own briefs" on briefs;
create policy "own briefs" on briefs
  for all using (auth.uid() = profile_id) with check (auth.uid() = profile_id);

drop policy if exists "own brief stories" on brief_stories;
create policy "own brief stories" on brief_stories
  for all using (
    exists (select 1 from briefs b where b.id = brief_id and b.profile_id = auth.uid())
  ) with check (
    exists (select 1 from briefs b where b.id = brief_id and b.profile_id = auth.uid())
  );

drop policy if exists "own saved" on saved_stories;
create policy "own saved" on saved_stories
  for all using (auth.uid() = profile_id) with check (auth.uid() = profile_id);

drop policy if exists "own playback" on playback_state;
create policy "own playback" on playback_state
  for all using (auth.uid() = profile_id) with check (auth.uid() = profile_id);

-- ============================================================
-- Realtime
-- ============================================================

-- Supabase may already have some of these in the publication, and adding a
-- table twice is a hard error that rolls the whole migration back. Add only
-- what is missing, so this file stays re-runnable.
do $$
declare t text;
begin
  foreach t in array array['stories', 'briefs', 'saved_stories', 'playback_state'] loop
    if not exists (
      select 1 from pg_publication_tables
      where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = t
    ) then
      execute format('alter publication supabase_realtime add table public.%I', t);
    end if;
  end loop;
end $$;

-- Realtime delivers old-row data on update/delete only with full replica
-- identity; without it, the client cannot tell which row changed.
alter table saved_stories  replica identity full;
alter table playback_state replica identity full;
alter table briefs         replica identity full;
