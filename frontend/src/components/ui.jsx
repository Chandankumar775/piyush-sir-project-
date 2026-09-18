import Icon from './Icon.jsx'

/* Painted display lettering. Weight jumps mid-phrase the way a sign painter
   fits a line to the board — `lead` is the struck word, `rest` the fitted one. */
export function Lettering({ lead, rest, size = 'var(--t-display)', tone, className = '' }) {
  return (
    <h1 className={`lettering ${className}`} style={{ fontSize: size }}>
      <span className="lettering__lead">{lead}</span>
      {rest ? (
        <span className="lettering__rest" style={tone ? { color: tone } : undefined}>
          {rest}
        </span>
      ) : null}
    </h1>
  )
}

/* Silkscreen micro-caps. Never sits above a heading — it labels a panel. */
export function Silkscreen({ children, tone, as: As = 'span', ...rest }) {
  return (
    <As className="silk" style={tone ? { color: tone } : undefined} {...rest}>
      {children}
    </As>
  )
}

/* The primary action: a painted plate with a hard underline, never a pill. */
export function Plate({ children, tone = 'gold', onClick, type = 'button', ...rest }) {
  return (
    <button type={type} className={`plate plate--${tone}`} onClick={onClick} {...rest}>
      <span className="plate__face">{children}</span>
    </button>
  )
}

export function GhostPlate({ children, onClick, ...rest }) {
  return (
    <button type="button" className="plate plate--ghost" onClick={onClick} {...rest}>
      <span className="plate__face">{children}</span>
    </button>
  )
}

/* Selection roundel: enamel floods from the mark outward when chosen. */
export function Roundel({ icon, label, selected, onClick, size = 'md', tone = 'blue' }) {
  return (
    <button
      type="button"
      className={`roundel roundel--${size} ${selected ? 'is-on' : ''} roundel--${tone}`}
      onClick={onClick}
      aria-pressed={selected}
    >
      <span className="roundel__disc">
        <Icon name={icon} size={size === 'sm' ? 20 : size === 'lg' ? 27 : 24} stroke={1.6} />
        <span className="roundel__flood" aria-hidden="true" />
        {selected && (
          <span className="roundel__tick" aria-hidden="true">
            <Icon name="check" size={13} stroke={2.6} />
          </span>
        )}
      </span>
      <span className="roundel__label">{label}</span>
    </button>
  )
}

export function Keyline({ children, className = '', ...rest }) {
  return (
    <div className={`keyline ${className}`} {...rest}>
      {children}
    </div>
  )
}

export function Rule({ tone }) {
  return <hr className="rule" style={tone ? { background: tone } : undefined} />
}

/* Provenance stands where an image would be. */
export function SourceStamp({ outlet, time, onClick }) {
  return (
    <button type="button" className="stamp" onClick={onClick}>
      <Icon name="source" size={12} stroke={2} />
      <span className="stamp__text">
        Source<span className="stamp__outlet"> · {outlet}</span>
      </span>
      {time && <span className="stamp__time tnum">{time}</span>}
    </button>
  )
}
