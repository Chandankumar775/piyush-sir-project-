import { supabase, isLive } from './supabase.js'
import { PROFESSIONS, NICHES, VOICES, STORIES } from '../data/catalog.js'

/* Every read falls back to the bundled catalog when no backend is configured,
   so the prototype is fully usable offline and identical in shape either way. */

const localStories = STORIES.map((s) => ({
  id: `local-${s.n}`,
  niche_id: s.icon,
  niche_label: s.niche,
  headline: s.headline,
  summary: s.snip,
  outlet: s.outlet,
  filed_at: s.filed,
  run_seconds: Number(s.run.split(':')[0]) * 60 + Number(s.run.split(':')[1]),
  is_sample: true,
}))

export async function fetchCatalog() {
  if (!isLive) {
    return { professions: PROFESSIONS, niches: NICHES, voices: VOICES, offline: true }
  }
  const [p, n, v] = await Promise.all([
    supabase.from('professions').select('*').order('sort'),
    supabase.from('niches').select('*').order('sort'),
    supabase.from('voices').select('*').order('sort'),
  ])
  const err = p.error || n.error || v.error
  if (err) throw err
  return {
    professions: p.data.map((r) => ({ id: r.id, label: r.label, icon: r.icon })),
    niches: n.data.map((r) => ({ id: r.id, label: r.label, icon: r.icon })),
    voices: v.data.map((r) => ({
      id: r.id,
      name: r.name,
      initial: r.initial,
      lang: r.lang_label,
      langTone: r.lang === 'hi' ? 'green' : 'blue',
      line: r.line,
      deva: r.lang === 'hi',
    })),
    offline: false,
  }
}

export async function fetchStories({ limit = 12 } = {}) {
  if (!isLive) return localStories
  const { data, error } = await supabase
    .from('stories')
    .select(
      'id, niche_id, headline, summary, outlet, source_url, filed_at, run_seconds, is_sample, niches(label)',
    )
    .order('filed_at', { ascending: false })
    .limit(limit)
  if (error) throw error
  return data.map((r) => ({ ...r, niche_label: r.niches?.label ?? r.niche_id }))
}

export async function fetchProfile(userId) {
  if (!isLive) return null
  const { data, error } = await supabase
    .from('profiles')
    .select('*, profile_niches(niche_id)')
    .eq('id', userId)
    .maybeSingle()
  if (error) throw error
  return data
}

export async function saveOnboarding(userId, prefs) {
  if (!isLive) return
  const { error } = await supabase
    .from('profiles')
    .update({
      language: prefs.language,
      profession_id: prefs.professionId,
      voice_id: prefs.voiceId,
      brief_minutes: prefs.briefMinutes,
      delivery_time: prefs.deliveryTime,
      notifications_enabled: prefs.notifications,
      location_enabled: prefs.location,
      onboarded_at: new Date().toISOString(),
    })
    .eq('id', userId)
  if (error) throw error

  await saveNiches(userId, prefs.nicheIds)
}

/* The follow list is replaced wholesale rather than diffed — it is at most
   seven rows, and a replace can never drift out of step with the UI. */
export async function saveNiches(userId, nicheIds) {
  if (!isLive) return
  await supabase.from('profile_niches').delete().eq('profile_id', userId)
  if (!nicheIds?.length) return
  const { error } = await supabase
    .from('profile_niches')
    .insert(nicheIds.map((niche_id) => ({ profile_id: userId, niche_id })))
  if (error) throw error
}

export async function updateProfile(userId, patch) {
  if (!isLive) return
  const { error } = await supabase.from('profiles').update(patch).eq('id', userId)
  if (error) throw error
}

export async function fetchSaved(userId) {
  if (!isLive) return []
  const { data, error } = await supabase
    .from('saved_stories')
    .select('story_id')
    .eq('profile_id', userId)
  if (error) throw error
  return data.map((r) => r.story_id)
}

export async function toggleSaved(userId, storyId, nextSaved) {
  if (!isLive) return
  if (nextSaved) {
    const { error } = await supabase
      .from('saved_stories')
      .upsert({ profile_id: userId, story_id: storyId })
    if (error) throw error
  } else {
    const { error } = await supabase
      .from('saved_stories')
      .delete()
      .eq('profile_id', userId)
      .eq('story_id', storyId)
    if (error) throw error
  }
}

/* Playback position is written back so a second device can resume mid-sentence.
   Throttled by the caller — this is a write on every few seconds of audio. */
export async function pushPlayback(userId, { storyId, elapsed, isPlaying, rate }) {
  if (!isLive) return
  await supabase.from('playback_state').upsert({
    profile_id: userId,
    story_id: storyId,
    elapsed_seconds: elapsed,
    is_playing: isPlaying,
    rate,
    updated_at: new Date().toISOString(),
  })
}

/* ---- realtime ---------------------------------------------------------- */

export function subscribeStories(onChange) {
  if (!isLive) return () => {}
  const ch = supabase
    .channel('stories-feed')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'stories' }, onChange)
    .subscribe()
  return () => supabase.removeChannel(ch)
}

export function subscribeSaved(userId, onChange) {
  if (!isLive) return () => {}
  const ch = supabase
    .channel(`saved-${userId}`)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'saved_stories', filter: `profile_id=eq.${userId}` },
      onChange,
    )
    .subscribe()
  return () => supabase.removeChannel(ch)
}

export function subscribePlayback(userId, onChange) {
  if (!isLive) return () => {}
  const ch = supabase
    .channel(`playback-${userId}`)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'playback_state', filter: `profile_id=eq.${userId}` },
      onChange,
    )
    .subscribe()
  return () => supabase.removeChannel(ch)
}
