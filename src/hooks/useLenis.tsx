import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import Lenis from 'lenis'
import { gsap, ScrollTrigger } from '../lib/gsap'

interface LenisContextValue {
  lenis: Lenis | null
  unlock: () => void
  isLocked: boolean
}

const LenisContext = createContext<LenisContextValue | undefined>(undefined)

export function LenisProvider({ children }: { children: ReactNode }) {
  const lenisRef = useRef<Lenis | null>(null)
  const [isLocked, setIsLocked] = useState(true)

  useEffect(() => {
    let lenis: Lenis | null = null
    const onTicker = (time: number) => {
      lenis?.raf(time * 1000)
    }

    lenis = new Lenis({
      lerp: 0.1,
      smoothWheel: true,
      autoRaf: false,
    })
    lenisRef.current = lenis

    lenis.on('scroll', ScrollTrigger.update)
    gsap.ticker.add(onTicker)
    gsap.ticker.lagSmoothing(0)

    lenis.stop()
    document.documentElement.classList.add('scroll-travado')

    return () => {
      gsap.ticker.remove(onTicker)
      lenis?.destroy()
      lenisRef.current = null
      document.documentElement.classList.remove('scroll-travado')
    }
  }, [])

  const unlock = () => {
    if (!lenisRef.current) return
    lenisRef.current.start()
    document.documentElement.classList.remove('scroll-travado')
    setIsLocked(false)
  }

  return (
    <LenisContext.Provider value={{ lenis: lenisRef.current, unlock, isLocked }}>
      {children}
    </LenisContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useLenis(): LenisContextValue {
  const ctx = useContext(LenisContext)
  if (!ctx) throw new Error('useLenis must be used within a LenisProvider')
  return ctx
}