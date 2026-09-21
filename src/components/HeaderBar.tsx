import { useEffect, useRef, useState, type MouseEvent } from 'react'
import { createPortal } from 'react-dom'
import { useLenis } from '../hooks/useLenis'

const MENU_LINKS = [
  { label: 'Projects', href: '#projects', external: false },
  { label: 'Skills', href: '#skills', external: false },
  { label: 'GitHub', href: 'https://github.com/edvaldinhs', external: true },
  { label: 'Instagram', href: 'https://www.instagram.com/eddy.justeddy/', external: true },
  { label: 'LinkedIn', href: 'https://www.linkedin.com/in/edvaldo-santos-37a58640a/', external: true },
]

export default function HeaderBar() {
  const { lenis } = useLenis()
  const [open, setOpen] = useState(false)
  const wasOpen = useRef(false)

  useEffect(() => {
    const root = document.documentElement
    if (open) {
      root.classList.add('scroll-travado')
      lenis?.stop()
    } else if (wasOpen.current) {
      root.classList.remove('scroll-travado')
      lenis?.start()
    }
    wasOpen.current = open
  }, [open, lenis])

  const closeMenu = () => setOpen(false)

  const scrollTo = (e: MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault()
    closeMenu()
    lenis?.start()
    if (lenis) {
      lenis.scrollTo(href, { offset: 0, duration: 1.2 })
    } else {
      document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' })
    }
  }

  const handleLink = (
    e: MouseEvent<HTMLAnchorElement>,
    link: { label: string; href: string; external: boolean },
  ) => {
    if (link.external) {
      closeMenu()
      return
    }
    scrollTo(e, link.href)
  }

  return (
    <header className="header-bar">
      <div className="logodiv">
        <img src="/img/ico.png" alt="Edinho" />
        <h3 className="logo">
          <span className="logotxt">Edvaldo Henrique</span>
        </h3>
      </div>

      <nav className="header-nav-desktop">
        <a href="#projects" onClick={(e) => scrollTo(e, '#projects')}>
          Projects
        </a>
        <a href="#skills" onClick={(e) => scrollTo(e, '#skills')}>
          Skills
        </a>
      </nav>

      <button
        type="button"
        className={`menu-toggle ${open ? 'is-open' : ''}`}
        aria-label="Toggle menu"
        aria-expanded={open}
        aria-controls="mobile-menu"
        onClick={() => setOpen((v) => !v)}
      >
        <span />
        <span />
        <span />
      </button>

      {createPortal(
        <div
          id="mobile-menu"
          className={`mobile-menu ${open ? 'is-open' : ''}`}
          aria-hidden={!open}
          onClick={(e) => {
            if (e.target === e.currentTarget) closeMenu()
          }}
        >
          <nav className="mobile-menu__nav">
            {MENU_LINKS.map((link) => (
              <a key={link.href} href={link.href} onClick={(e) => handleLink(e, link)}>
                {link.label}
              </a>
            ))}
          </nav>
        </div>,
        document.body,
      )}
    </header>
  )
}