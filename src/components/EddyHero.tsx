import { useEffect, useRef } from 'react'
import { mountModelViewer } from '../three/viewers'

export default function EddyHero() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    const display = mountModelViewer(container, 'eddy')
    return () => display.dispose()
  }, [])

  return <div className="eddy-hero-canvas" id="canvas-eddyhero" ref={containerRef} />
}