import HeaderBar from '../components/HeaderBar'
import HeroLogo from '../components/HeroLogo'
import Hero from '../components/Hero'
import Projects from '../components/Projects'
import Skills from '../components/Skills'
import Footer from '../components/Footer'

export default function Home() {
  return (
    <>
      <div className="container">
        <HeaderBar />
        <HeroLogo />
        <div className="line-divider" />
        <Hero />
        <Projects />
      </div>
      <div className="scroll-container">
        <Skills />
        <Footer />
      </div>
    </>
  )
}