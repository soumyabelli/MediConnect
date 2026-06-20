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
import { useMediConnect } from '../context/MediConnectContext'

const roleCards = [
  {
    role: 'admin',
    label: 'Admin',
    title: 'Control the clinic workspace and doctor controll',
    description: 'Create doctor accounts, review patients, and keep every record in one control panel.',
    image: '/illustrations/admin.svg',
    points: ['Admin login is seeded in MongoDB', 'Doctors and patients stay in sync', 'Passwords are hashed before storage'],
  },
  {
    role: 'doctor',
    label: 'Doctor',
    title: 'Sign in with admin-issued credentials',
    description: 'Use the email and temporary password created by the admin to open your dashboard.',
    image: '/illustrations/doctor.svg',
    points: ['Assigned patients appear automatically', 'Appointments and records stay connected', 'Login details are stored securely'],
  },
  {
    role: 'patient',
    label: 'Patient',
    title: 'Register first, then sign in',
    description: 'Fill the registration form, pick a doctor if needed, and land in your own patient portal.',
    image: '/illustrations/patient.svg',
    points: ['Registration is saved in MongoDB', 'Doctors are picked from the live database list', 'Your account is ready after signup'],
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

function RoleCard({ card, active, onClick }) {
  return (
    <button
      type="button"
      className={`role-switcher__button role-switcher__button--image ${active ? 'role-switcher__button--active' : ''}`}
      onClick={onClick}
    >
      <span>{card.label}</span>
      <strong>{card.title}</strong>
      <small>{card.description}</small>
      <img className="role-switcher__image" src={card.image} alt="" aria-hidden="true" />
    </button>
  )
}

export default function Login() {
  const navigate = useNavigate()
  const { bootstrapping, publicDoctors, session, login, registerPatient } = useMediConnect()
  const [role, setRole] = useState('admin')
  const [mode, setMode] = useState('register')
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
        <aside className="auth-copy">
          <p className="auth-eyebrow">Role based access</p>
          <h1 className="auth-title">MediConnect login and registration</h1>
          <p className="auth-intro">
            Use the admin portal to create doctors, let doctors sign in with admin-issued credentials, and register patients before they open their own dashboard.
          </p>

          <div className="auth-bullet-list">
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

          <div className="auth-role-gallery">
            {roleCards.map((card) => (
              <article className={`auth-role-card ${role === card.role ? 'auth-role-card--active' : ''}`} key={card.role}>
                <img src={card.image} alt="" aria-hidden="true" className="auth-role-card__image" />
                <div>
                  <span>{card.label}</span>
                  <strong>{card.title}</strong>
                  <p>{card.description}</p>
                </div>
              </article>
            ))}
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
            <p>Admin signs in with the seeded account, doctors use admin-issued credentials, and patients register before login.</p>
          </div>

          <div className="role-switcher" role="tablist" aria-label="Role selection">
            {roleCards.map((card) => (
              <RoleCard
                key={card.role}
                card={card}
                active={role === card.role}
                onClick={() => handleRoleSelect(card.role)}
              />
            ))}
          </div>

          <div className="auth-role-preview">
            <img src={selectedRole.image} alt="" aria-hidden="true" className="auth-role-preview__image" />
            <div className="auth-role-preview__copy">
              <span className="auth-role-preview__eyebrow">Selected role</span>
              <strong>{selectedRole.title}</strong>
              <p>{selectedRole.description}</p>
              <ul>
                {selectedRole.points.map((point) => (
                  <li key={point}>{point}</li>
                ))}
              </ul>
            </div>
          </div>

          {role === 'patient' ? (
            <>
              <div className="auth-mode-toggle">
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

                  <label className="auth-field">
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

                  <label className="auth-field">
                    Address
                    <input name="address" value={patientForm.address} onChange={handlePatientChange} placeholder="City, state" />
                  </label>

                  <label className="auth-field">
                    Notes
                    <textarea name="notes" rows="3" value={patientForm.notes} onChange={handlePatientChange} placeholder="Any extra information for the doctor" />
                  </label>

                  <div className="auth-notes auth-notes--soft">
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
                    Create patient account
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
                    Open patient dashboard
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

              <div className="auth-notes">
                {role === 'admin' ? (
                  <>
                    <strong>Seeded admin credentials</strong>
                    <p>Use <b>admin@gmail.con</b> with <b>as123</b> to open the admin dashboard.</p>
                  </>
                ) : (
                  <>
                    <strong>Doctor access</strong>
                    <p>Doctors sign in with the email and temporary password created by the admin panel.</p>
                  </>
                )}
              </div>

              {message ? <p className="auth-feedback auth-feedback--success">{message}</p> : null}
              {error ? <p className="auth-feedback auth-feedback--error">{error}</p> : null}

              <button type="submit" className="portal-button auth-submit">
                Sign in to dashboard
                <FiChevronRight aria-hidden="true" />
              </button>
            </form>
          )}
        </div>
      </section>
    </main>
  )
}
