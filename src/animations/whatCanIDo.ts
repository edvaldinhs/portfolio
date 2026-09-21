import { useEffect } from 'react'
import type { RefObject } from 'react'
import { gsap, ScrollTrigger } from '../lib/gsap'

export function useWhatCanIDoAnimation(rootRef: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const root = rootRef.current
    if (!root) return
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reducedMotion) return

    const ctx = gsap.context(() => {
      const prev = root.querySelector<HTMLElement>('.whatcanido__panel--prev')
      const next = root.querySelector<HTMLElement>('.whatcanido__panel--next')
      if (!prev || !next) return

      gsap.set(root, { position: 'relative' })

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: root,
          start: 'top top',
          end: () => '+=' + window.innerHeight,
          scrub: 1,
          pin: true,
          anticipatePin: 1,
          pinType: 'fixed',
          invalidateOnRefresh: true,
        },
      })

      tl.to(prev, { x: '-100vw', duration: 1, ease: 'none' }, 0)
        .to(next, { x: '-100vw', duration: 1, ease: 'none' }, 0)

      const prevCaption = root.querySelector<HTMLElement>(
        '.whatcanido__panel--prev .isthisme-caption',
      )
      if (prevCaption) {
        tl.fromTo(
          prevCaption,
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.25, ease: 'power2.out' },
          0.15,
        )
      }

      if (next) {
        const texts = Array.from(next.querySelectorAll<HTMLElement>('.whatcanido-h1, .whatcanido-h4'))
        if (texts.length) {
          tl.fromTo(
            texts,
            { y: 60, opacity: 0 },
            { y: 0, opacity: 1, stagger: 0.06, duration: 0.35, ease: 'none' },
            0.45,
          )
        }
      }
    }, root)

    ScrollTrigger.refresh()

    const onLoad = () => {
      ScrollTrigger.refresh()
    }
    window.addEventListener('load', onLoad)

    const onResize = () => {
      ScrollTrigger.refresh()
    }
    window.addEventListener('resize', onResize)

    return () => {
      window.removeEventListener('load', onLoad)
      window.removeEventListener('resize', onResize)
      ctx.revert()
    }
  }, [rootRef])
}