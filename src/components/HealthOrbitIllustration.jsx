import { FiActivity, FiCalendar, FiFileText, FiShield } from 'react-icons/fi'

const orbitCards = [
  {
    className: 'health-orbit__card--vitals',
    icon: FiActivity,
    title: 'Vitals',
    metric: '72 BPM',
    note: 'Stable rhythm',
  },
  {
    className: 'health-orbit__card--records',
    icon: FiFileText,
    title: 'Records',
    metric: '20K+',
    note: 'Digitized files',
  },
  {
    className: 'health-orbit__card--schedule',
    icon: FiCalendar,
    title: 'Visits',
    metric: '06 today',
    note: 'Booked on time',
  },
  {
    className: 'health-orbit__card--privacy',
    icon: FiShield,
    title: 'Privacy',
    metric: '100%',
    note: 'Encrypted flow',
  },
]

export default function HealthOrbitIllustration() {
  return (
    <div className="health-orbit" aria-label="MediConnect care network illustration">
      <div className="health-orbit__halo health-orbit__halo--one" aria-hidden="true" />
      <div className="health-orbit__halo health-orbit__halo--two" aria-hidden="true" />
      <div className="health-orbit__ring health-orbit__ring--outer" aria-hidden="true" />
      <div className="health-orbit__ring health-orbit__ring--inner" aria-hidden="true" />
      <div className="health-orbit__stream health-orbit__stream--left" aria-hidden="true" />
      <div className="health-orbit__stream health-orbit__stream--right" aria-hidden="true" />

      {orbitCards.map(({ className, icon: Icon, title, metric, note }) => (
        <article className={`health-orbit__card ${className}`} key={title}>
          <span className="health-orbit__card-icon" aria-hidden="true">
            <Icon />
          </span>
          <div className="health-orbit__card-copy">
            <strong>{title}</strong>
            <span className="health-orbit__card-metric">{metric}</span>
            <span className="health-orbit__card-note">{note}</span>
          </div>
        </article>
      ))}

      <section className="health-orbit__core">
        <div className="health-orbit__core-top">
          <span>Digital Care Hub</span>
          <strong>Live Sync</strong>
        </div>

        <svg className="health-orbit__pulse" viewBox="0 0 420 220" aria-hidden="true">
          <defs>
            <linearGradient id="orbitPulse" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#2b73f0" />
              <stop offset="100%" stopColor="#78a9ff" />
            </linearGradient>
          </defs>
          <circle cx="210" cy="110" r="84" fill="none" stroke="rgba(45,115,240,0.12)" strokeWidth="14" />
          <path
            d="M42 112h56l20-34 22 70 20-40 17 26h42l20-22 14 16h109"
            fill="none"
            stroke="url(#orbitPulse)"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="10"
          />
        </svg>

        <div className="health-orbit__metrics">
          <div>
            <strong>18 sec</strong>
            <span>Avg response</span>
          </div>
          <div>
            <strong>94%</strong>
            <span>Connected</span>
          </div>
        </div>

        <div className="health-orbit__chips">
          <span>Televisit</span>
          <span>EHR</span>
          <span>Follow-up</span>
        </div>

        <div className="health-orbit__seal">Secure data flow</div>
      </section>
    </div>
  )
}
