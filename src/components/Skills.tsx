import { useEffect, useRef, useState } from 'react'
import { SKILLS, SKILL_CATEGORIES, type Skill, type SkillCategory } from '../data/skills'

export default function Skills() {
  const [filter, setFilter] = useState<SkillCategory | 'all'>('all')

  const visibleSkills = filter === 'all' ? SKILLS : SKILLS.filter((skill) => skill.categories.includes(filter))

  return (
    <section className="skills part-1">
      <div className="skills-title">
        <div className="s-set" id="skills">
          <h1
            data-aos="fade-zoom-in"
            data-aos-easing="ease-in-back"
            data-aos-delay="150"
            data-aos-offset="0"
            data-aos-duration="500"
          >
            Technical Skills
          </h1>
          <h2
            data-aos="fade-zoom-in"
            data-aos-easing="ease-in-back"
            data-aos-delay="300"
            data-aos-offset="0"
            data-aos-duration="800"
          >
            Technologies and frameworks I work with
          </h2>
        </div>
      </div>
      <div className="filter-buttons">
        {SKILL_CATEGORIES.map(({ key, label }) => (
          <button
            key={key}
            className={filter === key ? 'active' : ''}
            onClick={() => setFilter(key)}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="grid" key={filter}>
        {visibleSkills.map((skill, index) => (
          <SkillCard key={skill.name} skill={skill} index={index} />
        ))}
      </div>
    </section>
  )
}

function SkillCard({ skill, index }: { skill: Skill; index: number }) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const node = ref.current
    if (!node) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => node.classList.add('show'), index * 100)
          observer.disconnect()
        }
      },
      { threshold: 0.5 },
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [index])

  const classNames = ['lazy', 'fade-in', 'card', ...skill.categories].join(' ')

  return (
    <div className={classNames} ref={ref}>
      <img
        src={skill.icon}
        alt={skill.name}
        loading="lazy"
        style={skill.lightBackground ? { background: 'white', borderRadius: '50%' } : undefined}
      />
      <span>{skill.name}</span>
    </div>
  )
}