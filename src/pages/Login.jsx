import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  FiArrowRight,
  FiFileText,
  FiHeart,
  FiLock,
  FiMail,
  FiPhone,
  FiShield,
  FiUser,
  FiUsers,
  FiChevronRight,
} from 'react-icons/fi'
import doctorImage from '../assets/women doctor.png'
import BrandMark from '../components/BrandMark'
import { useMediConnect } from '../context/MediConnectContext'

const roleCards = [
  {
    role: 'patient',
    label: 'Patient',
    title: 'Register first, then sign in',
    description: 'Fill the registration form to create your patient portal.',
    note: 'Register once and the admin can view your details immediately.',
    image: '/illustrations/patient.svg',
    icon: FiHeart,
    tone: 'rose',
    points: ['Registration is saved in MongoDB', 'Doctors are picked from the live database list', 'Your account opens right after signup'],
  },
  {
    role: 'doctor',
    label: 'Doctor',
    title: 'Sign in with admin-issued credentials',
    description: 'Use the email and temporary password created by the admin.',
    note: 'Doctor accounts are created in the admin dashboard and shared with you securely.',
    image: doctorImage,
    icon: FiUsers,
    tone: 'teal',
    points: ['Assigned patients appear automatically', 'Appointments and records stay connected', 'Login details are stored securely'],
  },
  {
    role: 'admin',
    label: 'Admin',
    title: 'Control the clinic workspace',
    description: 'Open the seeded admin account to manage doctors and patients.',
    note: 'Use admin@gmail.con with as123 to open the admin dashboard.',
    image: '/illustrations/admin.svg',
    icon: FiShield,
    tone: 'blue',
    points: ['Admin login is seeded in MongoDB', 'You can create doctor accounts from the dashboard', 'Patients and records stay in sync'],
  },
]

const patientDefaults = {
  name: '',
  email: '',
  password: '',
  phone: '',
  age: '',
  gender: 'Female',
  condition: '',
  bloodGroup: '',
  address: '',
  notes: '',
  preferredDoctorId: '',
}

function AuthBullet({ icon: Icon, title, text }) {
  return (
    <div className="auth-bullet">
      <span className="auth-bullet__icon" aria-hidden="true">
        <Icon />
      </span>
      <div>
        <strong>{title}</strong>
        <p>{text}</p>
      </div>
    </div>
  )
}

function RoleTab({ card, active, onClick }) {
  const Icon = card.icon

  return (
    <button
      type="button"
      className={`auth-role-tab auth-role-tab--${card.tone} ${active ? 'auth-role-tab--active' : ''}`}
      onClick={onClick}
      aria-pressed={active}
    >
      <span className="auth-role-tab__icon" aria-hidden="true">
        <Icon />
      </span>
      <span className="auth-role-tab__copy">
        <strong>{card.label}</strong>
        <small>{card.description}</small>
      </span>
    </button>
  )
}

