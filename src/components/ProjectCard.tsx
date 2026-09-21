import type { Project } from '../data/projects'
import ProjectImageCard from './ProjectImageCard'
import ProjectTextCard from './ProjectTextCard'

interface ProjectCardProps {
  project: Project
}

export default function ProjectCard({ project }: ProjectCardProps) {
  return (
    <a
      className="projects__banner"
      id={project.id}
      href={project.url}
      target="_blank"
      rel="noreferrer"
      aria-label={`${project.name} — open repository`}
    >
      <ProjectImageCard project={project} />
      <ProjectTextCard project={project} />
    </a>
  )
}