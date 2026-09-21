import { useRef } from 'react'
import YddeWall from './YddeWall'
import OrbLogo from './OrbLogo'
import { useIsThisMeAnimation } from '../animations/isthisme'

export default function IsThisMe() {
  const rootRef = useRef<HTMLElement>(null)

  useIsThisMeAnimation(rootRef)

  return (
    <section className="isthisme" ref={rootRef}>
      <div className="isthisme-canvas" aria-hidden="true">
        <YddeWall src="YddeIdle.webm" />
      </div>
      <div className="isthisme-fig">
        <img className="isthisme-img" src="/img/edinhonovo.webp" alt="" />
        <div className="isthisme-caption">
          <h2 className="isthisme-caption__title">Edinho</h2>
          <p className="isthisme-caption__text">Very old photo btw, need to change as soon as possible</p>
        </div>
      </div>
      <OrbLogo
        className="isthisme-orb"
        href="https://www.instagram.com/eddy.justeddy/"
        icon="instagram"
        label="Instagram"
      />
      <h1 className="isthisme-h1 isthisme-h1--is">Is</h1>
      <h1 className="isthisme-h1 isthisme-h1--this">This</h1>
      <h1 className="isthisme-h1 isthisme-h1--me">Me?</h1>
      <h4 className="isthisme-h4">Yes!</h4>
    </section>
  )
}