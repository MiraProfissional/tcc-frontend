import type { StudentDto } from './Student.dto'
import type { TeacherDto } from './Teacher.dto'

export interface SessionDto {
  id: number
  day: string
  startedAt: string
  endedAt: string
  cameraIndex: number
  openedBy: TeacherDto
  presentStudents: StudentDto[]
  absentStudents: StudentDto[]
  createDate: string
  updateDate: string
  deletedAt: string | null
}

export interface SessionsResponseDto {
  apiVersion: string
  data: SessionDto[]
}
