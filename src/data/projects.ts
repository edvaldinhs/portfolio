export interface Project {
  id: string
  name: string
  description: string
  url: string
  video: string
  image: 'ydde' | 'gecco' | 'istudy' | 'yde' | 'mojito' | 'meupet'
  flips: 'flip-left' | 'flip-right'
  imageFirst: boolean
}

export const PROJECTS: Project[] = [
  {
    id: 'eddig',
    name: 'Eddig - RPG Memory Game',
    description:
      'A project developed for the PPI discipline with the objective of improving the techniques of python, django, HTML, CSS and Javascript, feat Marcelo Júnior',
    url: 'https://github.com/edvaldinhs/eddig-django',
    image: 'ydde',
    video: '/videos/ydde.mp4',
    flips: 'flip-left',
    imageFirst: true,
  },
  {
    id: 'gecco',
    name: 'Gecco - Generic Ecommerce',
    description:
      'An React generic ecommerce and api that could be used as prototype for future projects.',
    url: 'https://github.com/edvaldinhs/react-generic-ecommerce',
    image: 'gecco',
    video: '/videos/gecco.mp4',
    flips: 'flip-right',
    imageFirst: false,
  },
  {
    id: 'istudy',
    name: 'Istudy',
    description:
      'A gamified mobile application made in android studio (java) as a research project carried out at IFRN - Campus Santa Cruz',
    url: 'https://github.com/edvaldinhs/iStudy',
    image: 'istudy',
    video: '/videos/istudy.mp4',
    flips: 'flip-left',
    imageFirst: true,
  },
  {
    id: 'yde',
    name: 'Yde - Programming Language',
    description:
      'A LLVM programming language built to understand the process of building a compiler',
    url: 'https://github.com/edvaldinhs/yde-language',
    image: 'yde',
    video: '/videos/gecco.mp4',
    flips: 'flip-right',
    imageFirst: false,
  },
  {
    id: 'mojito',
    name: 'Mojito',
    description:
      'A responsive single-page cocktail website developed with React, JavaScript, and GSAP',
    url: 'https://github.com/edvaldinhs',
    image: 'mojito',
    video: '/videos/intro.mp4',
    flips: 'flip-left',
    imageFirst: true,
  },
  {
    id: 'meupet',
    name: 'MeuPet',
    description:
      'A pet management application with a REST API backend built with Spring Boot, Java, Hibernate, and PostgreSQL',
    url: 'https://github.com/rafael1109-moura/MeuPet',
    image: 'meupet',
    video: '/videos/ydde.mp4',
    flips: 'flip-right',
    imageFirst: false,
  },
]