import type { Project } from '../data/projects'

interface ProjectImageCardProps {
  project: Project
}

export default function ProjectImageCard({ project }: ProjectImageCardProps) {
  return (
    <div className="left-card">
      <div className={`reflection-container-${project.image}`} data-aos={project.flips}>
        <div className="reflection-content" />
      </div>
    </div>
  )
}