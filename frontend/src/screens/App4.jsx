import { useEffect, useState } from 'react'
import Icon from '../components/Icon.jsx'
import Mark from '../components/Mark.jsx'
import { Lettering, Silkscreen, Plate, GhostPlate, SourceStamp, Rule } from '../components/ui.jsx'
import { useApp, clock } from '../state.jsx'

const ALL = { id: 'all', label: 'All' }
const NUMBERS = ['no', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine']
const spell = (n) => NUMBERS[n] ?? String(n)

function Tabs({ at, go }) {
  const items = [
    ['Listen', 10, 'speaker'],
    ['Discover', 11, 'search'],
    ['Settings', 12, 'settings'],
  ]
  return (
    <nav className="tabs">
      {items.map(([label, screen, icon]) => (
        <button
          key={label}
          type="button"
          className={at === screen ? 'is-on' : ''}
          onClick={() => go(screen)}
          aria-current={at === screen ? 'page' : undefined}
        >
          <Icon name={icon} size={19} stroke={1.6} />
          {label}
        </button>
      ))}
    </nav>
  )
}

function AppBar({ go }) {
  return (
    <div className="appbar">
      <Mark height={18} />
      <span className="appbar__spacer" />
      <button type="button" className="iconplate" onClick={() => go(11)} aria-label="Search">
        <Icon name="search" size={16} />
      </button>
      <button type="button" className="iconplate" onClick={() => go(8)} aria-label="Notifications">
        <Icon name="bell" size={16} />
      </button>
    </div>
  )
}

/* A level meter that is also the scrubber: played bars sit behind the head,
   and the head is the only thing that moves. */
function Meter({ playing, progress, onSeek }) {
  const BARS = 44
  const [t, setT] = useState(0)
  useEffect(() => {
    if (!playing) return
    const id = setInterval(() => setT((v) => v + 0.3), 110)
    return () => clearInterval(id)
  }, [playing])

  const scrub = (e) => {
    const r = e.currentTarget.getBoundingClientRect()
    onSeek((e.clientX - r.left) / r.width)
  }

  return (
    <div
      className="meter"
      onClick={scrub}
      role="slider"
      tabIndex={0}
      aria-label="Scrub story"
      aria-valuenow={Math.round(progress * 100)}
      aria-valuemin={0}
      aria-valuemax={100}
      onKeyDown={(e) => {
        if (e.key === 'ArrowRight') onSeek(Math.min(1, progress + 0.05))
        if (e.key === 'ArrowLeft') onSeek(Math.max(0, progress - 0.05))
      }}
    >
      {Array.from({ length: BARS }, (_, i) => {
        const pos = i / BARS
        const played = pos < progress
        const head = played && pos > progress - 0.03
        const h =
          played && playing
            ? 22 + Math.abs(Math.sin(i * 0.55 + t)) * 62
            : 16 + Math.abs(Math.sin(i * 0.7)) * 34
        return (
          <i
            key={i}
            className={head ? 'is-head' : played ? 'is-played' : ''}
            style={{ transform: `scaleY(${h / 100})` }}
          />
        )
      })}
    </div>
  )
}

/* Provenance is the credibility surface, so it opens inside the board — a
   panel that can be read and dismissed — rather than in a browser dialog that
   freezes the page behind it. */
function SourceSheet({ story, onClose }) {
  useEffect(() => {
    if (!story) return
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
    }
    addEventListener('keydown', onKey)
    return () => removeEventListener('keydown', onKey)
  }, [story, onClose])

  if (!story) return null
  const filed =
    story.filed_at && story.filed_at.length > 5 ? story.filed_at.slice(11, 16) : story.filed_at
  const link = !story.is_sample && story.source_url

  return (
    <div className="sheet" role="dialog" aria-modal="true" aria-label="Story source">
      <button type="button" className="sheet__scrim" onClick={onClose} aria-label="Close source" />
      <div className="sheet__panel">
        <span className="sheet__grip" aria-hidden="true" />
        <Silkscreen>Source</Silkscreen>
        <h3 className="sheet__outlet">{story.outlet || 'Unattributed'}</h3>
        <div className="sheet__meta">
          <Silkscreen>{story.niche_label}</Silkscreen>
          {filed && <Silkscreen>Filed {filed} IST</Silkscreen>}
          <Silkscreen>{clock(story.run_seconds)} listen</Silkscreen>
        </div>
        <Rule />
        <p className="copy" style={{ fontSize: 12 }}>
          {story.is_sample
            ? 'Placeholder editorial. This prototype ships no real journalism and names no real outlet — the live app credits the outlet here and links the original report.'
            : 'Narrated from the original report. Nuzio summarises it; it does not replace the outlet that filed it.'}
        </p>
        {story.is_sample && (
          <div className="mt-s">
            <span className="sample">Sample content</span>
          </div>
        )}
        <div className="mt-m">
          {link && (
            <a
              className="plate plate--ghost"
              href={story.source_url}
              target="_blank"
              rel="noreferrer noopener"
            >
              <span className="plate__face">Open the original</span>
            </a>
          )}
          <div className={link ? 'mt-s' : ''}>
            <Plate onClick={onClose}>Close</Plate>
          </div>
        </div>
      </div>
    </div>
  )
}

