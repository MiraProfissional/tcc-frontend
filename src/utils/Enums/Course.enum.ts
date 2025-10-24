export const COURSES = {
  COMPUTER_SCIENCE: 'Ciência da Computação',
  INFORMATION_SYSTEMS: 'Sistemas de Informação',
  COMPUTER_ENGINEERING: 'Engenharia de Computação',
} as const

export type CourseType = typeof COURSES[keyof typeof COURSES]

export const courseOptions = Object.entries(COURSES).map(([, value]) => ({
  label: value,
  value,
}))

