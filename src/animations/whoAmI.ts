import { useEffect } from 'react'
import type { RefObject } from 'react'
import { gsap, ScrollTrigger } from '../lib/gsap'

export function useWhoAmIAnimation(rootRef: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const root = rootRef.current
    if (!root) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    ScrollTrigger.config({ ignoreMobileResize: true })

    const ctx = gsap.context(() => {
      root.querySelectorAll<HTMLElement>('.text-scroll-fade').forEach((el) => {
        gsap.fromTo(
          el,
          { '--mask-position': -40 } as gsap.TweenVars,
          {
            '--mask-position': 100,
            ease: 'none',
            scrollTrigger: { trigger: el, start: 'top 80%', end: 'bottom 60%', scrub: true },
          } as gsap.TweenVars,
        )
      })

      const overlay = root.querySelector<HTMLElement>('.whoami-overlay')
      const nextComponent = root.nextElementSibling
      if (overlay && nextComponent) {
        gsap.to(overlay, {
          opacity: 0,
          ease: 'none',
          scrollTrigger: {
            trigger: nextComponent,
            start: 'top bottom',
            end: 'top 40%',
            scrub: true,
          },
        })
      }

      root.querySelectorAll<HTMLElement>('.scribble-el').forEach((el) => {
        const paths = Array.from(el.querySelectorAll<SVGElement>('path, line, circle, rect, polyline, polygon'))
        if (!paths.length) return
        const trigger = el.parentElement || el
        gsap.fromTo(paths, { drawSVG: '0% 0%' }, {
          drawSVG: '0% 100%',
          duration: 1.2,
          ease: 'power2.inOut',
          scrollTrigger: { trigger, start: 'top 75%', toggleActions: 'play none none reverse' },
        })
      })
    }, root)

    ScrollTrigger.sort()
    ScrollTrigger.refresh()

    return () => {
      ctx.revert()
      ScrollTrigger.refresh()
    }
  }, [rootRef])
}