function SaveButton({ id }) {
  const app = useApp()
  const on = app.isSaved(id)
  return (
    <button
      type="button"
      className="iconplate"
      onClick={() => app.toggleSave(id)}
      aria-pressed={on}
      aria-label={on ? 'Remove from saved' : 'Save story'}
      style={on ? { background: 'var(--ink)', color: 'var(--deep)', borderColor: 'transparent' } : undefined}
    >
      <Icon name="bookmark" size={15} />
    </button>
  )
}

/* ---------------------------------------------------------- 10 */
export function Brief({ go }) {
  const app = useApp()
  const [filter, setFilter] = useState('all')
  const [source, setSource] = useState(null)
  const now = app.story
  const playing = app.playing
  const chips = [ALL, ...app.pickedNiches]
  const queue = app.stories.filter(
    (s) => s.id !== now.id && (filter === 'all' || s.niche_id === filter),
  )

  return (
    <section className="screen">
      <AppBar go={go} />
      <div className="filters">
        {chips.map((f) => (
          <button
            key={f.id}
            type="button"
            className={filter === f.id ? 'is-on' : ''}
            onClick={() => setFilter(f.id)}
            aria-pressed={filter === f.id}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="screen__body rise" style={{ paddingBottom: 172 }}>
        <Lettering
          lead="Good morning,"
          rest={`${spell(app.stories.length)} ${app.stories.length === 1 ? 'thing.' : 'things.'}`}
          size="var(--t-display-sm)"
        />
        <div style={{ display: 'flex', gap: 10, marginTop: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          <Silkscreen tone={playing ? 'var(--green)' : undefined}>
            {playing ? 'Playing' : 'Paused'}
          </Silkscreen>
          <Silkscreen>{app.voice?.name ?? 'Narrator'}</Silkscreen>
          <Silkscreen>
            {app.index + 1} of {app.stories.length}
          </Silkscreen>
          <span className="sample">Sample content</span>
        </div>

        <div className="story story--live mt-m">
          <div className="story__head">
            <span className="story__n">{String(app.index + 1).padStart(2, '0')}</span>
            <span className="story__niche">{now.niche_label}</span>
            <SourceStamp
              outlet={now.outlet}
              time={now.filed_at?.slice(11, 16) || now.filed_at}
              onClick={() => setSource(now)}
            />
          </div>
          <h2 className="story__headline">{now.headline}</h2>
          <p className="story__snip">{now.summary}</p>

          <Meter playing={playing} progress={app.progress} onSeek={app.seek} />
          <div className="clockline">
            <span>{clock(app.elapsed)}</span>
            <span>-{clock(app.duration - app.elapsed)}</span>
          </div>

          <div className="transport">
            <button type="button" onClick={app.prev} aria-label="Previous story">
              <Icon name="prev" size={17} stroke={1.5} style={{ fill: 'currentColor' }} />
            </button>
            <button
              type="button"
              className="transport__main"
              onClick={app.toggle}
              aria-label={playing ? 'Pause' : 'Play'}
            >
              <Icon
                name={playing ? 'pause' : 'play'}
                size={22}
                stroke={playing ? 2.2 : 1.5}
                style={playing ? undefined : { fill: 'currentColor' }}
              />
            </button>
            <button
              type="button"
              onClick={app.next}
              disabled={app.index >= app.stories.length - 1}
              aria-label="Next story"
            >
              <Icon name="next" size={17} stroke={1.5} style={{ fill: 'currentColor' }} />
            </button>
            <button
              type="button"
              className="transport__rate"
              onClick={app.cycleRate}
              aria-label={`Playback speed ${app.rate} times`}
            >
              {app.rate}&#215;
            </button>
          </div>
        </div>

        <div className="mt-s" style={{ marginBottom: 8 }}>
          <Silkscreen>Up next</Silkscreen>
        </div>

        {queue.length === 0 && (
          <p className="copy" style={{ fontSize: 12 }}>
            Nothing else in this brief under that filter.
          </p>
        )}

        {queue.map((s) => (
          <article className="story story--queued" key={s.id}>
            <div className="story__head">
              <span className="story__n" style={{ color: 'var(--ink-3)' }}>
                {String(app.stories.indexOf(s) + 1).padStart(2, '0')}
              </span>
              <span className="story__niche">{s.niche_label}</span>
              <SourceStamp outlet={s.outlet} onClick={() => setSource(s)} />
            </div>
            <h3 className="story__headline">{s.headline}</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 12 }}>
              <Silkscreen>{clock(s.run_seconds)}</Silkscreen>
              <span style={{ flex: 1 }} />
              <SaveButton id={s.id} />
              <button
                type="button"
                className="iconplate"
                onClick={() => app.select(app.stories.indexOf(s))}
                aria-label={`Play ${s.headline}`}
                style={{ background: 'var(--ink)', color: 'var(--deep)', borderColor: 'transparent' }}
              >
                <Icon name="play" size={14} stroke={1.4} style={{ fill: 'currentColor' }} />
              </button>
            </div>
          </article>
        ))}
      </div>

      <div className="deck">
        <button type="button" className="iconplate" onClick={app.toggle} aria-label={playing ? 'Pause' : 'Play'}>
          <Icon
            name={playing ? 'pause' : 'play'}
            size={15}
            stroke={playing ? 2 : 1.4}
            style={playing ? undefined : { fill: 'currentColor' }}
          />
        </button>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="deck__title">{now.headline}</div>
          <div className="deck__track">
            <i style={{ width: `${app.progress * 100}%` }} />
          </div>
        </div>
        <Silkscreen>{clock(app.elapsed)}</Silkscreen>
      </div>
      <Tabs at={10} go={go} />
      <SourceSheet story={source} onClose={() => setSource(null)} />
    </section>
  )
}

/* ---------------------------------------------------------- 11 */
export function Discover({ go }) {
  const app = useApp()
  const [filter, setFilter] = useState('all')
  const [q, setQ] = useState('')
  const [source, setSource] = useState(null)
  const chips = [ALL, ...app.pickedNiches]
  const list = app.stories.filter(
    (s) =>
      (filter === 'all' || s.niche_id === filter) &&
      (q === '' || (s.headline + s.summary).toLowerCase().includes(q.toLowerCase())),
  )
  const filterLabel = chips.find((c) => c.id === filter)?.label ?? 'All'

  return (
    <section className="screen">
      <AppBar go={go} />
      <div className="screen__body rise" style={{ paddingBottom: 100 }}>
        <Lettering lead="Discover" size="var(--t-display-sm)" />
        <p className="copy">Everything we read this morning, not only what made your brief.</p>
        <div className="mt-s">
          <span className="sample">Sample content</span>
        </div>

        <div className="field mt-m">
          <Icon name="search" size={16} />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search stories, sources, topics"
            aria-label="Search stories"
          />
          {q !== '' && (
            <button type="button" onClick={() => setQ('')} aria-label="Clear search" style={{ color: 'var(--ink-3)' }}>
              <Icon name="plus" size={15} style={{ transform: 'rotate(45deg)' }} />
            </button>
          )}
        </div>

        <div className="filters" style={{ padding: '14px 0 4px' }}>
          {chips.map((f) => (
            <button
              key={f.id}
              type="button"
              className={filter === f.id ? 'is-on' : ''}
              onClick={() => setFilter(f.id)}
              aria-pressed={filter === f.id}
            >
              {f.label}
            </button>
          ))}
        </div>

        {list.length === 0 ? (
          <div className="story" style={{ textAlign: 'center', padding: '30px 18px' }}>
            <Silkscreen>No match</Silkscreen>
            <h3 className="story__headline mt-s" style={{ fontSize: 17 }}>
              Nothing filed under &ldquo;{q || filterLabel}&rdquo; today.
            </h3>
            <p className="story__snip">Try a broader term, or clear the filter.</p>
            <div className="mt-m">
              <GhostPlate
                onClick={() => {
                  setQ('')
                  setFilter('all')
                }}
              >
                Clear search
              </GhostPlate>
            </div>
          </div>
        ) : (
          list.map((s) => (
            <article className="story" key={s.id}>
              <div className="story__head">
                <span className="story__niche">{s.niche_label}</span>
                <SourceStamp
                  outlet={s.outlet}
                  time={s.filed_at?.slice(11, 16) || s.filed_at}
                  onClick={() => setSource(s)}
                />
              </div>
              <h3 className="story__headline">{s.headline}</h3>
              <p className="story__snip">{s.summary}</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 13 }}>
                <Silkscreen>{clock(s.run_seconds)} listen</Silkscreen>
                <span style={{ flex: 1 }} />
                <SaveButton id={s.id} />
                <button type="button" className="iconplate" aria-label="Share story">
                  <Icon name="share" size={15} />
                </button>
                <button
                  type="button"
                  className="iconplate"
                  onClick={() => {
                    app.select(app.stories.indexOf(s))
                    go(10)
                  }}
                  aria-label={`Play ${s.headline}`}
                  style={{ background: 'var(--ink)', color: 'var(--deep)', borderColor: 'transparent' }}
                >
                  <Icon name="play" size={14} stroke={1.4} style={{ fill: 'currentColor' }} />
                </button>
              </div>
            </article>
          ))
        )}
      </div>
      <Tabs at={11} go={go} />
      <SourceSheet story={source} onClose={() => setSource(null)} />
    </section>
  )
}

/* ---------------------------------------------------------- 12 */
export function Settings({ go }) {
  const app = useApp()
  const [theme, setTheme] = useState('Dark')
  const offline = app.prefs.offline
  const setOffline = (v) => app.setPref('offline', v)
  const push = app.prefs.notifications
  const setPush = (v) => app.setPref('notifications', v)

  const Toggle = ({ on, set, label }) => (
    <button
      type="button"
      className={`switch ${on ? 'is-on' : ''}`}
      onClick={() => set((v) => !v)}
      role="switch"
      aria-checked={on}
      aria-label={label}
    />
  )

  return (
    <section className="screen">
      <AppBar go={go} />
      <div className="screen__body rise" style={{ paddingBottom: 100 }}>
        <Lettering lead="Settings" size="var(--t-display-sm)" />

        <div className="mt-m">
          <button type="button" className="row" onClick={() => go(13)}>
            <span className="voice__plate" style={{ width: 38, height: 38, fontSize: 16 }}>
              {(app.displayName ?? 'N').trim().charAt(0).toUpperCase()}
            </span>
            <span className="row__grow">
              <span className="row__title">{app.displayName ?? 'Your profile'}</span>
              <span className="row__sub">
                {app.profession?.label ?? '—'}
                {app.prefs.location ? ' · Local stories on' : ' · Local stories off'}
              </span>
            </span>
            <Icon name="chevron" size={15} style={{ color: 'var(--ink-3)' }} />
          </button>
          <button type="button" className="row">
            <span className="row__icon">
              <Icon name="bookmark" size={17} />
            </span>
            <span className="row__grow">
              <span className="row__title">Saved stories</span>
              <span className="row__sub">
                {app.saved.size === 0 ? 'Nothing saved yet' : `${app.saved.size} saved`}
              </span>
            </span>
            <Icon name="chevron" size={15} style={{ color: 'var(--ink-3)' }} />
          </button>
          <button type="button" className="row" onClick={() => go(13)}>
            <span className="row__icon">
              <Icon name="card" size={17} />
            </span>
            <span className="row__grow">
              <span className="row__title">Plan &amp; billing</span>
              <span className="row__sub">Free &mdash; &#8377;0 per month</span>
            </span>
            <Icon name="chevron" size={15} style={{ color: 'var(--ink-3)' }} />
          </button>
        </div>

        <div className="mt-l">
          <Silkscreen>Appearance</Silkscreen>
          <div className="strip mt-s">
            {['Dark', 'Light'].map((t) => (
              <button key={t} type="button" className={theme === t ? 'is-on' : ''} onClick={() => setTheme(t)}>
                {t}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-l">
          <Silkscreen>Playback</Silkscreen>
          <div className="mt-s">
            <div className="row">
              <span className="row__icon">
                <Icon name="download" size={17} />
              </span>
              <span className="row__grow">
                <span className="row__title">Offline mode</span>
                <span className="row__sub">{offline ? 'Briefs download overnight' : 'Streams on demand'}</span>
              </span>
              <Toggle on={offline} set={setOffline} label="Offline mode" />
            </div>
            <div className="row">
              <span className="row__icon">
                <Icon name="next" size={17} />
              </span>
              <span className="row__grow">
                <span className="row__title">Auto-advance</span>
                <span className="row__sub">
                  {app.autoAdvance ? 'Plays the next story' : 'Stops after each story'}
                </span>
              </span>
              <Toggle on={app.autoAdvance} set={app.setAutoAdvance} label="Auto-advance" />
            </div>
            <div className="row">
              <span className="row__icon">
                <Icon name="bell" size={17} />
              </span>
              <span className="row__grow">
                <span className="row__title">Push notifications</span>
                <span className="row__sub">
                  {push ? `Brief ready at ${app.deliveryLabel}` : 'No notifications'}
                </span>
              </span>
              <Toggle on={push} set={setPush} label="Push notifications" />
            </div>
            <button type="button" className="row" onClick={() => go(6)}>
              <span className="row__icon">
                <Icon name="mic" size={17} />
              </span>
              <span className="row__grow">
                <span className="row__title">Narrator</span>
                <span className={`row__sub ${app.voice?.deva ? 'deva' : ''}`}>
                  {app.voice ? `${app.voice.name} — ${app.voice.line}` : '—'}
                </span>
              </span>
              <Icon name="chevron" size={15} style={{ color: 'var(--ink-3)' }} />
            </button>
            <button type="button" className="row" onClick={() => go(2)}>
              <span className="row__icon">
                <Icon name="language" size={17} />
              </span>
              <span className="row__grow">
                <span className="row__title">Language</span>
                <span className={`row__sub ${app.prefs.language === 'hi' ? 'deva' : ''}`}>
                  {app.prefs.language === 'hi' ? 'हिन्दी' : 'English'}
                </span>
              </span>
              <Icon name="chevron" size={15} style={{ color: 'var(--ink-3)' }} />
            </button>
            <button type="button" className="row" onClick={() => go(7)}>
              <span className="row__icon">
                <Icon name="clock" size={17} />
              </span>
              <span className="row__grow">
                <span className="row__title">Delivery time</span>
                <span className="row__sub">Every day at {app.deliveryLabel}</span>
              </span>
              <Icon name="chevron" size={15} style={{ color: 'var(--ink-3)' }} />
            </button>
          </div>
        </div>

        <div className="mt-l">
          <Silkscreen>Account</Silkscreen>
          <div className="mt-s">
            {app.user ? (
              <button type="button" className="row" onClick={() => app.signOut()}>
                <span className="row__icon">
                  <Icon name="exit" size={17} />
                </span>
                <span className="row__grow">
                  <span className="row__title">Sign out</span>
                  <span className="row__sub">{app.user.email}</span>
                </span>
                <Icon name="chevron" size={15} style={{ color: 'var(--ink-3)' }} />
              </button>
            ) : (
              <button type="button" className="row" onClick={() => go(3)}>
                <span className="row__icon">
                  <Icon name="exit" size={17} />
                </span>
                <span className="row__grow">
                  <span className="row__title">Sign in with Google</span>
                  <span className="row__sub">
                    {app.isLive
                      ? 'Carry your setup to every device'
                      : 'Demo mode — no backend configured, settings stay on this device'}
                  </span>
                </span>
                <Icon name="chevron" size={15} style={{ color: 'var(--ink-3)' }} />
              </button>
            )}
          </div>
        </div>
      </div>
      <Tabs at={12} go={go} />
    </section>
  )
}

/* ---------------------------------------------------------- 13 */
export function Plans({ go }) {
  const tick = <Icon name="check" size={13} stroke={2.6} />
  return (
    <section className="screen">
      <div className="appbar">
        <button
          type="button"
          className="iconplate"
          onClick={() => go(12)}
          aria-label="Back to settings"
          style={{ transform: 'scaleX(-1)' }}
        >
          <Icon name="chevron" size={16} />
        </button>
        <span className="appbar__spacer" />
        <Mark height={18} />
      </div>
      <div className="screen__body rise" style={{ paddingBottom: 34 }}>
        <Lettering lead="Plan" rest="&amp; billing" size="var(--t-display-sm)" />
        <p className="copy">Start free. Upgrade when your mornings pay for it.</p>

        <div className="plan mt-m">
          <div className="plan__head">
            <span className="plan__name">Free</span>
            <Silkscreen tone="var(--green)">Current</Silkscreen>
          </div>
          <p className="plan__price">
            &#8377;0<small>per month</small>
          </p>
          <ul className="plan__list">
            <li>{tick}Five story summaries per niche, daily</li>
            <li>{tick}Push notifications</li>
            <li>{tick}Ad-supported narration</li>
          </ul>
          <div className="mt-m">
            <GhostPlate>Your current plan</GhostPlate>
          </div>
        </div>

        <div className="plan plan--pro">
          <div className="plan__head">
            <span className="plan__name">Pro</span>
          </div>
          <p className="plan__price" style={{ color: 'var(--green)' }}>
            &#8377;79<small>per month</small>
          </p>
          <ul className="plan__list">
            <li>{tick}Unlimited custom briefings</li>
            <li>{tick}Premium narrator voices</li>
            <li>{tick}Both languages, switch any morning</li>
            <li>{tick}Offline downloads, zero ads</li>
          </ul>
          <div className="mt-m">
            <Plate tone="green">Upgrade to Pro</Plate>
          </div>
        </div>

        <div className="plan">
          <div className="plan__head">
            <span className="plan__name">Pro Annual</span>
            <Silkscreen>&#8377;1,499 vs &#8377;948</Silkscreen>
          </div>
          <p className="plan__price">
            &#8377;1,499<small>per year</small>
          </p>
          <ul className="plan__list">
            <li>{tick}Everything in Pro</li>
            <li>{tick}Offline vault, keeps every brief</li>
            <li>{tick}Early access to new voices</li>
          </ul>
          <div className="mt-m">
            <Plate>Go annual</Plate>
          </div>
        </div>
      </div>
    </section>
  )
}
