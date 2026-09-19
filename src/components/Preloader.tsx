import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useLenis } from '../hooks/useLenis'

gsap.registerPlugin(ScrollTrigger)

const LOAD_TIMEOUT = 10000

export default function Preloader() {
  const counterRef = useRef<HTMLDivElement>(null)
  const barFillRef = useRef<HTMLDivElement>(null)
  const loaderRef = useRef<HTMLDivElement>(null)
  const [hidden, setHidden] = useState(false)
  const firedRef = useRef(false)
  const { unlock } = useLenis()

  useEffect(() => {
    const countObj = { value: 0 }

    const timerId = setTimeout(() => {
      if (countObj.value < 100) window.dispatchEvent(new Event('simulation-loaded'))
    }, LOAD_TIMEOUT)

    const progressTl = gsap.timeline()

    progressTl.to('.header-bar', {
      yPercent: -100,
      duration: 0,
      ease: 'power4.out',
    })

    progressTl.to(
      countObj,
      {
        value: 90,
        duration: 3,
        ease: 'power2.out',
        onUpdate: () => {
          if (counterRef.current) counterRef.current.textContent = String(Math.floor(countObj.value))
        },
      },
      0,
    )

    progressTl.to(
      barFillRef.current,
      {
        width: '90%',
        duration: 3,
        ease: 'power2.out',
      },
      0,
    )

    const onSimulationLoaded = () => {
      if (firedRef.current) return
      firedRef.current = true
      clearTimeout(timerId)
      progressTl.kill()

      gsap.to(countObj, {
        value: 100,
        duration: 0.8,
        ease: 'power2.out',
        onUpdate: () => {
          if (counterRef.current) counterRef.current.textContent = String(Math.floor(countObj.value))
        },
        onComplete: playExitAnimation,
      })

      gsap.to(barFillRef.current, {
        width: '100%',
        duration: 0.8,
        ease: 'power2.out',
      })
    }

    const playExitAnimation = () => {
      const exitTl = gsap.timeline({
        onComplete: () => setHidden(true),
      })

      exitTl.to('.counter, .bar-bg, .loader-gif', {
        opacity: 0,
        y: -30,
        duration: 0.4,
        ease: 'power2.in',
      })

      exitTl.to(loaderRef.current, {
        yPercent: -100,
        duration: 1.4,
        ease: 'power4.out',
      })

      exitTl.set('body', { overflow: 'auto' }, '<')
      exitTl.call(() => unlock(), undefined, '<')

      exitTl.to(
        '#content',
        {
          opacity: 1,
          y: 0,
          duration: 1.2,
          ease: 'power4.out',
        },
        '-=0.4',
      )

      exitTl.from(
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

      exitTl.to(
        '.line-divider',
        {
          width: '100%',
          duration: 2.2,
          ease: 'power3.out',
        },
        '-=1.8',
      )

      exitTl.to(
        '.header-bar',
        {
          yPercent: 0,
          duration: 2.2,
          ease: 'power4.out',
        },
        '-=2',
      )

      exitTl.fromTo(
        '.fade-up',
        { y: 60, opacity: '0%' },
        { y: 0, opacity: '100%' },
        '-=2',
      )

      exitTl.fromTo('.fade-up-2', { opacity: '0%' }, { opacity: '100%' }, '-=1.5')
    }

    window.addEventListener('simulation-loaded', onSimulationLoaded)

    return () => {
      clearTimeout(timerId)
      window.removeEventListener('simulation-loaded', onSimulationLoaded)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (hidden) return null

  return (
    <div id="loader" ref={loaderRef}>
      <div className="counter" ref={counterRef}>
        0
      </div>
      <img src="/img/edd.gif" className="loader-gif" alt="Loading..." />
      <div className="bar-bg">
        <div className="bar-fill" ref={barFillRef} />
      </div>
    </div>
  )
}