import { Link } from 'react-router-dom'
import { FiActivity, FiBell, FiFileText, FiFolder, FiMessageCircle, FiShield } from 'react-icons/fi'
import InfoPageShell from '../components/InfoPageShell'

const featureCards = [
  {
    icon: FiShield,
    title: 'Role-based access',
    text: 'Make sure the right people can see the right information at the right time.',
  },
  {
    icon: FiBell,
    title: 'Smart reminders',
    text: 'Reduce missed appointments with clear prompts before and after each visit.',
  },
  {
    icon: FiFolder,
    title: 'Unified records',
    text: 'Keep files, notes, and history inside one patient-centered workspace.',
  },
  {
    icon: FiFileText,
    title: 'Document sharing',
    text: 'Move reports and instructions through a clean, understandable workflow.',
  },
  {
    icon: FiMessageCircle,
    title: 'Care messaging',
    text: 'Answer quick questions and post visit updates without losing context.',
  },
  {
    icon: FiActivity,
    title: 'Usage insights',
    text: 'See appointment activity and care trends with lightweight operational visibility.',
  },
]

function FeaturesVisual() {
  return (
    <div className="page-visual page-visual--features">
      <div className="page-visual__badge page-visual__badge--one">Secure</div>
      <div className="page-visual__badge page-visual__badge--two">Fast</div>
      <div className="page-visual__badge page-visual__badge--three">Clear</div>
      <div className="page-visual__feature-card">
        <span>Feature preview</span>
        <strong>Tools that keep care moving</strong>
        <p>Everything is arranged to help teams act quickly without adding clutter.</p>
      </div>
    </div>
  )
}

export default function Features() {
  return (
    <InfoPageShell
      eyebrow="Platform features"
      title="Everything the workflow needs, without the clutter."
      intro="MediConnect focuses on practical features that remove friction for patients and keep the clinic side organized."
      visual={<FeaturesVisual />}
      cards={featureCards}
      actionPrimary={
        <Link className="inline-button" to="/services">
          Compare services
        </Link>
      }
      actionSecondary={
        <Link className="inline-button inline-button--ghost" to="/contact">
          Request a demo here
        </Link>
      }
    >
      <section className="info-detail-grid">
        <article className="info-panel">
          <h2>Built to be calm and peacefully</h2>
          <p>
            We prefer clear language, obvious actions, and layouts that let users breathe
            instead of overwhelming them with noise.
          </p>
        </article>

        <article className="info-panel">
          <h2>Built to scale</h2>
          <p>
            The structure is ready for future features like analytics, roles, and deeper
            patient history without changing the whole experience.
          </p>
        </article>
      </section>
    </InfoPageShell>
  )
}
