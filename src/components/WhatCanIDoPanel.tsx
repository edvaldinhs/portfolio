import YddeWall from './YddeWall'
import OrbLogo from './OrbLogo'

export default function WhatCanIDoPanel() {
  return (
    <section className="whatcanido-hero">
      <div className="marginBackground"></div>
      <h1 className="whatcanido-h1 whatcanido-h1--is">What</h1>
      <h1 className="whatcanido-h1 whatcanido-h1--this">Can I</h1>
      <h1 className="whatcanido-h1 whatcanido-h1--me">Do?</h1>
      <h4 className="whatcanido-h4">Keep scrolling.</h4>
      <OrbLogo
        className="whatcanido-orb"
        href="https://github.com/edvaldinhs"
        icon="github"
        label="GitHub"
      />
      <div className="whatcanido-canvas" aria-hidden="true">
        <YddeWall src="YddeAttack.webm" />
      </div>
    </section>
  )
}