import api from './api'
import config from '../../config/api'
import type { DisciplineDto, DisciplinesResponseDto } from '../Dtos/Discipline.dto'
import type { GenericDto } from '../Dtos/Generic.dto'

export interface EnrollmentRequest {
  disciplineId: number
}

export interface EnrollmentResponse {
  message: string
}

/**
 * Get all available disciplines for enrollment
 */
export async function getAllDisciplines(): Promise<DisciplineDto[]> {
  try {
    const res = await api.get<DisciplinesResponseDto>('/disciplines/')
    // unwrap the API wrapper and return just the data array
    return res.data.data
  } catch (err) {
    return Promise.reject(err)
  }
}

/**
 * Enroll student in a discipline
 * Uses the same endpoint as teacher adding students: PATCH /disciplines with { id, students }
 */
export async function enrollInDiscipline(
  disciplineId: number,
  studentId: number
): Promise<DisciplineDto> {
  try {
    const res = await api.patch<GenericDto<DisciplineDto>>(
      config.endpoints.disciplines,
      { id: disciplineId, students: [studentId] }
    )
    return res.data.data
  } catch (err) {
    return Promise.reject(err)
  }
}

export default { getAllDisciplines, enrollInDiscipline }
