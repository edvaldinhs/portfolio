import { useEffect, type RefObject } from 'react'
import { gsap, ScrollTrigger } from '../lib/gsap'

export function useProjectsAnimation(rootRef: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const root = rootRef.current
    if (!root) return
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reducedMotion) return

    const fine = window.matchMedia('(any-hover: hover) and (pointer: fine)').matches
    const cleanups: (() => void)[] = []

    root.querySelectorAll<HTMLElement>('[data-scroll-parallax]').forEach((el) => {
      const raw = el.getAttribute('data-scroll-parallax') || ''
      const banner = el.closest<HTMLElement>('.projects__banner')
      const trigger = banner || el.parentElement
      if (!trigger) return

      const start = banner && !fine ? `top top+=${window.innerHeight}` : 'top bottom'

      const st = ScrollTrigger.create({
        trigger,
        start,
        end: 'bottom top',
        scrub: true,
        invalidateOnRefresh: true,
        onUpdate: ({ progress }) => {
          const u = progress * 2 - 1
          const d = parseFloat(raw)
          if (raw.includes('%')) gsap.set(el, { yPercent: u * d })
          else gsap.set(el, { y: u * d })
        },
      })
      cleanups.push(() => st.kill())
    })

    root.querySelectorAll<HTMLElement>('.projects__banner').forEach((banner) => {
      const media = banner.querySelector<HTMLElement>('.projects__media')
      const reveal = Array.from(
        banner.querySelectorAll<HTMLElement>('.projects__reveal'),
      )
      if (!media && !reveal.length) return

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: banner,
          start: 'top 75%',
          once: true,
        },
      })

      const st = tl.scrollTrigger
      cleanups.push(() => {
        st?.kill()
        tl.kill()
      })
    })

    const onLoad = () => {
      ScrollTrigger.refresh()
    }
    window.addEventListener('load', onLoad)

    const onResize = () => {
      ScrollTrigger.refresh()
    }
    window.addEventListener('resize', onResize)
    cleanups.push(() => {
      window.removeEventListener('load', onLoad)
      window.removeEventListener('resize', onResize)
    })

    return () => {
      cleanups.forEach((fn) => fn())
      ScrollTrigger.refresh()
    }
  }, [rootRef])
}