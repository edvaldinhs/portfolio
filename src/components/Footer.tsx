import { type MouseEvent } from 'react'
import { Link } from 'react-router-dom'
import { useLenis } from '../hooks/useLenis'
import { useFooterAnimation } from '../animations/footer'

const CONTACT_URL =
  'https://mail.google.com/mail/u/0/?view=cm&fs=1&to=edvaldo.s.dimap@gmail.com'

export default function Footer() {
  const { lenis } = useLenis()

  useFooterAnimation()

  const scrollToAnchor = (e: MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault()
    if (lenis) {
      lenis.scrollTo(href, { offset: 0, duration: 1.2 })
    } else {
      document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <section className="footer-section part-2">
      <div className="footer-root footer-dark">
        <div className="footer-container">
          <div className="footer-content">
            <div className="footer-grid">
              <div className="span-12 span-sm-8 span-md-6">
                <h3>
                  <span className="d-inline d-lg-block f-text">I would love to hear from you...</span>
                </h3>
                <h3>
                  <span className="d-inline d-lg-block f-text">Want help creating a project?</span>
                </h3>
                <a id="cta-contact-footer" className="arrow-link-wrapper footer-large-button" target="_blank" rel="noreferrer" href={CONTACT_URL}>
                  <svg width=".5em" height=".5em" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" data-arrow="1">
                    <path
                      d="M2.1573 18L15.1348 5.02247V17.5955L18 14.6966V0H3.33708L0.438203 2.89888H12.9775L0 15.8764L2.1573 18Z"
                      fill="currentcolor"
                    />
                  </svg>
                  <span>Let's Talk</span>
                  <svg width=".5em" height=".5em" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" data-arrow="2">
                    <path
                      d="M2.1573 18L15.1348 5.02247V17.5955L18 14.6966V0H3.33708L0.438203 2.89888H12.9775L0 15.8764L2.1573 18Z"
                      fill="currentcolor"
                    />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <div className="line-divider fgetc"></div>
        <div className="footer-grid">
          <div className="span-2 footer-brand">
            <Link className="footer-logo" to="/">
              <span className="sr-only">Edinho</span>
              <p>Edinho</p>
            </Link>
          </div>

          <div className="span-8 span-md-2 start-1 start-md-4 footer-office-info" />

          <div className="span-4 span-md-2 footer-links footer-policy" />

          <div className="span-4 span-md-2 span-lg-1 start-md-8 start-lg-10 footer-links">
            <ul>
              <li>
                <a target="_blank" rel="noreferrer" href="https://github.com/edvaldinhs">
                  Github
                </a>
              </li>
              <li>
                <a target="_blank" rel="noreferrer" href="https://www.instagram.com/eddy.justeddy/">
                  Instagram
                </a>
              </li>
              <li>
                <a target="_blank" rel="noreferrer" href="https://www.linkedin.com/in/edvaldo-santos-37a58640a/">
                  Linkedin
                </a>
              </li>
            </ul>
          </div>

          <div className="span-4 span-md-1 footer-links">
            <ul>
              <li>
                <a href="#projects" onClick={(e) => scrollToAnchor(e, '#projects')}>
                  Projects
                </a>
              </li>
              <li>
                <a href="#skills" onClick={(e) => scrollToAnchor(e, '#skills')}>
                  Skills
                </a>
              </li>
            </ul>
          </div>

          <div className="span-4 start-md-12 span-md-2 span-lg-1 footer-links">
            <a href={CONTACT_URL}>Let's Talk</a>
          </div>
        </div>
      </div>
    </section>
  )
}