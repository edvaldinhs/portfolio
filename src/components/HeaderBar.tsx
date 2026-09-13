import type { MouseEvent } from 'react'
import { useLenis } from '../hooks/useLenis'

export default function HeaderBar() {
  const { lenis } = useLenis()

  const scrollTo = (e: MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault()
    if (lenis) {
      lenis.scrollTo(href, { offset: 0, duration: 1.2 })
    } else {
      document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <header className="header-bar">
      <div className="logodiv">
        <img src="/img/ico.png" alt="Edinho" />
        <h1 className="logo">
          <span className="logotxt">Edvaldo Santos</span>
        </h1>
      </div>

      <nav>
        <a href="#projects" onClick={(e) => scrollTo(e, '#projects')}>
          Projects
        </a>
        <a href="#skills" onClick={(e) => scrollTo(e, '#skills')}>
          Skills
        </a>
      </nav>
    </header>
  )
}