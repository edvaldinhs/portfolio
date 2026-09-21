import type { Project } from '../data/projects'

interface ProjectTextCardProps {
  project: Project
}

export default function ProjectTextCard({ project }: ProjectTextCardProps) {
  return (
    <div className="projects__copy" data-scroll-parallax="100%">
      <div className="projects__copy-inner" data-scroll-parallax="-60">
        <div className="projects__line">
          <h2 className="projects__title projects__reveal">{project.name}</h2>
        </div>
      </div>
      <p className="sr">{project.description}</p>
    </div>
  )
}