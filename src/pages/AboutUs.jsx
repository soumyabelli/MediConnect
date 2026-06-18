import { Link } from 'react-router-dom'
import { FiClock, FiShield, FiUsers } from 'react-icons/fi'
import InfoPageShell from '../components/InfoPageShell'

const highlights = [
  {
    icon: FiUsers,
    title: 'Mission',
    text: 'Make first-line digital care feel simple for patients and efficient for care teams.',
    badge: 'People first',
  },
  {
    icon: FiClock,
    title: 'Vision',
    text: 'Create one workspace where booking, visits, records, and follow-up all stay in sync.',
    badge: 'Always on',
  },
  {
    icon: FiShield,
    title: 'Trust',
    text: 'Keep private health information protected with access controls and secure sharing.',
    badge: 'Privacy',
  },
]

function AboutVisual() {
  return (
    <div className="page-visual page-visual--about">
      <div className="page-visual__orb" aria-hidden="true" />
      <article className="page-visual__panel page-visual__panel--main">
        <span className="page-visual__label">Connected care</span>
        <strong>One place for patients, doctors, and records.</strong>
        <p>We reduce friction so care teams can move from question to action faster.</p>
      </article>
      <article className="page-visual__card page-visual__card--top">
        <span>24/7 access</span>
        <strong>Support without the waiting room</strong>
      </article>
      <article className="page-visual__card page-visual__card--bottom">
        <span>Shared context</span>
        <strong>Visits, labs, and notes in one timeline</strong>
      </article>
    </div>
  )
}

export default function AboutUs() {
  return (
    <InfoPageShell
      eyebrow="About MediConnect"
      title="We build calm, connected digital care."
      intro="MediConnect unifies telemedicine, health records, appointments, and follow-up so small teams can focus on patients instead of scattered tools."
      visual={<AboutVisual />}
      cards={highlights}
      actionPrimary={
        <Link className="inline-button" to="/services">
          Explore services
        </Link>
      }
      actionSecondary={
        <Link className="inline-button inline-button--ghost" to="/contact">
          Contact the team
        </Link>
      }
    >
      <section className="info-detail-grid">
        <article className="info-panel">
          <h2>Why we started</h2>
          <p>
            Care often gets slowed down by disconnected tools. MediConnect was designed
            to bring consultations, records, and coordination into one steady flow.
          </p>
          <p>
            The goal is not just to digitize forms. It is to make the whole experience
            feel clearer for patients and less chaotic for clinicians.
          </p>
        </article>

        <article className="info-panel info-panel--stacked">
          <div className="metric-stack">
            <div className="metric-stack__item">
              <strong>24/7</strong>
              <span>Access to care pathways</span>
            </div>
            <div className="metric-stack__item">
              <strong>1</strong>
              <span>Shared workspace</span>
            </div>
            <div className="metric-stack__item">
              <strong>100%</strong>
              <span>Encrypted record sharing</span>
            </div>
          </div>
        </article>
      </section>
    </InfoPageShell>
  )
}
