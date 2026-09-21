import type { Project } from '../data/projects'

interface ProjectImageCardProps {
  project: Project
}

export default function ProjectImageCard({ project }: ProjectImageCardProps) {
  return (
    <div className="projects__media work-banner" data-scroll-parallax="60%">
      <video muted autoPlay loop playsInline preload="auto" aria-hidden="true">
        <source src={project.video} type="video/mp4" />
      </video>
    </div>
  )
}