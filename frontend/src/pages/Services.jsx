import { Link } from 'react-router-dom'
import {
  FiCalendar,
  FiFileText,
  FiFolder,
  FiMessageCircle,
  FiShield,
  FiVideo,
} from 'react-icons/fi'
import InfoPageShell from '../components/InfoPageShell'

const serviceCards = [
  {
    icon: FiVideo,
    title: 'Video consultations',
    text: 'Hold secure online appointments without making patients travel for routine follow-ups.',
  },
  {
    icon: FiFolder,
    title: 'Electronic health records',
    text: 'Keep patient history, notes, and care plans organized in one accessible timeline.',
  },
  {
    icon: FiCalendar,
    title: 'Smart scheduling',
    text: 'Book visits, manage slots, and reduce missed appointments with clearer reminders.',
  },
  {
    icon: FiFileText,
    title: 'Prescription support',
    text: 'Share prescriptions, reports, and care instructions in a format patients can keep.',
  },
  {
    icon: FiMessageCircle,
    title: 'Follow-up messaging',
    text: 'Close the loop after a consult with updates, quick questions, and care notes.',
  },
  {
    icon: FiShield,
    title: 'Protected workflows',
    text: 'Use access controls and secure sharing so patient data stays private by default.',
  },
]

function ServicesVisual() {
  return (
    <div className="page-visual page-visual--services">
      <div className="page-visual__stack page-visual__stack--top">
        <span>Video visit</span>
        <strong>Start care in seconds</strong>
      </div>
      <div className="page-visual__stack page-visual__stack--middle">
        <span>Records</span>
        <strong>History, notes, and reports together</strong>
      </div>
      <div className="page-visual__stack page-visual__stack--bottom">
        <span>Follow-up</span>
        <strong>Keep patients moving forward after the call</strong>
      </div>
    </div>
  )
}

export default function Services() {
  return (
    <InfoPageShell
      eyebrow="What we provide"
      title="A service stack built for digital care."
      intro="From the first consultation to the last follow-up note, MediConnect keeps the whole patient journey connected and easy to manage."
      visual={<ServicesVisual />}
      cards={serviceCards}
      actionPrimary={
        <Link className="inline-button" to="/how-it-works">
          See the process
        </Link>
      }
      actionSecondary={
        <Link className="inline-button inline-button--ghost" to="/contact">
          Ask a question
        </Link>
      }
    >
      <section className="info-detail-grid">
        <article className="info-panel">
          <h2>For patients</h2>
          <p>
            Easy booking, quick online visits, clear instructions, and a single place
            to keep records and prescriptions.
          </p>
        </article>

        <article className="info-panel">
          <h2>For clinics</h2>
          <p>
            Fewer disconnected tools, faster chart access, better follow-up, and a more
            consistent experience for every visit.
          </p>
        </article>
      </section>
    </InfoPageShell>
  )
}
