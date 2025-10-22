import api from './api'
import config from '../../config/api'
import type { DisciplineDto, DisciplinesResponseDto } from '../Dtos/Discipline.dto'

export async function getDisciplinesByUser(): Promise<DisciplineDto[]> {
  try {
    const res = await api.get<DisciplinesResponseDto>(config.endpoints.disciplinesByUser)
    // unwrap the API wrapper and return just the data array
    return res.data.data
  } catch (err) {
    return Promise.reject(err)
  }
}

export default { getDisciplinesByUser }
