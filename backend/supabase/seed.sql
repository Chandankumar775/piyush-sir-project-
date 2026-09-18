-- Nuzio AI — seed data.
-- Reference rows are real product truth. Stories are placeholder editorial and
-- are flagged is_sample = true so the app always marks them as such.

insert into professions (id, label, icon, sort) values
  ('finance',    'Finance & Trading', 'finance',    1),
  ('legal',      'Legal',             'legal',      2),
  ('tech',       'Technology',        'tech',       3),
  ('health',     'Healthcare',        'health',     4),
  ('consulting', 'Consulting',        'consulting', 5),
  ('marketing',  'Marketing',         'marketing',  6),
  ('policy',     'Government',        'policy',     7),
  ('realestate', 'Real Estate',       'realestate', 8),
  ('education',  'Education',         'education',  9),
  ('founder',    'Founder',           'founder',   10),
  ('industry',   'Manufacturing',     'industry',  11),
  ('design',     'Design',            'design',    12)
on conflict (id) do update
  set label = excluded.label, icon = excluded.icon, sort = excluded.sort;

insert into niches (id, label, icon, sort) values
  ('ai',          'AI & Technology', 'ai',          1),
  ('markets',     'Markets',         'markets',     2),
  ('india',       'Indian Business', 'india',       3),
  ('world',       'World Politics',  'world',       4),
  ('startups',    'Startups',        'startups',    5),
  ('science',     'Science',         'science',     6),
  ('geopolitics', 'Geopolitics',     'geopolitics', 7),
  ('medicine',    'Health',          'medicine',    8),
  ('climate',     'Climate',         'climate',     9),
  ('sports',      'Sports',          'sports',     10),
  ('culture',     'Culture',         'culture',    11),
  ('lawpolicy',   'Law & Policy',    'lawpolicy',  12),
  ('crypto',      'Crypto',          'crypto',     13),
  ('property',    'Property',        'property',   14),
  ('cinema',      'Cinema',          'cinema',     15)
on conflict (id) do update
  set label = excluded.label, icon = excluded.icon, sort = excluded.sort;

insert into voices (id, name, initial, lang, lang_label, line, is_premium, sort) values
  ('aria',  'Aria',  'A', 'en', 'EN',
   'Warm, unhurried. British English.', false, 1),
  ('kai',   'Kai',   'K', 'en', 'EN',
   'Crisp, focused. American English.', false, 2),
  ('meera', 'Meera', 'M', 'hi', 'हिन्दी',
   'चमकदार और स्पष्ट। भारतीय हिन्दी।', false, 3)
on conflict (id) do update
  set name = excluded.name, line = excluded.line, lang_label = excluded.lang_label;

-- Placeholder editorial. Invented for the prototype; no real outlet is named.
insert into stories (niche_id, headline, summary, outlet, filed_at, run_seconds, is_sample)
select * from (values
  ('ai',
   'Anthropic ships Claude 4.5 with a 2M-token memory and native tool use.',
   'The new memory layer lets Claude hold entire codebases in mind while it works — a direct move on enterprise developer tooling.',
   'Sample wire', now() - interval '3 hours', 124, true),
  ('markets',
   'RBI holds rates as inflation cools to a fourteen-month low.',
   'Officials flagged growing confidence that prices are settling back toward the target band.',
   'Sample wire', now() - interval '2 hours 30 minutes', 98, true),
  ('startups',
   'Zepto raises $350M at a $5B valuation.',
   'The round is led by existing investors and values the ten-minute delivery firm above its listed rivals.',
   'Sample wire', now() - interval '4 hours', 72, true),
  ('climate',
   'Solar now prices below coal in six states.',
   'New tariff filings put unsubsidised solar under thermal power across most of the western grid.',
   'Sample wire', now() - interval '3 hours 40 minutes', 84, true),
  ('india',
   'Festive quarter lifts small-town consumption above metro growth.',
   'Rural demand outpaced the cities for a third straight quarter, reshaping where brands spend.',
   'Sample wire', now() - interval '5 hours', 91, true),
  ('science',
   'A room-temperature superconductor claim fails replication again.',
   'Three independent labs could not reproduce the effect, and the original team has withdrawn a key figure.',
   'Sample wire', now() - interval '6 hours', 110, true)
) as s(niche_id, headline, summary, outlet, filed_at, run_seconds, is_sample)
where not exists (select 1 from stories where stories.headline = s.headline);
