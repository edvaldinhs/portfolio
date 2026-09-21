import { useRef } from 'react'
import { useProjectsAnimation } from '../animations/projects'
import ProjectsIntro from './ProjectsIntro'
import ProjectCard from './ProjectCard'
import { PROJECTS } from '../data/projects'

export default function Projects() {
  const rootRef = useRef<HTMLElement>(null)

  useProjectsAnimation(rootRef)

  return (
    <section className="projects" id="projects" ref={rootRef}>
      <ProjectsIntro />
      {PROJECTS.map((project) => (
        <ProjectCard key={project.id} project={project} />
      ))}
    </section>
  )
}