import { FiMail, FiMapPin, FiPhone } from 'react-icons/fi'
import InfoPageShell from '../components/InfoPageShell'

const contactCards = [
  {
    icon: FiPhone,
    title: 'Call us',
    text: '+91 98765 43210 for product and onboarding questions.',
  },
  {
    icon: FiMail,
    title: 'Email us',
    text: 'support@mediconnect.health for help, demos, and general inquiries.',
  },
  {
    icon: FiMapPin,
    title: 'Visit us',
    text: 'Remote-first support with onboarding across India and global time zones.',
  },
]

function ContactVisual() {
  return (
    <div className="page-visual page-visual--contact">
      <div className="page-visual__orb page-visual__orb--contact" aria-hidden="true" />
      <article className="page-visual__panel page-visual__panel--contact">
        <span className="page-visual__label">Supporting  desk</span>
        <strong>We respond with clear next steps, not auto-generated confusion.</strong>
        <p>Tell us what you are building and we will help you shape the right workflow.</p>
      </article>
    </div>
  )
}

export default function ContactUs() {
  return (
    <InfoPageShell
      eyebrow="Contact us"
      title="Let's talk about your care workflow."
      intro="Share what you need, whether that is a demo, onboarding help, or a quick question about MediConnect."
      visual={<ContactVisual />}
      cards={contactCards}
    >
      <section className="contact-grid">
        <form className="contact-form" onSubmit={(event) => event.preventDefault()}>
          <div className="contact-form__row">
            <label>
              Full name
              <input type="text" name="name" placeholder="Your name" />
            </label>
            <label>
              Email
              <input type="email" name="email" placeholder="you@example.com" />
            </label>
          </div>
          <label>
            Subject
            <input type="text" name="subject" placeholder="Tell us what you need" />
          </label>
          <label>
            Message
            <textarea name="message" rows="6" placeholder="Add a few details about your clinic or use case" />
          </label>
          <button type="submit" className="hero-cta contact-form__button">
            Send message
          </button>
        </form>

        <aside className="info-panel contact-note">
          <h2>What happens next</h2>
          <p>
            We will review your message and reply with the most relevant next step, whether
            that is a product walkthrough, support guidance, or setup help.
          </p>
          <p>
            If you are just getting started, the login page is ready for the next stage of
            the app and can be connected to backend auth later.
          </p>
        </aside>
      </section>
    </InfoPageShell>
  )
}
