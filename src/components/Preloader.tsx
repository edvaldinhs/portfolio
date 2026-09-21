import { usePreloaderAnimation } from '../animations/preloader'

export default function Preloader() {
  const { hidden, counterRef, barFillRef, loaderRef } = usePreloaderAnimation()

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