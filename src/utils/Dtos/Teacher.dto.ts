export interface TeacherDto {
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
