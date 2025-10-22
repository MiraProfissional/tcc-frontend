export interface CreateDisciplineDto {
  name: string
  code: string
  semester: string
  disciplineTime: string[]
  disciplineRoom: string
  ipCamera: number | string
  students: number[]
}
