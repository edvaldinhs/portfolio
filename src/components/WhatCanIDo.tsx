import { useRef } from 'react'
import IsThisMe from './IsThisMe'
import WhatCanIDoPanel from './WhatCanIDoPanel'
import { useWhatCanIDoAnimation } from '../animations/whatCanIDo'

export default function WhatCanIDo() {
  const rootRef = useRef<HTMLElement>(null)

  useWhatCanIDoAnimation(rootRef)

  return (
    <section className="whatcanido" ref={rootRef}>
      <div className="whatcanido__track">
        <div className="whatcanido__panel whatcanido__panel--prev">
          <IsThisMe />
        </div>
        <div className="whatcanido__panel whatcanido__panel--next">
          <WhatCanIDoPanel />
        </div>
      </div>
    </section>
  )
}