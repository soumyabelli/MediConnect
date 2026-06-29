import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
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
  FiEye,
  FiEyeOff,
  FiVideo,
  FiHeadphones,
  FiCloud,
} from 'react-icons/fi'
import { FcGoogle } from 'react-icons/fc'
import doctorImage from '../assets/women doctor.png'
import BrandMark from '../components/BrandMark'
import { useMediConnect } from '../context/MediConnectContext'

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

export default function Login() {
  const navigate = useNavigate()
  const { bootstrapping, publicDoctors, session, login, registerPatient } = useMediConnect()
  const [role, setRole] = useState('doctor') // default to Doctor tab as shown in the mockup
  const [mode, setMode] = useState('signin')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [signInForm, setSignInForm] = useState({
    email: '',
    password: '',
  })
  const [patientForm, setPatientForm] = useState(patientDefaults)

  useEffect(() => {
    if (!bootstrapping && session?.role) {
      navigate(`/${session.role}`, { replace: true })
    }
  }, [bootstrapping, navigate, session])

  const isPatient = role === 'patient'

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
    if (nextRole === 'admin') {
      setSignInForm({ email: 'admin@gmail.com', password: '123' })
    } else {
      setSignInForm({ email: '', password: '' })
    }
    setMessage('')
    setError('')
    setMode(nextRole === 'patient' ? 'signin' : 'signin')
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

  const doctorOptions = publicDoctors || []

  // Helper note based on role
  const getHelperNote = () => {
    if (role === 'admin') {
      return {
        heading: 'Seeded admin credentials',
        text: 'Use admin@gmail.com with 123 to open the admin dashboard and do the activity.'
      }
    }
    if (role === 'doctor') {
      return {
        heading: 'Doctor Access',
        text: 'Use the email and temporary password created by the administrator.'
      }
    }
    if (role === 'patient') {
      if (mode === 'register') {
        return {
          heading: 'Patient registration',
          text: 'Fill the registration form to create your patient portal. Admin and doctors will view your details immediately.'
        }
      }
      return {
        heading: 'Patient sign in',
        text: 'Use the email and password you created during registration.'
      }
    }
    return null
  }

  const helperNote = getHelperNote()

  return (
    <main className="new-login-container">
      {/* Left Panel: Hero and details */}
      <section className="login-hero-panel">
        <header className="login-hero-header">
          <div className="login-brand-logo">
            <BrandMark />
            <div className="login-brand-logo-text">
              <span className="login-brand-name">MediConnect</span>
              <span className="login-brand-sub">Telemedicine &amp; EHR System</span>
            </div>
          </div>
        </header>

        <div className="login-hero-body">
          <h1 className="login-hero-headline">
            Better Healthcare<br />
            Connected With <span className="highlight-care">Care</span>
          </h1>
          <p className="login-hero-desc">
            MediConnect brings patients, doctors, and administrators together on a secure platform for better consultations, records, and care.
          </p>

          <div className="login-features-list">
            <div className="login-feature-item">
              <div className="login-feature-icon-wrapper secure">
                <FiShield />
              </div>
              <div className="login-feature-text">
                <span className="login-feature-title">Secure &amp; Confidential</span>
                <span className="login-feature-desc">Your data is safe with end-to-end encryption here</span>
              </div>
            </div>

            <div className="login-feature-item">
              <div className="login-feature-icon-wrapper records">
                <FiFileText />
              </div>
              <div className="login-feature-text">
                <span className="login-feature-title">All-in-One Records</span>
                <span className="login-feature-desc">Access medical history, prescriptions &amp; reports</span>
              </div>
            </div>

            <div className="login-feature-item">
              <div className="login-feature-icon-wrapper consultations">
                <FiVideo />
              </div>
              <div className="login-feature-text">
                <span className="login-feature-title">Seamless Consultations</span>
                <span className="login-feature-desc">Connect instantly with your healthcare provider</span>
              </div>
            </div>
          </div>
        </div>

        <div className="login-hero-visual-area">
          <div className="login-doctor-img-container">
            <img src={doctorImage} alt="Doctor portrait" />
          </div>

          <div className="login-float-badge">
            <div className="login-float-icon">
              <FiLock />
            </div>
            <div className="login-float-text">
              <strong>Your health. Your data.</strong>
              Our priority. Trusted by thousands of patients and healthcare professionals.
            </div>
          </div>
        </div>
      </section>

      {/* Right Panel: Login Card */}
      <section className="login-form-panel">
        <div className="login-card-container">
          <div className="login-form-card">
            <div className="login-card-header">
              <h2 className="login-card-title">Welcome Back!</h2>
              <p className="login-card-subtitle">Login to continue to your account</p>
              <div className="login-card-pulse-divider">
                <FiHeart className="login-pulse-icon" />
              </div>
            </div>

            {/* Role Tab Selector */}
            <div className="login-role-tabs" role="tablist" aria-label="Role selection">
              <button
                type="button"
                role="tab"
                aria-selected={role === 'patient'}
                className={`login-role-tab ${role === 'patient' ? 'active' : ''}`}
                onClick={() => handleRoleSelect('patient')}
              >
                <FiUser /> Patient
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={role === 'doctor'}
                className={`login-role-tab ${role === 'doctor' ? 'active' : ''}`}
                onClick={() => handleRoleSelect('doctor')}
              >
                <FiUsers /> Doctor
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={role === 'admin'}
                className={`login-role-tab ${role === 'admin' ? 'active' : ''}`}
                onClick={() => handleRoleSelect('admin')}
              >
                <FiShield /> Admin
              </button>
            </div>

            {/* Feedback messages */}
            {message && <div className="login-feedback success">{message}</div>}
            {error && <div className="login-feedback error">{error}</div>}

            {isPatient && (
              <div className="patient-toggle-container">
                <button
                  type="button"
                  className={`patient-toggle-btn ${mode === 'signin' ? 'active' : ''}`}
                  onClick={() => setMode('signin')}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  className={`patient-toggle-btn ${mode === 'register' ? 'active' : ''}`}
                  onClick={() => setMode('register')}
                >
                  Register
                </button>
              </div>
            )}

            {/* Forms rendering */}
            {isPatient && mode === 'register' ? (
              /* Patient registration form */
              <form className="login-register-form" onSubmit={handlePatientSubmit}>
                <div className="login-form-grid">
                  <div className="login-form-group">
                    <label className="login-input-label">Full name</label>
                    <div className="login-input-wrapper">
                      <FiUser className="input-icon" />
                      <input
                        name="name"
                        value={patientForm.name}
                        onChange={handlePatientChange}
                        placeholder="Your full name"
                        required
                      />
                    </div>
                  </div>

                  <div className="login-form-group">
                    <label className="login-input-label">Email</label>
                    <div className="login-input-wrapper">
                      <FiMail className="input-icon" />
                      <input
                        name="email"
                        type="email"
                        value={patientForm.email}
                        onChange={handlePatientChange}
                        placeholder="patient@example.com"
                        required
                      />
                    </div>
                  </div>

                  <div className="login-form-group">
                    <label className="login-input-label">Password</label>
                    <div className="login-input-wrapper">
                      <FiLock className="input-icon" />
                      <input
                        name="password"
                        type="password"
                        value={patientForm.password}
                        onChange={handlePatientChange}
                        placeholder="Create a password"
                        required
                      />
                    </div>
                  </div>

                  <div className="login-form-group">
                    <label className="login-input-label">Phone</label>
                    <div className="login-input-wrapper">
                      <FiPhone className="input-icon" />
                      <input
                        name="phone"
                        value={patientForm.phone}
                        onChange={handlePatientChange}
                        placeholder="+91 90000 00003"
                        required
                      />
                    </div>
                  </div>

                  <div className="login-form-group">
                    <label className="login-input-label">Age</label>
                    <div className="login-input-wrapper">
                      <input
                        name="age"
                        type="number"
                        min="0"
                        value={patientForm.age}
                        onChange={handlePatientChange}
                        placeholder="28"
                        style={{ paddingLeft: '14px' }}
                        required
                      />
                    </div>
                  </div>

                  <div className="login-form-group">
                    <label className="login-input-label">Gender</label>
                    <div className="login-input-wrapper">
                      <select
                        name="gender"
                        value={patientForm.gender}
                        onChange={handlePatientChange}
                        style={{ paddingLeft: '14px' }}
                      >
                        <option>Female</option>
                        <option>Male</option>
                        <option>Other</option>
                      </select>
                    </div>
                  </div>

                  <div className="login-form-group full-width">
                    <label className="login-input-label">Condition / Reason</label>
                    <div className="login-input-wrapper">
                      <input
                        name="condition"
                        value={patientForm.condition}
                        onChange={handlePatientChange}
                        placeholder="Heart care, migraine, fever..."
                        style={{ paddingLeft: '14px' }}
                        required
                      />
                    </div>
                  </div>

                  <div className="login-form-group">
                    <label className="login-input-label">Blood group</label>
                    <div className="login-input-wrapper">
                      <input
                        name="bloodGroup"
                        value={patientForm.bloodGroup}
                        onChange={handlePatientChange}
                        placeholder="O+"
                        style={{ paddingLeft: '14px' }}
                        required
                      />
                    </div>
                  </div>

                  <div className="login-form-group">
                    <label className="login-input-label">Preferred doctor</label>
                    <div className="login-input-wrapper">
                      <select
                        name="preferredDoctorId"
                        value={patientForm.preferredDoctorId}
                        onChange={handlePatientChange}
                        style={{ paddingLeft: '14px' }}
                      >
                        <option value="">Auto assign from condition</option>
                        {doctorOptions.map((doctor) => (
                          <option key={doctor.id} value={doctor.id}>
                            {doctor.name} - {doctor.specialization}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="login-form-group full-width">
                    <label className="login-input-label">Address</label>
                    <div className="login-input-wrapper">
                      <input
                        name="address"
                        value={patientForm.address}
                        onChange={handlePatientChange}
                        placeholder="City, state"
                        style={{ paddingLeft: '14px' }}
                        required
                      />
                    </div>
                  </div>

                  <div className="login-form-group full-width">
                    <label className="login-input-label">Notes</label>
                    <div className="login-input-wrapper">
                      <textarea
                        name="notes"
                        rows="2"
                        value={patientForm.notes}
                        onChange={handlePatientChange}
                        placeholder="Any extra information for the doctor"
                        style={{ paddingLeft: '14px' }}
                      />
                    </div>
                  </div>
                </div>

                <button type="submit" className="login-submit-btn" style={{ marginTop: '15px' }}>
                  Create patient account <FiChevronRight />
                </button>
              </form>
            ) : (
              /* Sign-in Form */
              <form className="login-signin-form" onSubmit={handleSignInSubmit}>
                <div className="login-form-group">
                  <label className="login-input-label">Email Address</label>
                  <div className="login-input-wrapper">
                    <FiMail className="input-icon" />
                    <input
                      name="email"
                      type="email"
                      value={signInForm.email}
                      onChange={handleSignInChange}
                      placeholder="Enter your email address"
                      required
                    />
                  </div>
                </div>

                <div className="login-form-group">
                  <label className="login-input-label">Password</label>
                  <div className="login-input-wrapper">
                    <FiLock className="input-icon" />
                    <input
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      value={signInForm.password}
                      onChange={handleSignInChange}
                      placeholder="Enter your password"
                      required
                    />
                    <button
                      type="button"
                      className="password-toggle-btn"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <FiEyeOff /> : <FiEye />}
                    </button>
                  </div>
                </div>

                <div className="login-options-row">
                  <label className="login-remember-me">
                    <input type="checkbox" />
                    <span>Remember me</span>
                  </label>
                  <a href="#forgot" className="login-forgot-link">Forgot Password?</a>
                </div>

                <button type="submit" className="login-submit-btn">
                  Login <FiArrowRight className="submit-arrow" />
                </button>
              </form>
            )}

            <div className="login-or-divider">
              <span>or</span>
            </div>

            <button type="button" className="login-google-btn">
              <FcGoogle className="google-icon" /> Login with Google
            </button>

            <div className="login-card-footer">
              Don't have an account?{' '}
              <span className="login-card-footer-link" onClick={() => { if (role === 'patient') { setMode('register'); } else { setRole('patient'); setMode('register'); } }}>
                Contact administrator
              </span>
            </div>

            {helperNote && (
              <div className="login-credentials-note">
                <strong>{helperNote.heading}</strong>
                <p>{helperNote.text}</p>
              </div>
            )}
          </div>

          {/* Security Compliance badges below card */}
          <div className="login-security-badges">
            <div className="login-badge-item">
              <FiShield className="login-badge-icon" />
              <div className="login-badge-text">
                <span className="login-badge-title">HIPAA</span>
                <span className="login-badge-sub">Compliant</span>
              </div>
            </div>
            <div className="login-badge-item">
              <FiLock className="login-badge-icon" />
              <div className="login-badge-text">
                <span className="login-badge-title">Secure</span>
                <span className="login-badge-sub">Platform</span>
              </div>
            </div>
            <div className="login-badge-item">
              <FiCloud className="login-badge-icon" />
              <div className="login-badge-text">
                <span className="login-badge-title">Always</span>
                <span className="login-badge-sub">Available</span>
              </div>
            </div>
            <div className="login-badge-item">
              <FiHeadphones className="login-badge-icon" />
              <div className="login-badge-text">
                <span className="login-badge-title">24/7</span>
                <span className="login-badge-sub">Support</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
