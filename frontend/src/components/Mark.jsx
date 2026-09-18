// The Nuzio mark, painted: five enamel bars struck through with the wordmark.
export default function Mark({ height = 26, mono = false }) {
  const s = height / 30
  const bar = (x, y, h, fill, o = 1) => (
    <rect key={x} x={x} y={y} width="4.4" height={h} rx="0.4" fill={fill} opacity={o} />
  )
  const blue = mono ? 'var(--ink)' : 'var(--blue-lit)'
  const green = mono ? 'var(--ink)' : 'var(--green)'
  return (
    <svg
      width={144 * s}
      height={30 * s}
      viewBox="0 0 144 30"
      fill="none"
      role="img"
      aria-label="Nuzio AI"
      style={{ display: 'block' }}
    >
      {bar(0, 12, 7, blue, 0.55)}
      {bar(6.6, 7.5, 16, blue)}
      {bar(13.2, 1, 29, 'var(--ink)')}
      {bar(19.8, 7.5, 16, 'var(--ink)', 0.8)}
      {bar(26.4, 11, 9, green)}
      <text
        x="38"
        y="23.2"
        fontFamily="Archivo, sans-serif"
        fontSize="24"
        fill="var(--ink)"
        style={{ fontVariationSettings: "'wdth' 112, 'wght' 800" }}
        letterSpacing="-0.9"
      >
        NUZIO
      </text>
      <text
        x="119"
        y="23.2"
        fontFamily="Archivo, sans-serif"
        fontSize="24"
        fill={mono ? 'var(--ink)' : 'var(--blue-lit)'}
        style={{ fontVariationSettings: "'wdth' 112, 'wght' 500" }}
        letterSpacing="-0.4"
      >
        AI
      </text>
    </svg>
  )
}
