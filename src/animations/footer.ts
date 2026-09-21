import { useEffect } from 'react'
import { gsap, ScrollTrigger } from '../lib/gsap'

export function useFooterAnimation() {
  useEffect(() => {
    ScrollTrigger.config({ ignoreMobileResize: true })

    const part2 = document.querySelector<HTMLElement>('.part-2')

    if (!part2) return

    const ctx = gsap.context(() => {
      const revealTl = gsap.timeline({
        scrollTrigger: {
          trigger: '.scroll-container',
          start: 'bottom bottom',
          end: () => `+=${part2.offsetHeight}`,
          scrub: true,
          pin: true,
          invalidateOnRefresh: true,
          refreshPriority: -1,
        },
      })

      revealTl.to('.part-1', {
        y: () => -part2.offsetHeight,
        ease: 'none',
      })
    })

    ScrollTrigger.sort()
    ScrollTrigger.refresh()

    return () => {
      ctx.revert()
      ScrollTrigger.refresh()
    }
  }, [])
}