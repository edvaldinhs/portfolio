import { PROJECTS } from '../data/projects'
import ProjectCard from './ProjectCard'

export default function Projects() {
  return (
    <div className="projects">
      <div className="projecth" id="projects">
        <h1
          data-aos="fade-zoom-in"
          data-aos-easing="ease-in-back"
          data-aos-delay="150"
          data-aos-offset="0"
          data-aos-duration="500"
        >
          Projects
        </h1>
        <h2
          data-aos="fade-zoom-in"
          data-aos-easing="ease-in-back"
          data-aos-delay="300"
          data-aos-offset="0"
          data-aos-duration="800"
        >
          Showcase of My Projects
        </h2>
      </div>
      <div className="cards">
        <div className="cards">
          {PROJECTS.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      </div>
    </div>
  )
}