import { createClient } from '@supabase/supabase-js'

/* Baked in so a deployed build needs no environment configuration. The anon
   key is a public credential by design: every user-owned table has row level
   security, so it grants nothing beyond what the app itself exposes. An env
   var still wins, which is how a second project (staging, a fork) is pointed
   at without touching source. */
const FALLBACK_URL = 'https://ohyftxnvvxtojausfdpw.supabase.co'
const FALLBACK_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9oeWZ0eG52dnh0b2phdXNmZHB3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk2NjUzNjAsImV4cCI6MjEwNTI0MTM2MH0.zAEA469NzuTp7oz2Evvaproiz0MxFQDgJW5RsMw1qKo'

const envUrl = import.meta.env.VITE_SUPABASE_URL
const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY
const url = envUrl && !envUrl.includes('YOUR-PROJECT') ? envUrl : FALLBACK_URL
const key = envKey && !envKey.includes('YOUR-ANON-KEY') ? envKey : FALLBACK_KEY

/* The prototype still has to run if the backend is unreachable, so the client
   stays optional and every caller checks `isLive` before reaching for it. */
export const isLive = Boolean(url && key)

export const supabase = isLive
  ? createClient(url, key, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null

export async function signInWithGoogle() {
  if (!supabase) throw new Error('Supabase is not configured')
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: window.location.origin,
      queryParams: { access_type: 'offline', prompt: 'consent' },
    },
  })
  if (error) throw error
}

export async function signOut() {
  if (!supabase) return
  await supabase.auth.signOut()
}