export default function Login() {
  const navigate = useNavigate()
  const { bootstrapping, publicDoctors, session, login, registerPatient } = useMediConnect()
  const [role, setRole] = useState('admin')
  const [mode, setMode] = useState('signin')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [signInForm, setSignInForm] = useState({
    email: 'admin@gmail.con',
    password: 'as123',
  })
  const [patientForm, setPatientForm] = useState(patientDefaults)

  useEffect(() => {
    if (!bootstrapping && session?.role) {
      navigate(`/${session.role}`, { replace: true })
    }
  }, [bootstrapping, navigate, session])

  const selectedRole = roleCards.find((card) => card.role === role) || roleCards[0]
  const isPatient = role === 'patient'
  const authNoteHeading =
    role === 'admin' ? 'Seeded admin credentials' : role === 'doctor' ? 'Doctor access' : mode === 'register' ? 'Patient registration' : 'Patient sign in'
  const authNoteCopy =
    role === 'admin'
      ? selectedRole.note
      : role === 'doctor'
        ? selectedRole.note
        : mode === 'register'
          ? selectedRole.note
          : 'Use the email and password you created during registration.'
  const submitLabel =
    isPatient && mode === 'register'
      ? 'Create patient account'
      : isPatient
        ? 'Open patient dashboard'
        : 'Sign in to dashboard'

  const handleSignInChange = (event) => {
    const { name, value } = event.target
    setSignInForm((current) => ({ ...current, [name]: value }))
  }

  const handlePatientChange = (event) => {
    const { name, value } = event.target
    setPatientForm((current) => ({ ...current, [name]: value }))
  }

  const handleRoleSelect = (nextRole) => {
    setRole(nextRole)
    setMessage('')
    setError('')
    setMode(nextRole === 'patient' ? 'register' : 'signin')
    setSignInForm(
      nextRole === 'admin'
        ? {
            email: 'admin@gmail.con',
            password: 'as123',
          }
        : {
            email: '',
            password: '',
          },
    )
  }

  const handleSignInSubmit = async (event) => {
    event.preventDefault()
    setMessage('')
    setError('')

    const result = await login({
      role,
      email: signInForm.email,
      password: signInForm.password,
    })

    if (!result.ok) {
      setError(result.message)
      return
    }

    setMessage(`Signed in as ${result.user?.name || 'your account'}. Redirecting to the ${result.user?.role || role} dashboard.`)
    navigate(`/${result.user?.role || role}`, { replace: true })
  }

  const handlePatientSubmit = async (event) => {
    event.preventDefault()
    setMessage('')
    setError('')

    const result = await registerPatient(patientForm)

    if (!result.ok) {
      setError(result.message)
      return
    }

    setMessage(`Account created for ${result.patient?.name || 'the patient'}. Opening the patient dashboard now.`)
    navigate('/patient', { replace: true })
  }

  const doctorOptions = publicDoctors

  return (
    <main className="auth-page">
      <section className="auth-shell">
        <aside className="auth-copy auth-copy--hero">
          <div className="auth-brand-row">
            <Link to="/" className="auth-brand" aria-label="MediConnect home">
              <BrandMark />
              <span className="auth-brand__copy">
                <strong>MediConnect</strong>
                <small>Telemedicine &amp; EHR System</small>
              </span>
            </Link>

            <span className="auth-pill">Role based access</span>
          </div>

          <div className="auth-copy__hero">
            <p className="auth-eyebrow">Secure access</p>
            <h1 className="auth-title">Better healthcare connected with care</h1>
            <p className="auth-intro">
              MediConnect brings patients, doctors, and administrators together on a secure platform for consultations, records, and everyday care.
            </p>
          </div>

          <div className="auth-feature-list">
            <AuthBullet
              icon={FiShield}
              title="Secure admin flow"
              text="The admin account is seeded into MongoDB so you can open the dashboard right away."
            />
            <AuthBullet
              icon={FiUsers}
              title="Live doctor onboarding"
              text="Doctor accounts are stored in the database and immediately available for login."
            />
            <AuthBullet
              icon={FiHeart}
              title="Patient registration"
              text="Patients fill the form once, and their data is visible to admin, doctor, and patient views."
            />
            <AuthBullet
              icon={FiFileText}
              title="Everything stays in sync"
              text="Appointments, records, and login details are fetched from the backend instead of local mock data."
            />
          </div>

          <div className="auth-hero-card">
            <div className="auth-hero-card__visual">
              <img src={doctorImage} alt="Doctor portrait" className="auth-hero-card__image" />
              <span className="auth-hero-card__badge">Doctor access</span>
            </div>
            <div className="auth-hero-card__copy">
              <strong>Admin creates the account, doctor signs in right away</strong>
              <p>Share the temporary password from the admin dashboard and the doctor can open their dashboard immediately.</p>
            </div>
          </div>

          <div className="auth-chip-row">
            <span className="auth-chip">Seeded admin</span>
            <span className="auth-chip">Doctor onboarding</span>
            <span className="auth-chip">Patient intake</span>
          </div>

          <Link to="/" className="portal-button portal-button--ghost auth-home-link">
            Return to home
            <FiArrowRight aria-hidden="true" />
          </Link>
        </aside>

        <div className="auth-card auth-card--wide">
          <div className="auth-card__header">
            <span className="auth-card__eyebrow">Portal access</span>
            <h2>Choose your role</h2>
            <p>Patient registration opens by default for the patient role. Admin and doctor users sign in with the credentials created in MediConnect.</p>
          </div>

          <div className="auth-role-tabs" role="tablist" aria-label="Role selection">
            {roleCards.map((card) => (
              <RoleTab
                key={card.role}
                card={card}
                active={role === card.role}
                onClick={() => handleRoleSelect(card.role)}
              />
            ))}
          </div>

          <section className={`auth-role-summary auth-role-summary--${selectedRole.tone}`}>
            <img src={selectedRole.image} alt="" aria-hidden="true" className="auth-role-summary__image" />
            <div className="auth-role-summary__copy">
              <span className="auth-role-summary__eyebrow">Selected role</span>
              <strong>{selectedRole.title}</strong>
              <p>{selectedRole.description}</p>
            </div>
            <ul className="auth-role-summary__points">
              {selectedRole.points.map((point) => (
                <li key={point}>{point}</li>
              ))}
            </ul>
          </section>

          <div className="auth-notes">
            <strong>{authNoteHeading}</strong>
            <p>{authNoteCopy}</p>
          </div>

          {isPatient ? (
            <>
              <div className="auth-mode-toggle" role="tablist" aria-label="Patient access mode">
                <button
                  type="button"
                  className={mode === 'register' ? 'auth-mode-toggle__button auth-mode-toggle__button--active' : 'auth-mode-toggle__button'}
                  onClick={() => setMode('register')}
                >
                  Register
                </button>
                <button
                  type="button"
                  className={mode === 'signin' ? 'auth-mode-toggle__button auth-mode-toggle__button--active' : 'auth-mode-toggle__button'}
                  onClick={() => setMode('signin')}
                >
                  Sign in
                </button>
              </div>

              {mode === 'register' ? (
                <form className="auth-form" onSubmit={handlePatientSubmit}>
                  <div className="auth-form__grid">
                    <label className="auth-field">
                      Full name
                      <div className="auth-input-wrap">
                        <FiUser aria-hidden="true" />
                        <input name="name" value={patientForm.name} onChange={handlePatientChange} placeholder="Your full name" />
                      </div>
                    </label>
                    <label className="auth-field">
                      Email
                      <div className="auth-input-wrap">
                        <FiMail aria-hidden="true" />
                        <input name="email" type="email" value={patientForm.email} onChange={handlePatientChange} placeholder="patient@example.com" />
                      </div>
                    </label>
                  </div>

                  <div className="auth-form__grid">
                    <label className="auth-field">
                      Password
                      <div className="auth-input-wrap">
                        <FiLock aria-hidden="true" />
                        <input name="password" type="password" value={patientForm.password} onChange={handlePatientChange} placeholder="Create a password" />
                      </div>
                    </label>
                    <label className="auth-field">
                      Phone
                      <div className="auth-input-wrap">
                        <FiPhone aria-hidden="true" />
                        <input name="phone" value={patientForm.phone} onChange={handlePatientChange} placeholder="+91 90000 00003" />
                      </div>
                    </label>
                  </div>

                  <div className="auth-form__grid">
                    <label className="auth-field">
                      Age
                      <input name="age" type="number" min="0" value={patientForm.age} onChange={handlePatientChange} placeholder="28" />
                    </label>
                    <label className="auth-field">
                      Gender
                      <select name="gender" value={patientForm.gender} onChange={handlePatientChange}>
                        <option>Female</option>
                        <option>Male</option>
                        <option>Other</option>
                      </select>
                    </label>
                  </div>

                  <label className="auth-field auth-field--full">
                    Condition / reason
                    <input name="condition" value={patientForm.condition} onChange={handlePatientChange} placeholder="Heart care, migraine, fever..." />
                  </label>

                  <div className="auth-form__grid">
                    <label className="auth-field">
                      Blood group
                      <input name="bloodGroup" value={patientForm.bloodGroup} onChange={handlePatientChange} placeholder="O+" />
                    </label>
                    <label className="auth-field">
                      Preferred doctor
                      <select name="preferredDoctorId" value={patientForm.preferredDoctorId} onChange={handlePatientChange}>
                        <option value="">Auto assign from condition</option>
                        {doctorOptions.map((doctor) => (
                          <option key={doctor.id} value={doctor.id}>
                            {doctor.name} - {doctor.specialization}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>

                  <label className="auth-field auth-field--full">
                    Address
                    <input name="address" value={patientForm.address} onChange={handlePatientChange} placeholder="City, state" />
                  </label>

                  <label className="auth-field auth-field--full">
                    Notes
                    <textarea name="notes" rows="3" value={patientForm.notes} onChange={handlePatientChange} placeholder="Any extra information for the doctor" />
                  </label>

                  <div className="auth-notes auth-notes--soft auth-field--full">
                    <strong>Available doctors from the database</strong>
                    <div className="auth-doctor-list">
                      {doctorOptions.length ? (
                        doctorOptions.map((doctor) => (
                          <span key={doctor.id}>
                            {doctor.name} - {doctor.specialization}
                          </span>
                        ))
                      ) : (
                        <span>No doctors have been added yet. The admin can create them from the dashboard.</span>
                      )}
                    </div>
                  </div>

                  {message ? <p className="auth-feedback auth-feedback--success">{message}</p> : null}
                  {error ? <p className="auth-feedback auth-feedback--error">{error}</p> : null}

                  <button type="submit" className="portal-button auth-submit">
                    {submitLabel}
                    <FiChevronRight aria-hidden="true" />
                  </button>
                </form>
              ) : (
                <form className="auth-form" onSubmit={handleSignInSubmit}>
                  <label className="auth-field">
                    Email address
                    <div className="auth-input-wrap">
                      <FiMail aria-hidden="true" />
                      <input name="email" type="email" value={signInForm.email} onChange={handleSignInChange} placeholder="patient@example.com" />
                    </div>
                  </label>
                  <label className="auth-field">
                    Password
                    <div className="auth-input-wrap">
                      <FiLock aria-hidden="true" />
                      <input name="password" type="password" value={signInForm.password} onChange={handleSignInChange} placeholder="Your password" />
                    </div>
                  </label>

                  {message ? <p className="auth-feedback auth-feedback--success">{message}</p> : null}
                  {error ? <p className="auth-feedback auth-feedback--error">{error}</p> : null}

                  <button type="submit" className="portal-button auth-submit">
                    {submitLabel}
                    <FiChevronRight aria-hidden="true" />
                  </button>
                </form>
              )}
            </>
          ) : (
            <form className="auth-form" onSubmit={handleSignInSubmit}>
              <label className="auth-field">
                Email address
                <div className="auth-input-wrap">
                  <FiMail aria-hidden="true" />
                  <input
                    name="email"
                    type="email"
                    value={signInForm.email}
                    onChange={handleSignInChange}
                    placeholder={role === 'admin' ? 'admin@gmail.con' : 'doctor@example.com'}
                  />
                </div>
              </label>
              <label className="auth-field">
                Password
                <div className="auth-input-wrap">
                  <FiLock aria-hidden="true" />
                  <input name="password" type="password" value={signInForm.password} onChange={handleSignInChange} placeholder="Enter your password" />
                </div>
              </label>

              {message ? <p className="auth-feedback auth-feedback--success">{message}</p> : null}
              {error ? <p className="auth-feedback auth-feedback--error">{error}</p> : null}

              <button type="submit" className="portal-button auth-submit">
                {submitLabel}
                <FiChevronRight aria-hidden="true" />
              </button>
            </form>
          )}
        </div>
      </section>
    </main>
  )
}
