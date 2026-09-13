import { useEffect, useRef } from 'react'
import { ParticleSimulation } from '../three/ParticleSimulation'

export default function ParticleCanvas() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    const sim = new ParticleSimulation(container)
    return () => sim.dispose()
  }, [])

  return <div id="canvas-container" className="ydde fade-up-2" ref={containerRef} />
}