import HeaderBar from '../components/HeaderBar'
import WhatCanIDoPanel from '../components/WhatCanIDoPanel'
import Skills from '../components/Skills'
import Footer from '../components/Footer'

export default function WhatCanIDoPage() {
  return (
    <>
      <div className="container">
        <HeaderBar />
        <WhatCanIDoPanel />
      </div>
      <div className="scroll-container">
        <Skills />
        <Footer />
      </div>
    </>
  )
}