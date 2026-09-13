import { useEffect, type RefObject } from 'react'

/**
 * Applies 3D tilt to the `.reflection-content` child of the given card
 * via mouse position (desktop) or device orientation (mobile).
 */
export function useCardTilt(cardRef: RefObject<HTMLDivElement | null>) {
  useEffect(() => {
    const card = cardRef.current
    if (!card) return
    const content = card.querySelector<HTMLElement>('.reflection-content')
    if (!content) return

    const onMouseMove = (e: MouseEvent) => {
      if (window.innerWidth < 1300) return
      const rect = card.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top

      const centerX = rect.width / 2
      const centerY = rect.height / 2

      const rotateX = ((y - centerY) / centerY) * -20
      const rotateY = ((x - centerX) / centerX) * 20

      content.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`
    }

    const onMouseLeave = () => {
      content.style.transform = 'rotateX(0deg) rotateY(0deg)'
    }

    const onDeviceOrientation = (e: DeviceOrientationEvent) => {
      if (window.innerWidth >= 1300) return
      const { beta, gamma } = e
      if (beta === null || gamma === null) return

      let rotateX = (beta - 45) * 0.5
      let rotateY = gamma * 0.6

      rotateX = Math.max(-20, Math.min(20, rotateX))
      rotateY = Math.max(-20, Math.min(20, rotateY))

      content.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`
    }

    card.addEventListener('mousemove', onMouseMove)
    card.addEventListener('mouseleave', onMouseLeave)
    window.addEventListener('deviceorientation', onDeviceOrientation)

    return () => {
      card.removeEventListener('mousemove', onMouseMove)
      card.removeEventListener('mouseleave', onMouseLeave)
      window.removeEventListener('deviceorientation', onDeviceOrientation)
    }
  }, [cardRef])
}