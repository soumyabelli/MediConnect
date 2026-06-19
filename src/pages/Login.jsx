import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { FiActivity, FiFileText, FiLock, FiMail, FiShield } from 'react-icons/fi'

export default function Login() {
  return (
    <main className="auth-page">
      <section className="auth-shell">
        <aside className="auth-copy">
          <span className="info-eyebrow">Secure login</span>
          <h1 className="auth-title">Welcome back to MediConnect.</h1>
          <p className="auth-intro">
            Sign in to continue with consultations, records, appointments, and follow-up
            tools in one protected workspace.
          </p>

          <div className="auth-points">
            <div className="auth-point">
              <FiShield aria-hidden="true" />
              <span>Protected access for patient and clinic data</span>
            </div>
            <div className="auth-point">
              <FiFileText aria-hidden="true" />
              <span>Quick access to records and visit history</span>
            </div>
            <div className="auth-point">
              <FiActivity aria-hidden="true" />
              <span>Simple workflow tracking for ongoing care</span>
            </div>
          </div>

          <Link to="/" className="inline-button inline-button--ghost">
            Return to home
          </Link>
        </aside>

        <form className="auth-card" onSubmit={(event) => event.preventDefault()}>
          <div className="auth-card__header">
            <span className="auth-card__eyebrow">Login</span>
            <h2>Sign in to your account</h2>
            <p>Use your email and password to open the secure dashboard.</p>
          </div>

          <label className="auth-field">
            Email address
            <div className="auth-input-wrap">
              <FiMail aria-hidden="true" />
              <input type="email" name="email" placeholder="you@example.com" />
            </div>
          </label>

          <label className="auth-field">
            Password
            <div className="auth-input-wrap">
              <FiLock aria-hidden="true" />
              <input type="password" name="password" placeholder="Enter your password" />
            </div>
          </label>

          <div className="auth-row">
            <label className="auth-check">
              <input type="checkbox" name="remember" />
              <span>Remember me</span>
            </label>
            <button type="button" className="auth-link-button">
              Forgot password?
            </button>
          </div>

          <button type="submit" className="hero-cta auth-card__button">
            Sign in
          </button>

          <p className="auth-card__footer">
            New here? Contact us first so we can set up the right access for your team.
          </p>
        </form>
      </section>
    </main>
  )
}
