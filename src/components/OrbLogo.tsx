import { useRef, type MouseEvent } from 'react'
import { gsap } from '../lib/gsap'

interface OrbLogoProps {
  href: string
  icon: 'instagram' | 'github'
  label: string
  className?: string
}

export default function OrbLogo({ href, icon, label, className = '' }: OrbLogoProps) {
  const ref = useRef<HTMLAnchorElement>(null)

  const handleMove = (e: MouseEvent<HTMLAnchorElement>) => {
    const el = ref.current
    if (!el) return
    const { left, top, width, height } = el.getBoundingClientRect()
    gsap.to(el, {
      x: (e.clientX - (left + width / 2)) * 0.45,
      y: (e.clientY - (top + height / 2)) * 0.45,
      duration: 0.5,
      ease: 'power3.out',
      overwrite: 'auto',
    })
  }

  const handleLeave = () => {
    const el = ref.current
    if (!el) return
    gsap.to(el, {
      x: 0,
      y: 0,
      duration: 0.7,
      ease: 'elastic.out(1, 0.45)',
      overwrite: 'auto',
    })
  }

  return (
    <a
      ref={ref}
      href={href}
      target="_blank"
      rel="noreferrer"
      aria-label={label}
      className={`orb-logo ${className}`}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
    >
      <span className="orb-logo__ring" aria-hidden="true" />
      <span className="orb-logo__core" aria-hidden="true">
        <i className={icon === 'github' ? 'fa-brands fa-github' : 'fa-brands fa-instagram'} />
      </span>
    </a>
  )
}