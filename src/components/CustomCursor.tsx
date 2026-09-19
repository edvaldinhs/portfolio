import { useEffect, useRef } from 'react'

export default function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const cursor = cursorRef.current
    if (!cursor) return

    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0

    if (isTouchDevice) {
      cursor.style.display = 'none'
      document.body.style.cursor = 'auto'
      document.querySelectorAll('a, button').forEach((el) => {
        ;(el as HTMLElement).style.cursor = 'pointer'
      })
      return
    }

    let mouseX = 0
    let mouseY = 0
    let cursorX = 0
    let cursorY = 0
    let rafId = 0

    const onMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX
      mouseY = e.clientY
    }

    const animateCursor = () => {
      cursorX += (mouseX - cursorX) * 0.15
      cursorY += (mouseY - cursorY) * 0.15
      cursor.style.transform = `translate3d(calc(${cursorX}px - 50%), calc(${cursorY}px - 50%), 0)`
      rafId = requestAnimationFrame(animateCursor)
    }

    const onEnter = () => document.body.classList.add('hovering-link')
    const onLeave = () => document.body.classList.remove('hovering-link')

    const interactables = document.querySelectorAll('a, button, .tag, .btn-signing, .btn-get-started')
    interactables.forEach((el) => {
      el.addEventListener('mouseenter', onEnter)
      el.addEventListener('mouseleave', onLeave)
    })

    document.addEventListener('mousemove', onMouseMove)
    animateCursor()

    return () => {
      cancelAnimationFrame(rafId)
      document.removeEventListener('mousemove', onMouseMove)
      interactables.forEach((el) => {
        el.removeEventListener('mouseenter', onEnter)
        el.removeEventListener('mouseleave', onLeave)
      })
      document.body.classList.remove('hovering-link')
      document.body.style.cursor = ''
    }
  }, [])

  return <div id="custom-cursor" ref={cursorRef} />
}