import { useEffect, useState } from 'react'
import './styles/board.css'
import './styles/app.css'
import heroGround from './assets/ground-hero.jpg'
import atmosGround from './assets/ground-atmos.jpg'
import { SCREENS } from './data/catalog.js'
import {
  Splash,
  Language,
  SignIn,
  Profession,
  Niches,
  Voice,
  DeliveryTime,
  Notifications,
  Ready,
} from './screens/Onboarding.jsx'
import { Brief, Discover, Settings, Plans } from './screens/App4.jsx'

const VIEWS = {
  1: Splash,
  2: Language,
  3: SignIn,
  4: Profession,
  5: Niches,
  6: Voice,
  7: DeliveryTime,
  8: Notifications,
  9: Ready,
  10: Brief,
  11: Discover,
  12: Settings,
  13: Plans,
}

function StatusBar() {
  return (
    <div className="statusbar">
      <span>9:41</span>
      <span style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
        <svg width="17" height="11" viewBox="0 0 17 11" fill="currentColor" aria-hidden="true">
          <rect x="0" y="7.5" width="3" height="3.5" rx="0.6" />
          <rect x="4.6" y="5" width="3" height="6" rx="0.6" />
          <rect x="9.2" y="2.5" width="3" height="8.5" rx="0.6" />
          <rect x="13.8" y="0" width="3" height="11" rx="0.6" opacity="0.4" />
        </svg>
        <svg width="20" height="11" viewBox="0 0 20 11" fill="none" aria-hidden="true">
          <rect x="0.5" y="0.5" width="16" height="10" rx="2" stroke="currentColor" opacity="0.5" />
          <rect x="2" y="2" width="10" height="7" rx="1" fill="currentColor" />
          <path d="M18 4v3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" opacity="0.5" />
        </svg>
      </span>
    </div>
  )
}

export default function App() {
  const [at, setAt] = useState(1)
  const go = (n) => setAt(Math.min(SCREENS.length, Math.max(1, n)))

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'ArrowRight') setAt((v) => Math.min(SCREENS.length, v + 1))
      if (e.key === 'ArrowLeft') setAt((v) => Math.max(1, v - 1))
    }
    addEventListener('keydown', onKey)
    return () => removeEventListener('keydown', onKey)
  }, [])

  const View = VIEWS[at]
  const hero = at === 1 || at === 3

  return (
    <main className="stage">
      <div className="board">
        {/* The client's key art carries every screen: hero fidelity where the
            art is the subject, a blurred plate behind working content. */}
        <div
          className={`ground ${hero ? '' : 'ground--atmos'}`}
          style={{ backgroundImage: `url(${hero ? heroGround : atmosGround})` }}
        />
        <div className={`scrim ${hero ? '' : 'scrim--heavy'}`} />
        <div className="board__notch" />
        <StatusBar />
        <View key={at} go={go} />
      </div>

      <aside className="rail">
        <div className="rail__title">Nuzio AI · 13 screens</div>
        <div className="rail__list">
          {SCREENS.map((name, i) => (
            <button
              key={name}
              type="button"
              className={at === i + 1 ? 'is-on' : ''}
              onClick={() => go(i + 1)}
            >
              <i>{String(i + 1).padStart(2, '0')}</i>
              {name}
            </button>
          ))}
        </div>
        <p className="rail__hint">
          Arrow keys move between screens. Every control works — pick niches, switch the
          narrator, set the hour, run the player, search Discover.
        </p>
      </aside>
    </main>
  )
}
