import { Link } from 'react-router-dom'
import { FiCalendar, FiFileText, FiShield, FiUser } from 'react-icons/fi'
import InfoPageShell from '../components/InfoPageShell'

const steps = [
  {
    icon: FiUser,
    title: 'Create a profile',
    text: 'Patients and clinics start with a clean profile that captures the essentials first.',
    badge: 'Step 01',
  },
  {
    icon: FiCalendar,
    title: 'Book the visitshere',
    text: 'Choose a slot here, confirm the time, and keep the appointment visible to everyone involved here.',
    badge: 'Step 02',
  },
  {
    icon: FiFileText,
    title: 'Share records',
    text: 'Bring notes, history, and reports into the consult so the discussion starts with context.',
    badge: 'Step 03',
  },
  {
    icon: FiShield,
    title: 'Follow up securely',
    text: 'Send instructions, updates, and next steps through a protected care channel.',
    badge: 'Step 04',
  },
]

function ProcessVisual() {
  return (
    <div className="page-visual page-visual--process">
      <div className="page-visual__rail" aria-hidden="true">
        <span />
        <span />
        <span />
        <span />
      </div>
      <div className="page-visual__lane">
        <strong>Book</strong>
        <strong>Consult</strong>
        <strong>Review</strong>
        <strong>Follow-up</strong>
      </div>
    </div>
  )
}

export default function HowItWorks() {
  return (
    <InfoPageShell
      eyebrow="How it works"
      title="A simple flow from booking to follow-up."
      intro="We keep the journey linear and easy to understand so patients know what happens next and care teams can move without friction."
      visual={<ProcessVisual />}
      cards={steps}
      actionPrimary={
        <Link className="inline-button" to="/features">
          Explore features
        </Link>
      }
      actionSecondary={
        <Link className="inline-button inline-button--ghost" to="/contact">
          Need help?
        </Link>
      }
    >
      <section className="info-detail-grid">
        <article className="info-panel">
          <h2>Before the consult</h2>
          <p>
            A patient books a visit, sees the schedule, and shares any files needed for
            the appointment.
          </p>
        </article>

        <article className="info-panel">
          <h2>After the consult</h2>
          <p>
            Notes, prescriptions, and next steps stay attached to the same patient record
            for easy follow-up later.
          </p>
        </article>
      </section>
    </InfoPageShell>
  )
}
