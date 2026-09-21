import { useEffect } from 'react'
import { gsap, ScrollTrigger } from '../lib/gsap'
import type { ParticleSimulation } from '../three/ParticleSimulation'

export function useOldHeroScrollAnimation(sim: ParticleSimulation | null) {
  useEffect(() => {
    if (!sim) return

    let stop: (() => void) | undefined

    const onReady = () => {
      stop = buildOldHeroScroll(sim)
    }

    window.addEventListener('simulation-loaded', onReady)

    return () => {
      window.removeEventListener('simulation-loaded', onReady)
      stop?.()
    }
  }, [sim])
}

function buildOldHeroScroll(sim: ParticleSimulation): () => void {
  const mm = gsap.matchMedia()
  const activeScale = sim.modelScale

  mm.add(
    {
      isDesktop: '(min-width: 769px)',
      isMobile: '(max-width: 768px)',
    },
    () => {
      gsap.set('.oldhero', { position: 'relative' })

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: '.oldhero',
          start: 'top top',
          end: '+=2000',
          scrub: 1,
          pin: true,
          anticipatePin: 1,
          pinType: 'fixed',
          fastScrollEnd: true,
          invalidateOnRefresh: true,
        },
      })

      tl.fromTo(
        '.oldhero__hint',
        { autoAlpha: 0, y: 60 },
        { autoAlpha: 1, y: 0, duration: 0.25, ease: 'power3.out' },
        0.75,
      )
        .to(sim.groupGLTF.rotation, { y: Math.PI, duration: 0.5, ease: 'power2.in' }, 0)
        .to(sim.groupGLTF.scale, { x: 0, y: 0, z: 0, duration: 0.5, ease: 'power2.in' }, 0)
        .to(
          sim.groupParticles.scale,
          { x: activeScale, y: activeScale, z: activeScale, duration: 0.5, ease: 'power2.out' },
          0.5,
        )
        .fromTo(
          sim.groupParticles.rotation,
          { y: -Math.PI },
          { y: 0, duration: 0.5, ease: 'power2.out' },
          0.5,
        )
        .fromTo(
          '.oldhero__title--top .oldhero__label--after',
          { xPercent: 300 },
          { xPercent: 0, duration: 0.5, ease: 'power2.inOut' },
          0.25,
        )
        .to(
          '.oldhero__title--top .oldhero__label--before',
          { xPercent: -300, duration: 0.4, ease: 'power2.inOut' },
          0.3,
        )
        .fromTo(
          '.oldhero__title--bottom .oldhero__label--after',
          { xPercent: -300 },
          { xPercent: 0, duration: 0.5, ease: 'power2.inOut' },
          0.25,
        )
        .to(
          '.oldhero__title--bottom .oldhero__label--before',
          { xPercent: 300, duration: 0.4, ease: 'power2.inOut' },
          0.3,
        )

      return () => gsap.set('.oldhero', { clearProps: 'all' })
    },
  )

  const onWindowLoad = () => {
    ScrollTrigger.refresh()
  }
  window.addEventListener('load', onWindowLoad)

  const onResize = () => {
    if (ScrollTrigger.getAll().length === 0) {
      const s = sim.modelScale
      sim.groupGLTF.scale.set(s, s, s)
    }
    ScrollTrigger.refresh()
  }
  window.addEventListener('resize', onResize)

  return () => {
    mm.revert()
    window.removeEventListener('load', onWindowLoad)
    window.removeEventListener('resize', onResize)
  }
}