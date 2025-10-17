import api from './api'
import config from '../../config/api'

export async function signUpStudent(body: Record<string, unknown>) {
  return api.post(config.endpoints.students, body)
}

export async function signUpTeacher(body: Record<string, unknown>) {
  return api.post(config.endpoints.teachers, body)
}

export default { signUpStudent, signUpTeacher }
