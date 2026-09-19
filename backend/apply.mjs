/* Applies the whole backend to a Supabase project in one command:
   every migration in order, then the seed. Both halves are idempotent, so
   re-running is safe and is the normal way to pick up a new migration.

   The connection string is read from the environment and never committed:
     Dashboard -> Project Settings -> Database -> Connection string -> URI

     DATABASE_URL='postgresql://...' npm run apply        (bash)
     $env:DATABASE_URL='postgresql://...'; npm run apply  (PowerShell)
*/
import { readFileSync, readdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import pg from 'pg'

const here = dirname(fileURLToPath(import.meta.url))
const sqlDir = join(here, 'supabase')

const url = process.env.DATABASE_URL
if (!url) {
  console.error(
    'DATABASE_URL is not set.\n' +
      'Supabase dashboard -> Project Settings -> Database -> Connection string -> URI,\n' +
      'then re-run. See backend/README.md.',
  )
  process.exit(1)
}

const migrations = readdirSync(join(sqlDir, 'migrations'))
  .filter((f) => f.endsWith('.sql'))
  .sort()
  .map((f) => [`migrations/${f}`, join(sqlDir, 'migrations', f)])

const files = [...migrations, ['seed.sql', join(sqlDir, 'seed.sql')]]

/* Supabase terminates TLS with a certificate this client has no root for;
   the connection is still encrypted. */
const client = new pg.Client({ connectionString: url, ssl: { rejectUnauthorized: false } })

try {
  await client.connect()
  for (const [label, path] of files) {
    process.stdout.write(`${label.padEnd(28)} `)
    await client.query(readFileSync(path, 'utf8'))
    console.log('ok')
  }

  /* The catalog is what the onboarding screens read; an empty one means the
     app silently falls back to its bundled copy, so it is worth showing. */
  const counts = await client.query(
    `select 'professions' as t, count(*) from professions
     union all select 'niches', count(*) from niches
     union all select 'voices', count(*) from voices
     union all select 'stories', count(*) from stories
     order by t`,
  )
  console.log('\nrows:')
  for (const { t, count } of counts.rows) console.log(`  ${t.padEnd(14)} ${count}`)
} catch (err) {
  console.error(`\nfailed: ${err.message}`)
  process.exitCode = 1
} finally {
  await client.end()
}
