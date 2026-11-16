
type Tone = 'light' | 'dark'

// light = pour fonds clairs (Papier, blanc) · dark = pour fonds sombres (Nuit, Minuit)
const PALETTE: Record<Tone, { base: string; board: string; arrow: string; book: string; spine: string }> = {
  light: { base: '#0A1B3D', board: '#1456D6', arrow: '#FFFFFF', book: '#1456D6', spine: '#F6F8FC' },
  dark:  { base: '#2B4F9E', board: '#4CC2FF', arrow: '#0A1B3D', book: '#E6ECF6', spine: '#0A1B3D' },
}

export function LogoMark({
  size = 32,
  tone = 'light',
  title = 'Campus Edu',
  className,
}: {
  size?: number
  tone?: Tone
  title?: string
  className?: string
}) {
  const c = PALETTE[tone]
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      role="img"
      aria-label={title}
      className={className}
    >
      <path d="M34 46 V68 C34 78 86 78 86 68 V46 Z" fill={c.base} />
      <path d="M60 20 L106 41 L60 62 L14 41 Z" fill={c.board} />
      <path
        d="M60 29 V46 M52 39 L60 47 L68 39"
        stroke={c.arrow}
        strokeWidth="4.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <path d="M106 41 V66" stroke="#F5A524" strokeWidth="3.5" strokeLinecap="round" />
      <circle cx="106" cy="71" r="6" fill="#F5A524" />
      <path d="M14 82 Q37 74 60 86 Q83 74 106 82 V100 Q83 92 60 104 Q37 92 14 100 Z" fill={c.book} />
      <path d="M60 86 V104" stroke={c.spine} strokeWidth="2.5" />
    </svg>
  )
}

/** « Campus » en encre, « Edu » en couleur de marque (Azur sur clair, Ciel sur sombre). */
export function Wordmark({
  tone = 'light',
  className = '',
}: {
  tone?: Tone
  className?: string
}) {
  return (
    <span className={`font-display font-bold tracking-tight ${className}`}>
      <span style={{ color: tone === 'dark' ? '#FFFFFF' : 'var(--nuit)' }}>Campus</span>{' '}
      <span style={{ color: tone === 'dark' ? 'var(--ciel)' : 'var(--azur)' }}>Edu</span>
    </span>
  )
}

export function Logo({
  size = 32,
  tone = 'light',
  textClassName = 'text-base',
}: {
  size?: number
  tone?: Tone
  textClassName?: string
}) {
  return (
    <span className="inline-flex items-center gap-2.5">
      <LogoMark size={size} tone={tone} title="Logo Campus Edu" />
      <Wordmark tone={tone} className={textClassName} />
    </span>
  )
}
