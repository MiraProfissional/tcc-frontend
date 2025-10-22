import api from './api'
import config from '../../config/api'
import type { DisciplineDto, DisciplinesResponseDto } from '../Dtos/Discipline.dto'
import type { GenericDto } from '../Dtos/Generic.dto'

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

export default { getDisciplinesByUser, getDisciplineById }
