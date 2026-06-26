import { Link } from 'react-router-dom'
import {
  FiArrowRight,
  FiCalendar,
  FiFileText,
  FiFolder,
  FiShield,
  FiUser,
  FiUsers,
  FiVideo,
} from 'react-icons/fi'
import HealthOrbitIllustration from '../components/HealthOrbitIllustration'

const featureTiles = [
  { icon: FiVideo, label: ['Online', 'Consultation'] },
  { icon: FiFolder, label: ['Electronic', 'Health Records'] },
  { icon: FiCalendar, label: ['Smart', 'Appointments'] },
  { icon: FiShield, label: ['Secure &', 'Private'] },
]

const stats = [
  { icon: FiUsers, value: '10K+', label: 'Happy Patients' },
  { icon: FiUser, value: '500+', label: 'Expert Doctors' },
  { icon: FiShield, value: '100%', label: 'Secure & Private' },
  { icon: FiFileText, value: '20K+', label: 'Records Managed' },
]

export default function Home() {
  return (
    <>
      <main className="hero-layout">
        <section className="hero-copy" aria-labelledby="hero-title">
          <h1 id="hero-title" className="hero-title">
            <span className="hero-title__accent">MediConnect -</span>
            <span>Telemedicine &amp;</span>
            <span>Electronic Health</span>
            <span>Records System</span>
          </h1>

          <p className="hero-description">
            MediConnect is a secure and smart healthcare
            <br />
            platform that connects patients and doctors
            <br />
            through online consultations, care follow-ups,
            <br />
            and digital health records - anytime, anywhere.
          </p>

          <div className="feature-grid" aria-label="Key features">
            {featureTiles.map(({ icon: Icon, label }) => (
              <article className="feature-tile" key={label.join('-')}>
                <span className="feature-tile__icon">
                  <Icon aria-hidden="true" />
                </span>
                <span className="feature-tile__label">
                  <span>{label[0]}</span>
                  <span>{label[1]}</span>
                </span>
              </article>
            ))}
          </div>

          <Link to="/login" className="hero-cta">
            <span>Login to Get Started</span>
            <FiArrowRight aria-hidden="true" />
          </Link>
        </section>

        <section className="visual-cluster" aria-label="Connected care illustration">
          <HealthOrbitIllustration />
        </section>
      </main>

      <section className="stats-strip" aria-label="MediConnect statistics">
        {stats.map(({ icon: Icon, value, label }) => (
          <article className="stat-item" key={label}>
            <span className="stat-item__icon" aria-hidden="true">
              <Icon />
            </span>
            <div className="stat-item__copy">
              <strong>{value}</strong>
              <span>{label}</span>
            </div>
          </article>
        ))}
      </section>
    </>
  )
}
