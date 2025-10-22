export interface DisciplineTeacherDto {
  id: number
  firstName: string
  lastName: string
  email: string
  dateBirth: string
  cpf: string
  cellphone: string
  registrationNumber: number
  userRole: 'TEACHER' | 'ADMIN'
  createDate: string
  updateDate: string
  deletedAt: string | null
}

export interface DisciplineStudentDto {
  id: number
  firstName: string
  lastName: string
  email: string
  dateBirth: string
  cpf: string
  cellphone: string
  registrationNumber: number
  userRole: 'STUDENT'
  createDate: string
  updateDate: string
  deletedAt: string | null
  course: string
}

export interface DisciplineDto {
  id: number
  name: string
  code: string
  semester: string
  disciplineTime: string[]
  disciplineRoom: string
  ipCamera: number
  teacher: DisciplineTeacherDto
  students: DisciplineStudentDto[]
  sessions: unknown[]
  createDate: string
  updateDate: string
  deletedAt: string | null
}

export interface DisciplinesResponseDto {
  apiVersion: string
  data: DisciplineDto[]
  meta: {
    itemsPerPage: number
    totalItems: number
    currentPage: number
    totalPages: number
  }
  links: {
    first: string
    last: string
    current: string
    next: string
    previous: string
  }
}
