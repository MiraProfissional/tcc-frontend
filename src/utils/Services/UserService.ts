import api from './api'
import config from '../../config/api'
import type { GenericDto } from '../Dtos/Generic.dto'
import type { StudentDto } from '../Dtos/Student.dto'
import type { TeacherDto } from '../Dtos/Teacher.dto'

export async function signUpStudent(body: Record<string, unknown>) {
  return api.post(config.endpoints.students, body)
}

export async function signUpTeacher(body: Record<string, unknown>) {
  return api.post(config.endpoints.teachers, body)
}

export async function getProfile(): Promise<StudentDto | TeacherDto> {
  // read token from localStorage and decide endpoint
  try {
    const raw = localStorage.getItem('token')
    const parsed = raw ? JSON.parse(raw) : null
    const access = parsed?.accessToken
    if (!access) throw new Error('No token')
    // decode to get role
    // lazy import jwt-decode to avoid adding a hard dependency here
  const mod = await import('jwt-decode')
  const jwtDecode = ((mod as unknown) as { default?: (t: string) => unknown; jwtDecode?: (t: string) => unknown }).default ?? ((mod as unknown) as { default?: (t: string) => unknown; jwtDecode?: (t: string) => unknown }).jwtDecode
  const payload = jwtDecode!(access) as Record<string, unknown>
  // the backend may put the role in `userRole` or `role` claim — accept either
  const roleRaw = payload?.userRole ?? payload?.role ?? ''
  const role = String(roleRaw).toUpperCase()
  const isStudent = role.includes('STUDENT')
  const isTeacher = role.includes('TEACHER') || role.includes('ADMIN')
    const id = String(payload?.sub ?? '')
    if (!id) throw new Error('No subject in token')

    // debug logs to inspect what values we're sending to backend
    // no debug logs in production

    if (isStudent) {
      const url = `${config.endpoints.students}/${id}`
      const res = await api.get<GenericDto<StudentDto>>(`${url}`)
      // unwrap wrapper and return inner data
      return (res.data as GenericDto<StudentDto>).data
    }
    if (isTeacher) {
      const url = `${config.endpoints.teachers}/${id}`
      const res = await api.get<GenericDto<TeacherDto>>(`${url}`)
      return (res.data as GenericDto<TeacherDto>).data
    }

    // fallback: if role is unknown, try students first then teachers
    try {
      const url = `${config.endpoints.students}/${id}`
      const res = await api.get<GenericDto<StudentDto>>(`${url}`)
      return (res.data as GenericDto<StudentDto>).data
    } catch {
      const url = `${config.endpoints.teachers}/${id}`
      const res = await api.get<GenericDto<TeacherDto>>(`${url}`)
      return (res.data as GenericDto<TeacherDto>).data
    }
  } catch (err) {
    return Promise.reject(err)
  }
}

export default { signUpStudent, signUpTeacher, getProfile }
