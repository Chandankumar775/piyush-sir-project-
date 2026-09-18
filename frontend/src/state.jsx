import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { PROFESSIONS, NICHES, VOICES, STORIES } from './data/catalog.js'
import { supabase, isLive, signInWithGoogle, signOut } from './lib/supabase.js'
import * as api from './lib/api.js'

const Ctx = createContext(null)
export const useApp = () => useContext(Ctx)

const secs = (mmss) => {
  const [m, s] = String(mmss).split(':').map(Number)
  return m * 60 + (s || 0)
}
export const clock = (t) => {
  const m = Math.floor(Math.max(0, t) / 60)
  const s = Math.floor(Math.max(0, t) % 60)
  return `${m}:${String(s).padStart(2, '0')}`
}

/* Delivery time is held the way Postgres holds it — 24-hour "HH:MM" — and
   rendered the way an Indian morning reads it. */
export const to12 = (hhmm) => {
  const [h, m] = String(hhmm || '07:00').split(':').map(Number)
  const mer = h >= 12 ? 'PM' : 'AM'
  const h12 = h % 12 === 0 ? 12 : h % 12
  const time = `${h12}:${String(m || 0).padStart(2, '0')}`
  return { time, mer, label: `${time} ${mer}` }
}
export const to24 = (time, mer) => {
  let [h, m] = String(time).split(':').map(Number)
  if (mer === 'PM' && h !== 12) h += 12
  if (mer === 'AM' && h === 12) h = 0
  return `${String(h).padStart(2, '0')}:${String(m || 0).padStart(2, '0')}`
}

const localStories = STORIES.map((s) => ({
  id: `local-${s.n}`,
  n: s.n,
  niche_id: s.icon,
  niche_label: s.niche,
  headline: s.headline,
  summary: s.snip,
  outlet: s.outlet,
  filed_at: s.filed,
  run_seconds: secs(s.run),
  is_sample: true,
}))

/* ---- preferences ------------------------------------------------------- */

const PREFS_KEY = 'nuzio.prefs.v1'

export const DEFAULT_PREFS = {
  language: 'en',
  location: true,
  professionId: 'tech',
  nicheIds: ['ai', 'india', 'startups'],
  voiceId: 'aria',
  briefMinutes: 5,
  deliveryTime: '07:00',
  notifications: true,
  autoAdvance: true,
  offline: false,
}

/* One column per preference, so flipping a single toggle is a single-column
   write rather than a whole-profile upsert. */
const COLUMN = {
  language: 'language',
  location: 'location_enabled',
  professionId: 'profession_id',
  voiceId: 'voice_id',
  briefMinutes: 'brief_minutes',
  deliveryTime: 'delivery_time',
  notifications: 'notifications_enabled',
  autoAdvance: 'auto_advance',
  offline: 'offline_mode',
}

function readLocalPrefs() {
  try {
    const raw = localStorage.getItem(PREFS_KEY)
    return raw ? { ...DEFAULT_PREFS, ...JSON.parse(raw) } : { ...DEFAULT_PREFS }
  } catch {
    return { ...DEFAULT_PREFS }
  }
}

function writeLocalPrefs(p) {
  try {
    localStorage.setItem(PREFS_KEY, JSON.stringify(p))
  } catch {
    /* Private browsing. The session still works; it just will not survive a reload. */
  }
}

const prefsFromRow = (r) => ({
  language: r.language ?? DEFAULT_PREFS.language,
  location: Boolean(r.location_enabled),
  professionId: r.profession_id ?? DEFAULT_PREFS.professionId,
  voiceId: r.voice_id ?? DEFAULT_PREFS.voiceId,
  briefMinutes: r.brief_minutes ?? DEFAULT_PREFS.briefMinutes,
  deliveryTime: String(r.delivery_time ?? DEFAULT_PREFS.deliveryTime).slice(0, 5),
  notifications: Boolean(r.notifications_enabled),
  autoAdvance: r.auto_advance ?? true,
  offline: Boolean(r.offline_mode),
  nicheIds: r.profile_niches?.length
    ? r.profile_niches.map((n) => n.niche_id)
    : DEFAULT_PREFS.nicheIds,
})

const warn = (what) => (e) => console.warn(`[nuzio] ${what} failed:`, e?.message || e)

