import type { Timeline } from '../lib/gsap'

export function buildLanding(tl: Timeline) {
  tl.to(
    '#content',
    {
      opacity: 1,
      y: 0,
      duration: 1.2,
      ease: 'power4.out',
    },
    '-=0.4',
  )

  tl.from(
    '.hero-svg path',
    {
      y: 60,
      opacity: 0,
      duration: 0.8,
      stagger: { each: 0.12, from: 'random' },
      ease: 'power3.out',
    },
    '-=1.85',
  )

  tl.to(
    '.line-divider',
    {
      width: '100%',
      duration: 2.2,
      ease: 'power3.out',
    },
    '-=1.8',
  )

  tl.fromTo(
    '.eddy-hero-canvas',
    {
      opacity: 0},{
      opacity: 1,
      ease: 'power3.out',
      duration: 2.2,
    },
    '-=1.8',
  )

  tl.to(
    '.header-bar',
    {
      yPercent: 0,
      duration: 2.2,
      ease: 'power4.out',
    },
    '-=2',
  )

  tl.fromTo(
    '.fade-up',
    { y: 60, opacity: '0%' },
    { y: 0, opacity: '100%' },
    '-=2',
  )

  tl.fromTo('.fade-up-2', { opacity: '0%' }, { opacity: '100%' }, '-=1.5')
}