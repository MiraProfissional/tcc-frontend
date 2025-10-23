import api from './api'
import config from '../../config/api'
import type { DisciplineDto, DisciplinesResponseDto } from '../Dtos/Discipline.dto'
import type { GenericDto } from '../Dtos/Generic.dto'
import type { CreateDisciplineDto } from '../Dtos/CreateDiscipline.dto'

export async function getDisciplinesByUser(): Promise<DisciplineDto[]> {
  try {
    const res = await api.get<DisciplinesResponseDto>(config.endpoints.disciplinesByUser)
    // unwrap the API wrapper and return just the data array
    return res.data.data
  } catch (err) {
    return Promise.reject(err)
  }
}

export async function getDisciplineById(id: string | number): Promise<DisciplineDto> {
  try {
    const res = await api.get<GenericDto<DisciplineDto>>(config.endpoints.disciplineById(id))
    // unwrap the API wrapper and return just the discipline object
    return res.data.data
  } catch (err) {
    return Promise.reject(err)
  }
}

export async function createDiscipline(data: CreateDisciplineDto): Promise<DisciplineDto> {
  try {
    const res = await api.post<GenericDto<DisciplineDto>>(config.endpoints.disciplines, data)
    // unwrap the API wrapper and return just the discipline object
    return res.data.data
  } catch (err) {
    return Promise.reject(err)
  }
}

export async function updateDiscipline(data: { 
  id: number
  name?: string
  code?: string
  semester?: string
  disciplineTime?: string[]
  disciplineRoom?: string
  ipCamera?: number | string
  students?: number[]
}): Promise<DisciplineDto> {
  try {
    const res = await api.patch<GenericDto<DisciplineDto>>(config.endpoints.disciplines, data)
    return res.data.data
  } catch (err) {
    return Promise.reject(err)
  }
}

export async function deleteDiscipline(id: number): Promise<void> {
  try {
    await api.delete(config.endpoints.disciplines, { params: { id } })
  } catch (err) {
    return Promise.reject(err)
  }
}

export async function removeStudentFromDiscipline(id: number, studentsIds: number[]): Promise<void> {
  try {
    await api.post('/disciplines/remove/student', { id, studentsIds })
  } catch (err) {
    return Promise.reject(err)
  }
}

export async function addStudentsToDiscipline(id: number, students: number[]): Promise<DisciplineDto> {
  try {
    const res = await api.patch<GenericDto<DisciplineDto>>(config.endpoints.disciplines, { id, students })
    return res.data.data
  } catch (err) {
    return Promise.reject(err)
  }
}

export default { getDisciplinesByUser, getDisciplineById, createDiscipline, updateDiscipline, deleteDiscipline, removeStudentFromDiscipline, addStudentsToDiscipline }