export function AppState({ children }) {
  /* ---- session ---- */
  const [session, setSession] = useState(null)
  const [authReady, setAuthReady] = useState(!isLive)
  const userId = session?.user?.id ?? null

  useEffect(() => {
    if (!isLive) return
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setAuthReady(true)
    })
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s))
    return () => sub.subscription.unsubscribe()
  }, [])

  const userRef = useRef(null)
  userRef.current = userId

  /* ---- catalog ---- */
  // The bundled catalog paints first so nothing waits on a round trip; the
  // backend copy replaces it when it lands.
  const [catalog, setCatalog] = useState({
    professions: PROFESSIONS,
    niches: NICHES,
    voices: VOICES,
    offline: true,
  })

  useEffect(() => {
    let alive = true
    api
      .fetchCatalog()
      .then((c) => {
        if (alive && c.professions?.length && c.niches?.length && c.voices?.length) setCatalog(c)
      })
      .catch(warn('catalog load'))
    return () => {
      alive = false
    }
  }, [])

  /* ---- preferences ---- */
  const [prefs, setPrefs] = useState(readLocalPrefs)
  const [onboarded, setOnboarded] = useState(false)
  const prefsRef = useRef(prefs)

  // Signing in adopts the stored profile, so the same account on a second
  // device arrives already set up.
  useEffect(() => {
    if (!userId) return
    let alive = true
    api
      .fetchProfile(userId)
      .then((row) => {
        if (!alive || !row) return
        setOnboarded(Boolean(row.onboarded_at))
        if (!row.onboarded_at) return
        const next = { ...prefsRef.current, ...prefsFromRow(row) }
        prefsRef.current = next
        writeLocalPrefs(next)
        setPrefs(next)
      })
      .catch(warn('profile load'))
    return () => {
      alive = false
    }
  }, [userId])

  /* The write stays outside the state updater so StrictMode's double
     invocation cannot fire it twice. */
  const setPref = useCallback((key, value) => {
    const prev = prefsRef.current
    const v = typeof value === 'function' ? value(prev[key]) : value
    if (Object.is(v, prev[key])) return
    const next = { ...prev, [key]: v }
    prefsRef.current = next
    writeLocalPrefs(next)
    setPrefs(next)

    const uid = userRef.current
    if (!uid) return
    if (key === 'nicheIds') api.saveNiches(uid, v).catch(warn('niche save'))
    else if (COLUMN[key]) api.updateProfile(uid, { [COLUMN[key]]: v }).catch(warn(`${key} save`))
  }, [])

  const toggleNiche = useCallback(
    (id) => {
      const cur = prefsRef.current.nicheIds
      if (cur.includes(id)) setPref('nicheIds', cur.filter((x) => x !== id))
      else if (cur.length < 7) setPref('nicheIds', [...cur, id])
    },
    [setPref],
  )

  // The five steps are one contract, written in a single call at the end, so a
  // half-finished setup never lands in the profile.
  const commitOnboarding = useCallback(async () => {
    setOnboarded(true)
    const uid = userRef.current
    if (!uid) return
    try {
      await api.saveOnboarding(uid, prefsRef.current)
    } catch (e) {
      warn('onboarding save')(e)
    }
  }, [])

  /* ---- content ---- */
  const [stories, setStories] = useState(localStories)
  const [saved, setSaved] = useState(() => new Set())
  const [connected, setConnected] = useState(false)

  const loadStories = useCallback(async () => {
    try {
      const rows = await api.fetchStories()
      if (rows.length) {
        setStories(rows.map((r, i) => ({ ...r, n: i + 1 })))
        setConnected(isLive)
      }
    } catch (e) {
      console.warn('[nuzio] story load failed, staying on bundled content:', e.message)
    }
  }, [])

  useEffect(() => {
    loadStories()
  }, [loadStories])

  // Live feed: a story inserted in Postgres appears without a refresh.
  useEffect(() => api.subscribeStories(loadStories), [loadStories])

  // Saved stories sync across devices.
  useEffect(() => {
    if (!userId) return
    let alive = true
    api.fetchSaved(userId).then((ids) => alive && setSaved(new Set(ids)))
    const off = api.subscribeSaved(userId, async () => {
      const ids = await api.fetchSaved(userId)
      if (alive) setSaved(new Set(ids))
    })
    return () => {
      alive = false
      off()
    }
  }, [userId])

  /* ---- transport ---- */
  const [index, setIndex] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [elapsed, setElapsed] = useState(0)
  const [rate, setRate] = useState(1)
  const autoAdvance = prefs.autoAdvance

  const story = stories[Math.min(index, stories.length - 1)] ?? localStories[0]
  const duration = story.run_seconds || 90

  const raf = useRef(0)
  const last = useRef(0)
  useEffect(() => {
    if (!playing) return
    last.current = performance.now()
    const tick = (now) => {
      const dt = ((now - last.current) / 1000) * rate
      last.current = now
      setElapsed((e) => e + dt)
      raf.current = requestAnimationFrame(tick)
    }
    raf.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf.current)
  }, [playing, rate])

  useEffect(() => {
    if (elapsed < duration) return
    if (autoAdvance && index < stories.length - 1) {
      setIndex((i) => i + 1)
      setElapsed(0)
    } else {
      setPlaying(false)
      setElapsed(duration)
    }
  }, [elapsed, duration, autoAdvance, index, stories.length])

  // Persist position every few seconds rather than on every frame.
  const lastPush = useRef(0)
  useEffect(() => {
    if (!userId || !story?.id) return
    const now = Date.now()
    if (now - lastPush.current < 4000) return
    lastPush.current = now
    api
      .pushPlayback(userId, { storyId: story.id, elapsed, isPlaying: playing, rate })
      .catch(() => {})
  }, [userId, story?.id, elapsed, playing, rate])

  const value = useMemo(() => {
    const goTo = (i) => {
      const next = Math.max(0, Math.min(stories.length - 1, i))
      setIndex(next)
      setElapsed(0)
    }

    const profession =
      catalog.professions.find((p) => p.id === prefs.professionId) ?? catalog.professions[0]
    const voice = catalog.voices.find((v) => v.id === prefs.voiceId) ?? catalog.voices[0]
    const pickedNiches = prefs.nicheIds
      .map((id) => catalog.niches.find((n) => n.id === id))
      .filter(Boolean)
    const meta = session?.user?.user_metadata ?? {}
    const displayName = meta.full_name || meta.name || null

    return {
      /* session */
      session,
      user: session?.user ?? null,
      userId,
      authReady,
      isLive,
      connected,
      displayName,
      firstName: displayName ? displayName.split(' ')[0] : null,
      avatarUrl: meta.avatar_url || meta.picture || null,
      signInWithGoogle,
      signOut,

      /* catalog */
      professions: catalog.professions,
      niches: catalog.niches,
      voices: catalog.voices,

      /* preferences */
      prefs,
      setPref,
      toggleNiche,
      commitOnboarding,
      onboarded,
      profession,
      voice,
      pickedNiches,
      nicheLabels: pickedNiches.map((n) => n.label),
      deliveryLabel: to12(prefs.deliveryTime).label,

      /* content */
      stories,
      story,
      index,
      duration,
      elapsed: Math.min(elapsed, duration),
      progress: duration ? Math.min(1, elapsed / duration) : 0,
      playing,
      rate,
      autoAdvance,
      saved,
      setAutoAdvance: (v) => setPref('autoAdvance', v),

      /* transport */
      toggle: () => setPlaying((p) => !p),
      next: () => goTo(index + 1),
      prev: () => (elapsed > 3 ? setElapsed(0) : goTo(index - 1)),
      select: (i) => {
        goTo(i)
        setPlaying(true)
      },
      seek: (f) => setElapsed(Math.max(0, Math.min(1, f)) * duration),
      cycleRate: () => setRate((r) => ({ 1: 1.25, 1.25: 1.5, 1.5: 2, 2: 1 }[r] ?? 1)),

      /* saved */
      isSaved: (id) => saved.has(id),
      toggleSave: (id) => {
        const nextSaved = !saved.has(id)
        setSaved((s) => {
          const c = new Set(s)
          nextSaved ? c.add(id) : c.delete(id)
          return c
        })
        if (userId) api.toggleSaved(userId, id, nextSaved).catch(() => {})
      },
    }
  }, [
    session, userId, authReady, connected, catalog, prefs, setPref, toggleNiche,
    commitOnboarding, onboarded, stories, story, index, duration, elapsed,
    playing, rate, autoAdvance, saved,
  ])

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}
