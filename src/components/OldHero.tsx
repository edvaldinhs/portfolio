import ParticleCanvas from './ParticleCanvas'

export default function OldHero() {
  return (
    <main className="oldhero">
      <div className="oldhero__title oldhero__title--top">
        <h1 className="oldhero__label oldhero__label--before">SIMPLE</h1>
        <h1 className="oldhero__label oldhero__label--after">HUGE</h1>
      </div>
<div className="oldhero__title oldhero__title--bottom">
        <h1 className="oldhero__label oldhero__label--before">DESIGNS</h1>
        <h1 className="oldhero__label oldhero__label--after">IMPACT</h1>
      </div>
      <p className="oldhero__hint">hover your mouse</p>
      <ParticleCanvas />
    </main>
  )
}