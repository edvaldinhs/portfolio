import HeaderBar from '../components/HeaderBar'
import Projects from '../components/Projects'
import Skills from '../components/Skills'
import Footer from '../components/Footer'
import OldHero from '../components/OldHero'
import Hero from '../components/Hero'
import WhoAmI from '../components/WhoAmI'
import WhatCanIDo from '../components/WhatCanIDo'

export default function Home() {
  return (
    <>
      <div className="container">
        <HeaderBar />
        <div className="eddy-hero">
          <Hero />
        </div>
        <WhoAmI/>
        <WhatCanIDo />
        <OldHero />
        <Projects />
      </div>
      <div className="scroll-container">
        <Skills />
        <Footer />
      </div>
    </>
  )
}