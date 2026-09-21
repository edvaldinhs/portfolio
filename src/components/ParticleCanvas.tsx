import { useEffect, useRef, useState } from 'react'
import { ParticleSimulation } from '../three/ParticleSimulation'
import { useOldHeroScrollAnimation } from '../animations/oldHero'

export default function ParticleCanvas() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [sim, setSim] = useState<ParticleSimulation | null>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    const simulation = new ParticleSimulation(container)
    setSim(simulation)
    return () => {
      simulation.dispose()
      setSim(null)
    }
  }, [])

  useOldHeroScrollAnimation(sim)

  return <div id="canvas-container" className="oldhero__scene" ref={containerRef} />
}