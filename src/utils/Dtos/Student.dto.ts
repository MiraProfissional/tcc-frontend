export interface StudentDto {
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


