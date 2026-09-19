import { useRef } from 'react'
import { useCardTilt } from '../hooks/useCardTilt'
import type { Project } from '../data/projects'
import ProjectImageCard from './ProjectImageCard'
import ProjectTextCard from './ProjectTextCard'

interface ProjectCardProps {
  project: Project
}

export default function ProjectCard({ project }: ProjectCardProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  useCardTilt(cardRef)

  const imageCard = <ProjectImageCard project={project} />
  const textCard = <ProjectTextCard project={project} />

  return (
    <div className="proj-card" id={project.id} ref={cardRef}>
      {project.imageFirst ? [imageCard, textCard] : [textCard, imageCard]}
    </div>
  )
}