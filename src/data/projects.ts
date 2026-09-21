export interface Project {
  id: string
  name: string
  description: string
  url: string
  video: string
  preview: string
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
    video: '/videos/intro.mp4',
    preview: '/img/projects/Eddig_game.jpeg',
    flips: 'flip-left',
    imageFirst: true,
  },
  {
    id: 'istudy',
    name: 'Istudy',
    description:
      'A gamified mobile application made in android studio (java) as a research project carried out at IFRN - Campus Santa Cruz',
    url: 'https://github.com/edvaldinhs/iStudy',
    image: 'istudy',
    video: '/videos/intro.mp4',
    preview: '/img/projects/Istudy_preview.jpg',
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
    video: '/videos/intro.mp4',
    preview: '/img/projects/ydeLanguage.webp',
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
    preview: '/img/projects/Mojito_preview.jpeg',
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
    video: '/videos/intro.mp4',
    preview: '/img/projects/MeuPet_preview.jpg',
    flips: 'flip-right',
    imageFirst: false,
  },
]