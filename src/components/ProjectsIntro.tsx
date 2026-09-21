export default function ProjectsIntro() {
  return (
    <div className="projects__banner projects__intro">
      <div className="projects__media work-banner" data-scroll-parallax="60%">
        <video muted autoPlay loop playsInline preload="auto" aria-label="Project showcase video">
          <source src="/videos/intro.mp4" type="video/mp4" />
        </video>
      </div>
      <div className="projects__copy" data-scroll-parallax="100%">
        <div className="projects__copy-inner" data-scroll-parallax="-60">
          <div className="projects__line">
            <h1 className="projects__title projects__reveal">PROJECTS</h1>
          </div>
        </div>
      </div>
    </div>
  )
}