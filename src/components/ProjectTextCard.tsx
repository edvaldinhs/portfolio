import type { Project } from '../data/projects'

interface ProjectTextCardProps {
  project: Project
}

export default function ProjectTextCard({ project }: ProjectTextCardProps) {
  return (
    <div className="right-card">
      <div className="card-content">
        <h3>{project.name}</h3>
        <p className="description">{project.description}</p>
        <div className="dpinline">
          <a target="_blank" rel="noreferrer" href={project.url} className="btn-get-started">
            Documentation &gt;
          </a>
        </div>
      </div>
    </div>
  )
}