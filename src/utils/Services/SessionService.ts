import api from './api'
import type { SessionDto, SessionsResponseDto } from '../Dtos/Session.dto'

export async function getSessionsByDiscipline(disciplineId: number): Promise<SessionDto[]> {
  try {
    const res = await api.get<SessionsResponseDto>(`/sessions/attrelated-discipline/${disciplineId}`)
    return res.data.data
  } catch (err) {
    return Promise.reject(err)
  }
}

export default { getSessionsByDiscipline }
