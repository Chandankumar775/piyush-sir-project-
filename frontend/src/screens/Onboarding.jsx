import { useEffect, useRef, useState } from 'react'
import Icon from '../components/Icon.jsx'
import Mark from '../components/Mark.jsx'
import { Lettering, Silkscreen, Plate, GhostPlate, Roundel, Rule } from '../components/ui.jsx'
import { LENGTHS, CUSTOM_MINUTES, TIMES, NOTIFICATIONS } from '../data/catalog.js'
import { useApp, to12, to24 } from '../state.jsx'

function Ledger({ step, of = 5, right }) {
  return (
    <div className="ledger">
      <div className="ledger__ticks">
        {Array.from({ length: of }, (_, i) => (
          <i key={i} className={i < step ? 'is-done' : ''} />
        ))}
      </div>
      <span className="ledger__count">{right ?? `${step} / ${of}`}</span>
    </div>
  )
}

/* ---------------------------------------------------------- 1 */
export function Splash({ go }) {
  // A splash advances itself — the rule paints, the pips run, the board opens.
  useEffect(() => {
    const id = setTimeout(() => go(2), 2600)
    return () => clearTimeout(id)
  }, [go])

  return (
    <section className="screen">
      <div className="splash">
        <div className="splash__mark">
          <Mark height={34} />
        </div>
        <div className="splash__set">
          <div className="splash__line">
            <span className="splash__news">NEWS</span>
            <span className="splash__ongo">on go</span>
          </div>
          <div className="splash__rule" />
          <div className="splash__foot">
            <Silkscreen>Your brief · every morning</Silkscreen>
            <span className="splash__dots" aria-label="Curating your brief">
              <i /><i /><i />
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ---------------------------------------------------------- 2 */
export function Language({ go }) {
  const app = useApp()
  const lang = app.prefs.language
  const loc = app.prefs.location
  // Hindi is a path, not a translation: choosing it moves the narrator with it
  // rather than leaving an English voice reading a Hindi brief.
  const setLang = (v) => {
    app.setPref('language', v)
    const fits = app.voices.filter((x) => (v === 'hi' ? x.deva : !x.deva))
    if (fits.length && !fits.some((x) => x.id === app.prefs.voiceId)) {
      app.setPref('voiceId', fits[0].id)
    }
  }
  const setLoc = (fn) => app.setPref('location', fn)
  return (
    <section className="screen">
      <div className="screen__body rise">
        <div style={{ paddingTop: 10 }}>
          <Mark height={20} />
        </div>
        <div className="mt-l">
          {lang === 'hi' ? (
            <>
              <Lettering lead="अपनी" rest="भाषा चुनें" className="deva" />
              <p className="copy deva">
                आपका ब्रीफ़ इसी भाषा में लिखा और सुनाया जाएगा। इसे आप किसी भी सुबह बदल सकते हैं।
              </p>
            </>
          ) : (
            <>
              <Lettering lead="Choose" rest="your language" />
              <p className="copy">
                The language your brief is written and narrated in. You can change it any morning.
              </p>
            </>
          )}
        </div>

        <div className="mt-l">
          <button
            type="button"
            className={`panel ${lang === 'en' ? 'is-on' : ''}`}
            onClick={() => setLang('en')}
            aria-pressed={lang === 'en'}
          >
            <span className="panel__badge">EN</span>
            <span className="panel__grow">
              <span className="panel__title">English</span>
              <span className="panel__sub">Briefs written and narrated in English</span>
            </span>
            <span className="panel__mark">{lang === 'en' && <Icon name="check" size={12} stroke={3} />}</span>
          </button>

          <button
            type="button"
            className={`panel ${lang === 'hi' ? 'is-on' : ''}`}
            onClick={() => setLang('hi')}
            aria-pressed={lang === 'hi'}
          >
            <span className="panel__badge deva">हि</span>
            <span className="panel__grow">
              <span className="panel__title deva">हिन्दी</span>
              <span className="panel__sub deva">आपका ब्रीफ़ हिन्दी में लिखा और सुनाया जाएगा</span>
            </span>
            <span className="panel__mark">{lang === 'hi' && <Icon name="check" size={12} stroke={3} />}</span>
          </button>
        </div>

        <div className="mt-l">
          <Silkscreen>Permission</Silkscreen>
          <div className="panel mt-s" style={{ cursor: 'default' }}>
            <span className="panel__badge"><Icon name="location" size={18} /></span>
            <span className="panel__grow">
              <span className="panel__title">Location</span>
              <span className="panel__sub">
                {loc ? 'Allowed — local stories will be included' : 'Not allowed — no local stories'}
              </span>
            </span>
            <button
              type="button"
              className={`switch ${loc ? 'is-on' : ''}`}
              onClick={() => setLoc((v) => !v)}
              role="switch"
              aria-checked={loc}
              aria-label="Enable location"
            />
          </div>
          <p className="copy" style={{ fontSize: 11.5, maxWidth: '38ch' }}>
            We read your city and nothing else. It is never shared and never sold.
          </p>
        </div>
      </div>
      <div className="screen__foot">
        <Plate onClick={() => go(3)}>Continue</Plate>
      </div>
    </section>
  )
}

/* ---------------------------------------------------------- 3 */
export function SignIn({ go }) {
  const app = useApp()
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState(null)

  // With a backend configured this is a real Google redirect; without one the
  // prototype walks straight into onboarding so the flow stays clickable.
  const handleSignIn = async () => {
    if (!app.isLive) return go(4)
    setBusy(true)
    setErr(null)
    try {
      await app.signInWithGoogle()
    } catch (e) {
      setErr(e.message || 'Could not reach Google sign-in.')
      setBusy(false)
    }
  }

  // Already signed in: skip the wall.
  useEffect(() => {
    if (app.user) go(4)
  }, [app.user, go])

  return (
    <section className="screen">
      <div className="screen__body rise">
        <div style={{ paddingTop: 14 }}>
          <Mark height={26} />
        </div>
        <div style={{ marginTop: 118 }}>
          <Lettering lead="Good morning." rest="Your brief is waiting." />
          <p className="copy">
            Personalised audio news, assembled overnight and ready before you are.
          </p>
        </div>
      </div>
      <div className="screen__foot" style={{ paddingBottom: 34 }}>
        <button
          type="button"
          className="panel"
          onClick={handleSignIn}
          disabled={busy}
          style={{ justifyContent: 'center' }}
        >
          <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
            <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9 3.6l6.7-6.7C35.6 2.6 30.2.5 24 .5 14.6.5 6.5 5.9 2.6 13.8l7.8 6c1.9-5.6 7.2-9.8 13.6-9.8z" />
            <path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.2-.4-4.7H24v9h12.7c-.6 3-2.3 5.5-4.8 7.2l7.5 5.8c4.4-4 7.1-10 7.1-17.3z" />
            <path fill="#FBBC05" d="M10.4 28.2a14.5 14.5 0 0 1 0-9.2l-7.8-6a24 24 0 0 0 0 21.2l7.8-6z" />
            <path fill="#34A853" d="M24 47.5c6.2 0 11.5-2 15.4-5.6l-7.5-5.8c-2.1 1.4-4.8 2.2-7.9 2.2-6.4 0-11.7-4.2-13.6-9.9l-7.8 6C6.5 42.1 14.6 47.5 24 47.5z" />
          </svg>
          <span className="panel__title" style={{ fontSize: 14 }}>
            {busy ? 'Opening Google…' : 'Continue with Google'}
          </span>
        </button>
        {err && (
          <p className="copy" style={{ fontSize: 11.5, textAlign: 'center', margin: '10px auto 0', color: 'var(--ink-2)' }}>
            {err}
          </p>
        )}
        {/* Sign-in gates the whole prototype, so there is always a way past it:
            without a backend the Google plate walks straight in, and with one
            this ghost does, for anyone being shown the app rather than using it. */}
        {app.isLive ? (
          <div className="mt-s">
            <GhostPlate onClick={() => go(4)}>Continue without signing in</GhostPlate>
          </div>
        ) : (
          <p className="copy" style={{ fontSize: 11, textAlign: 'center', margin: '10px auto 0' }}>
            Demo mode — no backend configured, so this walks straight in.
          </p>
        )}
        <p className="copy" style={{ fontSize: 11, textAlign: 'center', margin: '16px auto 0', maxWidth: '34ch' }}>
          By continuing you agree to the Terms and the Privacy Policy.
        </p>
      </div>
    </section>
  )
}

/* ---------------------------------------------------------- 4 */
export function Profession({ go }) {
  const app = useApp()
  const sel = app.prefs.professionId
  const setSel = (v) => app.setPref('professionId', v)
  const chosen = app.profession
  return (
    <section className="screen">
      <Ledger step={1} />
      <div className="screen__body rise" style={{ paddingTop: 18 }}>
        <Lettering lead="What" rest="do you do?" />
        <p className="copy">
          One choice. It sets the weight every story gets in your brief.
        </p>
        <div className="cloud">
          {app.professions.map((p) => (
            <Roundel
              key={p.id}
              icon={p.icon}
              label={p.label}
              selected={sel === p.id}
              onClick={() => setSel(p.id)}
            />
          ))}
        </div>
      </div>
      <div className="screen__foot">
        <Plate onClick={() => go(5)}>Continue with {chosen?.label ?? 'this'}</Plate>
      </div>
    </section>
  )
}

/* ---------------------------------------------------------- 5 */
export function Niches({ go }) {
  const app = useApp()
  const sel = app.prefs.nicheIds
  const toggle = app.toggleNiche
  const full = sel.length >= 7
  return (
    <section className="screen">
      <Ledger step={2} right={`${sel.length} of 7 picked`} />
      <div className="screen__body rise" style={{ paddingTop: 18 }}>
        <Lettering lead="What moves" rest="your world?" />
        <p className="copy">
          {full
            ? 'Seven is the limit. Drop one to add another.'
            : 'Pick up to seven. Your brief is built only from these.'}
        </p>
        <div className="cloud">
          {app.niches.map((n) => (
            <Roundel
              key={n.id}
              icon={n.icon}
              label={n.label}
              tone="green"
              selected={sel.includes(n.id)}
              onClick={() => toggle(n.id)}
            />
          ))}
        </div>
      </div>
      <div className="screen__foot">
        <Plate onClick={() => go(6)} disabled={sel.length === 0}>
          {sel.length === 0
            ? 'Pick at least one niche'
            : `Continue with ${sel.length} ${sel.length === 1 ? 'niche' : 'niches'}`}
        </Plate>
      </div>
    </section>
  )
}

/* ---------------------------------------------------------- 6 */
export function Voice({ go }) {
  const app = useApp()
  const sel = app.prefs.voiceId
  const setSel = (v) => app.setPref('voiceId', v)
  const minutes = app.prefs.briefMinutes
  const chosen = app.voice
  const preset = LENGTHS.find((l) => l.minutes === minutes)
  const custom = !preset
  const lenLabel = preset ? preset.label : `${minutes} min`
  const setLen = (l) => {
    // Custom keeps whatever is on screen and hands the minute count to the
    // stepper; a preset commits its own number.
    if (l.minutes === null) {
      if (!custom) app.setPref('briefMinutes', Math.min(CUSTOM_MINUTES.max, minutes + 1))
    } else {
      app.setPref('briefMinutes', l.minutes)
    }
  }
  const step = (d) =>
    app.setPref(
      'briefMinutes',
      Math.max(CUSTOM_MINUTES.min, Math.min(CUSTOM_MINUTES.max, minutes + d)),
    )
  return (
    <section className="screen">
      <Ledger step={3} />
      <div className="screen__body rise" style={{ paddingTop: 18 }}>
        <Lettering lead="Who reads" rest="it to you?" />
        <p className="copy">Three narrators. Play a ten-second sample of each.</p>

        <div className="mt-m">
          {app.voices.map((v) => (
            <button
              key={v.id}
              type="button"
              className={`voice ${sel === v.id ? 'is-on' : ''}`}
              onClick={() => setSel(v.id)}
              aria-pressed={sel === v.id}
            >
              <span className="voice__plate">{v.initial}</span>
              <span className="panel__grow">
                <span className="voice__head">
                  <span className="voice__name">{v.name}</span>
                  <span className={`tagplate ${v.langTone === 'green' ? 'tagplate--green' : ''} ${v.deva ? 'deva' : ''}`}>
                    {v.lang}
                  </span>
                </span>
                <span className={`voice__line ${v.deva ? 'deva' : ''}`}>{v.line}</span>
              </span>
              <span className="voice__play" aria-label={`Play ${v.name} sample`}>
                <Icon name="play" size={13} stroke={1.4} style={{ fill: 'currentColor' }} />
              </span>
            </button>
          ))}
        </div>

        <div className="mt-l">
          <Silkscreen>How long is your morning?</Silkscreen>
          <div className="strip mt-s">
            {LENGTHS.map((l) => {
              const on = l.minutes === null ? custom : l.minutes === minutes
              return (
                <button
                  key={l.id}
                  type="button"
                  className={on ? 'is-on' : ''}
                  onClick={() => setLen(l)}
                  aria-pressed={on}
                >
                  {l.label}
                </button>
              )
            })}
          </div>

          {custom && (
            <div className="stepper mt-s">
              <button
                type="button"
                onClick={() => step(-1)}
                disabled={minutes <= CUSTOM_MINUTES.min}
                aria-label="One minute shorter"
              >
                <Icon name="minus" size={15} />
              </button>
              <span className="stepper__read">
                <span className="stepper__num tnum">{minutes}</span>
                <Silkscreen>minutes</Silkscreen>
              </span>
              <button
                type="button"
                onClick={() => step(1)}
                disabled={minutes >= CUSTOM_MINUTES.max}
                aria-label="One minute longer"
              >
                <Icon name="plus" size={15} />
              </button>
            </div>
          )}
        </div>
      </div>
      <div className="screen__foot">
        <Plate onClick={() => go(7)}>
          {chosen?.name ?? 'Narrator'} · {lenLabel}
        </Plate>
      </div>
    </section>
  )
}

/* ---------------------------------------------------------- 7 */
export function DeliveryTime({ go }) {
  const app = useApp()
  const { time, mer } = to12(app.prefs.deliveryTime)
  const setTime = (t) => app.setPref('deliveryTime', to24(t, mer))
  const setMer = (m) => app.setPref('deliveryTime', to24(time, m))
  return (
    <section className="screen">
      <Ledger step={4} />
      <div className="screen__body rise" style={{ paddingTop: 18, display: 'flex', flexDirection: 'column' }}>
        <Lettering lead="When" rest="do you want it?" />
        <p className="copy">Your brief is assembled overnight and waiting at this hour.</p>

        <div className="strip mt-m">
          {['AM', 'PM'].map((m) => (
            <button key={m} type="button" className={mer === m ? 'is-on' : ''} onClick={() => setMer(m)}>
              {m}
            </button>
          ))}
        </div>

        <div className="dial">
          {TIMES.map((t) => (
            <button
              key={t}
              type="button"
              className={`dial__row ${time === t ? 'is-on' : ''}`}
              onClick={() => setTime(t)}
              aria-pressed={time === t}
            >
              <span>{t}</span>
              {time === t && <span className="dial__meridiem">{mer}</span>}
            </button>
          ))}
        </div>
      </div>
      <div className="screen__foot">
        <Plate onClick={() => go(8)}>
          Deliver at {time} {mer}
        </Plate>
      </div>
    </section>
  )
}

/* ---------------------------------------------------------- 8 */
export function Notifications({ go }) {
  const app = useApp()
  return (
    <section className="screen">
      <Ledger step={5} />
      <div className="screen__body rise" style={{ paddingTop: 18 }}>
        <Lettering lead="Never miss" rest="a morning." />
        <p className="copy">Three kinds of notice. Nothing else will reach you.</p>

        <div className="mt-l">
          {NOTIFICATIONS.map((n) => (
            <div className="row" key={n.title}>
              <span className="row__icon"><Icon name={n.icon} size={17} /></span>
              <span className="row__grow">
                <span className="row__title">{n.title}</span>
                <span className="row__sub">{n.line}</span>
              </span>
              <span className="row__when">
                {n.icon === 'bell' ? `Daily · ${to12(app.prefs.deliveryTime).time}` : n.when}
              </span>
            </div>
          ))}
        </div>

        <div className="mt-l">
          <Silkscreen>How it will look</Silkscreen>
          <div className="keyline mt-s" style={{ display: 'flex', gap: 11 }}>
            <span className="panel__badge" style={{ background: 'var(--gold)', borderColor: 'var(--gold)', color: 'var(--ink)' }}>
              <Icon name="bell" size={17} />
            </span>
            <span className="panel__grow">
              <span style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Silkscreen tone="var(--ink)">Nuzio</Silkscreen>
                <Silkscreen>now</Silkscreen>
              </span>
              <span className="panel__title" style={{ fontSize: 13.5, marginTop: 4, display: 'block' }}>
                Your morning brief is ready
              </span>
              <span className="panel__sub">
                {app.stories.length} stories · {app.nicheLabels.slice(0, 3).join(', ')} ·{' '}
                {app.prefs.briefMinutes}:00
              </span>
            </span>
          </div>
        </div>
      </div>
      <div className="screen__foot">
        <Plate
          onClick={() => {
            app.setPref('notifications', true)
            go(9)
          }}
        >
          Allow notifications
        </Plate>
        <div className="mt-s">
          <GhostPlate
            onClick={() => {
              app.setPref('notifications', false)
              go(9)
            }}
          >
            Not now
          </GhostPlate>
        </div>
      </div>
    </section>
  )
}

/* ---------------------------------------------------------- 9 */
export function Ready({ go }) {
  const app = useApp()
  const { profession, voice, nicheLabels, prefs } = app

  // Arriving here is the signal that the five steps are complete: this is the
  // one moment the whole contract is written to the profile. The ref keeps
  // StrictMode's second mount from writing it twice.
  const committed = useRef(false)
  useEffect(() => {
    if (committed.current) return
    committed.current = true
    app.commitOnboarding()
  }, [app])

  const summary = [
    [profession?.icon ?? 'tech', 'Profession', profession?.label ?? '—'],
    [app.pickedNiches[0]?.icon ?? 'ai', 'Niches', nicheLabels.join(', ') || 'None yet'],
    ['mic', 'Narrator', voice ? `${voice.name} — ${voice.line}` : '—'],
    ['clock', 'Length', `${app.stories.length} stories · about ${prefs.briefMinutes} min`],
    [
      'bell',
      'Delivery',
      prefs.notifications
        ? `Every day at ${app.deliveryLabel}`
        : `Every day at ${app.deliveryLabel} · no notifications`,
    ],
  ]
  return (
    <section className="screen">
      <div className="screen__body rise" style={{ paddingTop: 26 }}>
        <div className="seal"><Icon name="check" size={36} stroke={2.2} /></div>
        <div className="mt-l">
          <Lettering
            lead={app.firstName ? 'You’re set,' : 'You’re set.'}
            rest={app.firstName ? `${app.firstName}.` : 'Your brief is booked.'}
          />
          <p className="copy">
            Your first brief lands tomorrow at {app.deliveryLabel}. We have already started
            assembling it.
          </p>
        </div>
        <Rule />
        <div className="mt-m">
          {summary.map(([icon, label, value]) => (
            <div className="row" key={label}>
              <span className="row__icon"><Icon name={icon} size={17} /></span>
              <span className="row__grow">
                <Silkscreen>{label}</Silkscreen>
                <span className="row__title" style={{ marginTop: 3 }}>{value}</span>
              </span>
              <Icon name="check" size={15} stroke={2.4} style={{ color: 'var(--green)' }} />
            </div>
          ))}
        </div>
      </div>
      <div className="screen__foot">
        <Plate tone="green" onClick={() => go(10)}>Start listening</Plate>
      </div>
    </section>
  )
}
