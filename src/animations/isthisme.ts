import { useEffect } from 'react'
import type { RefObject } from 'react'
import { gsap, ScrollTrigger } from '../lib/gsap'

export function useIsThisMeAnimation(rootRef: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const root = rootRef.current
    if (!root) return
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reducedMotion) return

    const ctx = gsap.context(() => {
      const slideFromLeft = () => -(window.innerWidth + 300)

      gsap.fromTo(
        root.querySelectorAll<HTMLElement>('.isthisme-canvas'),
        { x: slideFromLeft },
        {
          x: 0,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: root,
            start: 'top 99%',
            end: 'top 1%',
            scrub: true,
          },
        },
      )

      gsap.fromTo(
        root.querySelectorAll<HTMLElement>('.isthisme-orb'),
        { x: slideFromLeft },
        {
          x: 0,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: root,
            start: 'top 99%',
            end: 'top 1%',
            scrub: true,
          },
        },
      )

      gsap.fromTo(
        root.querySelectorAll<HTMLElement>('.isthisme-h1'),
        { y: 120, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          ease: 'none',
          stagger: 0.06,
          scrollTrigger: {
            trigger: root,
            start: 'top 95%',
            end: 'top 5%',
            scrub: true,
          },
        },
      ) 
    }, root)

    

    ScrollTrigger.refresh()

    return () => ctx.revert()
  }, [rootRef])
}
