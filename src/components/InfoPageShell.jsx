export default function InfoPageShell({
  eyebrow,
  title,
  intro,
  visual,
  cards = [],
  actionPrimary,
  actionSecondary,
  children,
  className = '',
}) {
  return (
    <main className={`info-page ${className}`.trim()}>
      <section className="info-hero">
        <div className="info-hero__copy">
          <p className="info-eyebrow">{eyebrow}</p>
          <h1 className="info-title">{title}</h1>
          <p className="info-intro">{intro}</p>

          {(actionPrimary || actionSecondary) && (
            <div className="info-actions">
              {actionPrimary}
              {actionSecondary}
            </div>
          )}
        </div>

        <div className="info-hero__visual">{visual}</div>
      </section>

      {cards.length > 0 && (
        <section className="info-card-grid" aria-label="Page highlights">
          {cards.map(({ icon: Icon, title: cardTitle, text, badge }) => (
            <article className="info-card" key={cardTitle}>
              {Icon ? (
                <span className="info-card__icon" aria-hidden="true">
                  <Icon />
                </span>
              ) : null}
              <div className="info-card__body">
                <div className="info-card__header">
                  <h2>{cardTitle}</h2>
                  {badge ? <span className="info-card__badge">{badge}</span> : null}
                </div>
                <p>{text}</p>
              </div>
            </article>
          ))}
        </section>
      )}

      {children}
    </main>
  )
}
