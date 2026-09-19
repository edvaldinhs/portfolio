import type { MouseEvent } from 'react'
import { Link } from 'react-router-dom'
import { useLenis } from '../hooks/useLenis'
import ParticleCanvas from './ParticleCanvas'

export default function Hero() {
  const { lenis } = useLenis()

  const scrollToProjects = (e: MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()
    if (lenis) {
      lenis.scrollTo('#projects', { offset: 0, duration: 1.2 })
    } else {
      document.querySelector('#projects')?.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <main>
      <div className="content">
        <h5 className="fade-up">EDVALDO SANTOS</h5>
        <h1 className="fade-up">
          FULLSTACK
          <br />
          DEVELOPER
        </h1>

        <p className="description fade-up">
          I'm a Computer Science student who views coding as both a playground and a toolset. I enjoy building
          projects with complex structures to push my limits, but I'm equally at home developing web and Android
          apps. Every project is a chance to learn something new and build something useful or fun.
        </p>

        <p className="description fade-up">
          <a href="#projects" className="underline-fade" onClick={scrollToProjects}>
            View Projects
          </a>
          <span> or </span>
          <Link to="/about" className="underline-fade">
            Read About Me
          </Link>
        </p>
        <div className="buttons fade-up">
          <a href="https://github.com/edvaldinhs" target="_blank" rel="noreferrer" className="btn-signing-main">
            <span className="icon">
              <i className="fab fa-github" />
            </span>
            <span className="btn-text">Github</span>
          </a>
          <a
            href="https://www.instagram.com/eddy.justeddy/"
            target="_blank"
            rel="noreferrer"
            className="btn-signing-main"
          >
            <span className="icon">
              <i className="fa-brands fa-instagram" />
            </span>
            <span className="btn-text">Dm me!</span>
          </a>
        </div>
      </div>
      <img className="image-gradient fade-up-2" src="/img/gradient2.png" alt="gradient" />
      <ParticleCanvas />
      <div className="content2">
        <h5 className="fade-up">EDVALDO SANTOS</h5>
        <h1 className="fade-up">
          HOVER YOUR
          <br />
          MOUSE
        </h1>

        <p className="description fade-up">
          I love to build creative and fun projects just to mess around with different Technologies and learn them
          while I improve as a developer...
        </p>
      </div>
    </main>
  )
}