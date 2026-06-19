const toneClasses = {
  blue: 'tone-blue',
  green: 'tone-green',
  amber: 'tone-amber',
  rose: 'tone-rose',
  violet: 'tone-violet',
  teal: 'tone-teal',
  slate: 'tone-slate',
}

export function SectionHeader({ eyebrow, title, description, action }) {
  return (
    <div className="portal-section__header">
      <div>
        {eyebrow ? <p className="portal-section__eyebrow">{eyebrow}</p> : null}
        <h1 className="portal-section__title">{title}</h1>
        {description ? <p className="portal-section__description">{description}</p> : null}
      </div>

      {action ? <div className="portal-section__action">{action}</div> : null}
    </div>
  )
}

export function Panel({ title, description, action, children, className = '' }) {
  return (
    <section className={`portal-panel ${className}`.trim()}>
      {(title || description || action) && (
        <header className="portal-panel__header">
          <div>
            {title ? <h2>{title}</h2> : null}
            {description ? <p>{description}</p> : null}
          </div>
          {action ? <div className="portal-panel__action">{action}</div> : null}
        </header>
      )}
      {children}
    </section>
  )
}

export function MetricCard({ icon: Icon, label, value, detail, tone = 'blue' }) {
  return (
    <article className={`portal-metric-card ${toneClasses[tone] || toneClasses.blue}`}>
      <span className="portal-metric-card__icon" aria-hidden="true">
        {Icon ? <Icon /> : null}
      </span>
      <div className="portal-metric-card__copy">
        <span>{label}</span>
        <strong>{value}</strong>
        {detail ? <p>{detail}</p> : null}
      </div>
    </article>
  )
}

export function StatusPill({ children, tone = 'slate' }) {
  return <span className={`portal-status-pill ${toneClasses[tone] || toneClasses.slate}`}>{children}</span>
}

export function Table({ columns, rows, emptyMessage = 'Nothing to show yet.' }) {
  return (
    <div className="portal-table-wrap">
      <table className="portal-table">
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column}>{column}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length ? (
            rows
          ) : (
            <tr>
              <td className="portal-table__empty" colSpan={columns.length}>
                {emptyMessage}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}

export function EmptyState({ title, description }) {
  return (
    <div className="portal-empty-state">
      <strong>{title}</strong>
      <p>{description}</p>
    </div>
  )
}

export function Sparkline({ points = [], tone = 'blue' }) {
  const allPoints = points.length > 1 ? points : [12, 18, 15, 20, 26, 24, 30]
  const max = Math.max(...allPoints)
  const min = Math.min(...allPoints)
  const width = 150
  const height = 60
  const step = width / (allPoints.length - 1)
  const normalize = (value) => {
    if (max === min) {
      return height / 2
    }

    return height - ((value - min) / (max - min)) * (height - 10) - 5
  }

  const path = allPoints
    .map((value, index) => `${index === 0 ? 'M' : 'L'} ${index * step} ${normalize(value)}`)
    .join(' ')

  return (
    <svg className={`portal-sparkline ${toneClasses[tone] || toneClasses.blue}`} viewBox="0 0 150 60" aria-hidden="true">
      <path d={path} fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
